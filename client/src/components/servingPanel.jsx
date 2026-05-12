function ServingScreen({ current }) {
  return (
    <div>
      <h1>NOW SERVING</h1>
      <h2>{current?.ticket_number}</h2>
    </div>
  );
}
