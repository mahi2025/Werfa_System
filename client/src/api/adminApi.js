const API_URL = "http://localhost:5000/api";

export async function fetchQueueData(token) {
  const response = await fetch(`${API_URL}/admin/queue`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to fetch queue",
    };
  }

  return data;
}
