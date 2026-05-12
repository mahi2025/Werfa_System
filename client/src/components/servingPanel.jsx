export default function ServingPanel({ current }) {
  return (
    <div style={{ margin: "20px 0" }}>
      <h2> NOW SERVING</h2>

      {current ? (
        <h1>
           {current.ticket_number} - {current.fullname}
        </h1>
      ) : (
        <h3>No one is being served</h3>
      )}
    </div>
  );
}
