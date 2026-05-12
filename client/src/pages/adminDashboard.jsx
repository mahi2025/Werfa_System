// AdminDashboard.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Use navigate instead of window.location
import { socket } from "../socket";
import QueueList from "../components/QueueList";
import CallNextButton from "../components/CallNextButton";
import ServingPanel from "../components/ServingPanel";

export default function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchQueue = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (queue.length === 0) setLoading(true);

      const res = await fetch("http://localhost:5000/api/admin/queue", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setQueue(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        // Only redirect if the token is actually expired or invalid
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        setError(data.message || "Failed to fetch queue");
      }
    } catch (err) {
      setError("Connection to server failed.");
    } finally {
      setLoading(false);
    }
  }, [navigate, queue.length]);

  useEffect(() => {
    fetchQueue();

    socket.on("queue-updated", (updatedQueue) => {
      setQueue(Array.isArray(updatedQueue) ? updatedQueue : []);
    });

    return () => {
      socket.off("queue-updated");
    };
  }, [fetchQueue]);

  const currentServing = queue.find((t) => t.status === "serving") || null;

  if (loading)
    return <div style={{ padding: "20px" }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <header
        style={{
          borderBottom: "1px solid #ccc",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1>Live Queue Dashboard</h1>
          <p>
            Status: <span style={{ color: "green" }}>● Live</span>
          </p>
        </div>
        {/* Added a Logout button for convenience */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/Login");
          }}
          style={{ height: "40px", marginTop: "20px" }}
        >
          Logout
        </button>
      </header>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <main style={{ display: "grid", gap: "20px" }}>
        <section>
          <ServingPanel current={currentServing} />
          <div style={{ marginTop: "15px" }}>
            <CallNextButton onActionSuccess={fetchQueue} />
          </div>
        </section>
        <section>
          <h3>Waitlist</h3>
          <QueueList queue={queue} />
        </section>
      </main>
    </div>
  );
}
