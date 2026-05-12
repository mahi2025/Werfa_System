import pool from "../db/index.js";

export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, fullname, university_id, email, created_at
      FROM students
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get queue for admin dashboard
export const getQueue = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT t.*, s.fullname
            FROM tickets t
            JOIN students s ON s.id = t.student_id
            ORDER BY t.queue_position ASC
        `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const callNextStudent = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Finish current serving ticket
    await client.query(`
      UPDATE tickets
      SET status = 'done'
      WHERE status = 'serving'
    `);

    // Get next waiting ticket
    const nextTicket = await client.query(`
      SELECT id
      FROM tickets
      WHERE status = 'waiting'
      ORDER BY queue_position ASC
      LIMIT 1
    `);

    if (nextTicket.rows.length > 0) {
      await client.query(
        `
        UPDATE tickets
        SET status = 'serving'
        WHERE id = $1
      `,
        [nextTicket.rows[0].id],
      );
    }

    await client.query("COMMIT");

    // Updated queue
    const updatedQueue = await pool.query(`
      SELECT t.*, s.fullname
      FROM tickets t
      JOIN students s ON s.id = t.student_id
      ORDER BY t.queue_position ASC
    `);

    req.io.emit("queue-updated", updatedQueue.rows);

    res.json({
      message: "Next student called",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: err.message,
    });
  } finally {
    client.release();
  }
};

    
export const markTicketDone = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE tickets
      SET status = 'done'
      WHERE id = $1
      AND status = 'serving'
      RETURNING *
    `,
      [ticketId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Serving ticket not found",
      });
    }

    const updatedQueue = await pool.query(`
      SELECT t.*, s.fullname
      FROM tickets t
      JOIN students s ON s.id = t.student_id
      ORDER BY t.queue_position ASC
    `);

    req.io.emit("queue-updated", updatedQueue.rows);

    res.json({
      message: "Ticket completed",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
