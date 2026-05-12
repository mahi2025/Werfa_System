export default function QueueList({ queue }) {
  return (
    <div>
      <h2>Waiting Queue</h2>

      {queue.map((t) => (
        <div key={t.id}>
           {t.ticket_number} |  {t.fullname} |  {t.status}
        </div>
      ))}
    </div>
  );
}
