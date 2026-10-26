
import { useCallback, useEffect, useState } from "react";
import {
  fetchTasks,
  fetchTaskStats,
  updateTask,
} from "./api";
import TaskItem from "./TaskItem";

const USERS = ["alice", "bob", "carol"];

const EMPTY_STATS = {
  todo: 0,
  in_progress: 0,
  done: 0,
  overdue: 0,
};

export default function App() {
  const [user, setUser] = useState("alice");
  const [status, setStatus] = useState("");
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    const data = await fetchTaskStats(user);
    setStats(data);
  }, [user]);

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      setError(null);

      try {
        const data = await fetchTasks(user, status);
        if (active) {
          setTasks(data.results);
          setTotal(data.count);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadTasks();

    return () => {
      active = false;
    };
  }, [user, status]);

  useEffect(() => {
    let active = true;

    fetchTaskStats(user)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleMarkDone = async (task) => {
    try {
      await updateTask(user, task.id, { status: "done" });

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, status: "done", is_overdue: false }
            : item
        )
      );

      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Task Tracker</h1>

      <div className="controls">
        <label>
          Logged in as{" "}
          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
          >
            {USERS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>

        <label>
          Status{" "}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <section className="stats" aria-label="Task statistics">
        <div>To do: <strong>{stats.todo}</strong></div>
        <div>In progress: <strong>{stats.in_progress}</strong></div>
        <div>Done: <strong>{stats.done}</strong></div>
        <div>Overdue: <strong>{stats.overdue}</strong></div>
      </section>

      {error && <p className="error">{error}</p>}

      <p className="meta">{total} tasks</p>

      <ul className="tasks">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onMarkDone={handleMarkDone}
          />
        ))}
      </ul>
    </div>
  );
}
