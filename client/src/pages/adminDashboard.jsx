import { useEffect, useState } from "react";
import { socket } from "../socket";
import QueueList from "../components/QueueList";
import CallNextButton from "../components/CallNextButton";
import ServingPanel from "../components/ServingPanel";

export default function AdminDashboard() {
  const [queue, setQueue] = useState([]);

  const fetchQueue = async () => {
    const res = await fetch("http://localhost:5000/api/admin/queue");
    const data = await res.json();
    setQueue(data);
  };

  useEffect(() => {
    fetchQueue();

    socket.on("queue-updated", (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => socket.off("queue-updated");
  }, []);

  const currentServing = queue.find((t) => t.status === "serving");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Live Queue Dashboard</h1>

      <CallNextButton />

      <ServingPanel current={currentServing} />

      <QueueList queue={queue} />
    </div>
  );
}
