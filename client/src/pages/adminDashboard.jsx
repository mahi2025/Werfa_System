import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function AdminDashboard() {
  const [queue, setQueue] = useState([]);

  const fetchQueue = async () => {
    const res = await fetch("http://localhost:5000/api/admin/queue");
    const data = await res.json();
    setQueue(data);
  };

  useEffect(() => {
    // initial load
    fetchQueue();

    socket.on("queue-updated", (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => {
      socket.off("queue-updated");
    };
  }, []);

  return (
    <div>
      <h1>Live Queue</h1>

      {queue.map((t) => (
        <div key={t.id}>
          {t.ticket_number} - {t.fullname} - {t.status}
        </div>
      ))}
    </div>
  );
}
