
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const PASSWORD = "password123";

function authHeader(username) {
  return "Basic " + btoa(`${username}:${PASSWORD}`);
}

async function request(username, path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(username),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json();
}

export function fetchTasks(username, status) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);

  const query = params.toString();
  return request(
    username,
    `/tasks/${query ? `?${query}` : ""}`
  );
}

export function fetchTaskStats(username) {
  return request(username, "/tasks/stats/");
}

export function updateTask(username, id, data) {
  return request(username, `/tasks/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}





// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
// const PASSWORD = "password123"; // demo users only

// function authHeader(username) {
//   return "Basic " + btoa(`${username}:${PASSWORD}`);
// }

// export async function fetchTasks(username, status) {
//   const url = new URL(`${BASE_URL}/tasks/`);
//   if (status) url.searchParams.set("status", status);
//   const res = await fetch(url, { headers: { Authorization: authHeader(username) } });
//   if (!res.ok) throw new Error(`Failed to load tasks (${res.status})`);
//   return res.json();
// }

// export async function updateTask(username, id, data) {
//   const res = await fetch(`${BASE_URL}/tasks/${id}/`, {
//     method: "PATCH",
//     headers: {
//       Authorization: authHeader(username),
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   if (!res.ok) throw new Error(`Failed to update task (${res.status})`);
//   return res.json();
// }
