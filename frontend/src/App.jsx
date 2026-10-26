
import { useEffect, useState } from "react";
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
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setError("");

      try {
        const [taskData, statsData] = await Promise.all([
          fetchTasks(user, status),
          fetchTaskStats(user),
        ]);

        if (!active) return;

        setTasks(taskData.results);
        setTotal(taskData.count);
        setStats(statsData);
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load tasks.");
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [user, status]);

  async function handleMarkDone(task) {
    setUpdatingTaskId(task.id);
    setError("");

    try {
      await updateTask(user, task.id, { status: "done" });

      // Reload the filtered list and stats from the backend.
      const [taskData, statsData] = await Promise.all([
        fetchTasks(user, status),
        fetchTaskStats(user),
      ]);

      setTasks(taskData.results);
      setTotal(taskData.count);
      setStats(statsData);
    } catch (err) {
      setError(err.message || "Failed to update task.");
    } finally {
      setUpdatingTaskId(null);
    }
  }

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
            {USERS.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
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
        <div>
          To do: <strong>{stats.todo}</strong>
        </div>
        <div>
          In progress: <strong>{stats.in_progress}</strong>
        </div>
        <div>
          Done: <strong>{stats.done}</strong>
        </div>
        <div>
          Overdue: <strong>{stats.overdue}</strong>
        </div>
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      <p className="meta">{total} tasks</p>

      <ul className="tasks">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onMarkDone={handleMarkDone}
            isUpdating={updatingTaskId === task.id}
          />
        ))}
      </ul>
    </div>
  );
}
