import pool from "../db/index.js";

import {
  generateTicketNumber,
  getNextQueuePosition,
  calculateWaitTime,
} from "../services/tickets_service.js";

export const createTicket = async (req, res) => {
  const studentId = req.user.id;

  try {
    //generate ticket number
    const lastTicket = await pool.query(
      "SELECT ticket_number FROM tickets ORDER BY created_at DESC LIMIT 1",
    );

    let ticketNumber = "TK-001";

    if (lastTicket.rows.length > 0) {
      const lastNumber = parseInt(
        lastTicket.rows[0].ticket_number.split("-")[1],
      );
      ticketNumber = `TK-${String(lastNumber + 1).padStart(3, "0")}`;
    }

    //queue status
    const count = await pool.query(
      "SELECT COUNT(*) FROM tickets WHERE status = 'waiting'",
    );

    const queuePosition = parseInt(count.rows[0].count) + 1;

    //insert ticket
    const result = await pool.query(
      `INSERT INTO tickets 
            (student_id, ticket_number, queue_position)
            VALUES ($1, $2, $3)
            RETURNING *`,
      [studentId, ticketNumber, queuePosition],
    );

    //real-time update
    const updatedQueue = await pool.query(`
            SELECT t.*, s.fullname
            FROM tickets t
            JOIN students s ON s.id = t.student_id
            ORDER BY t.queue_position ASC
        `);

    req.io.emit("queue-updated", updatedQueue.rows);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
