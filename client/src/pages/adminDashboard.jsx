import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 

import QueueList from "../components/QueueList";
import CallNextButton from "../components/CallNextButton";
import ServingPanel from "../components/ServingPanel";

import { socket } from "../socket";
import { fetchQueueData } from "../api/adminApi";
import { getToken, removeToken } from "../utils/auth";

export default function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadQueue = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);

      const data = await fetchQueueData(token);

      setQueue(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      if (err.status === 401) {
        removeToken();
        navigate("/login");
        return;
      }

      setError(err.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadQueue();

    socket.on("queue-updated", (updatedQueue) => {
      setQueue(updatedQueue || []);
    });

    return () => {
      socket.off("queue-updated");
    };
  }, [loadQueue]);

  const currentServing =
    queue.find((ticket) => ticket.status === "serving") || null;

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  if (loading) {
    return <h2 className="center">Loading Dashboard...</h2>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Live Queue Dashboard</h1>
          <p className="live-status">● Live</p>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {error && <p className="error-text">{error}</p>}

      <main className="dashboard-content">
        <section>
          <ServingPanel current={currentServing} />

          <div className="action-area">
            <CallNextButton onActionSuccess={loadQueue} />
          </div>
        </section>

        <section>
          <h2>Waitlist</h2>
          <QueueList queue={queue} />
        </section>
      </main>
    </div>
  );
}
