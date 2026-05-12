export const generateTicketNumber = async (pool) => {
  const result = await pool.query(
    "SELECT ticket_number FROM tickets ORDER BY created_at DESC LIMIT 1",
  );

  const last = result.rows[0];

  if (!last) return "TK-001";

  const number = parseInt(last.ticket_number.split("-")[1]);
  const next = number + 1;

  return `TK-${String(next).padStart(3, "0")}`;
};

export const getNextQueuePosition = async (pool) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM tickets WHERE status = 'waiting'",
  );

  return parseInt(result.rows[0].count) + 1;
};

export const calculateWaitTime = async (pool) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM tickets WHERE status = 'waiting'",
  );

  const avgServiceTime = 5; // minutes per student

  return parseInt(result.rows[0].count) * avgServiceTime;
};