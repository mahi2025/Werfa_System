import pool from "../db/index.js";
import {
  generateTicketNumber,
  getNextQueuePosition,
  calculateWaitTime,
} from "../services/tickets_service.js";

export const createTicket = async (req, res) => {
  const studentId = req.user.id;

  const ticketNumber = await generateTicketNumber(pool);
  const queuePosition = await getNextQueuePosition(pool);
  const estimatedWait = await calculateWaitTime(pool);

  const result = await pool.query(
    `INSERT INTO tickets 
        (student_id, ticket_number, queue_position, estimated_wait)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
    [studentId, ticketNumber, queuePosition, estimatedWait],
  );

  res.json(result.rows[0]);
};
const getUpdatedQueue = async (pool) => {
  const result = await pool.query(`
        SELECT 
            t.id,
            t.ticket_number,
            t.queue_position,
            t.status,
            s.fullname
        FROM tickets t
        JOIN students s ON s.id = t.student_id
        ORDER BY t.queue_position ASC
    `);

  return result.rows;
};