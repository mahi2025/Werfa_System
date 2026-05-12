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
  try {
    //update from waiting to serving
    await pool.query(`
            UPDATE tickets
            SET status = 'serving'
            WHERE queue_position = (
                SELECT MIN(queue_position)
                FROM tickets
                WHERE status = 'waiting'
            )
        `);

    //fetch updated queue
    const updatedQueue = await pool.query(`
            SELECT t.*, s.fullname
            FROM tickets t
            JOIN students s ON s.id = t.student_id
            ORDER BY t.queue_position ASC
        `);

    //real-time update
    req.io.emit("queue-updated", updatedQueue.rows);

    res.json({ message: "Next student called" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markTicketDone = async (req, res) => {
  const { ticketId } = req.params;

  try {
    await pool.query(`UPDATE tickets SET status = 'done' WHERE id = $1`, [
      ticketId,
    ]);

    const updatedQueue = await pool.query(`
            SELECT t.*, s.fullname
            FROM tickets t
            JOIN students s ON s.id = t.student_id
            ORDER BY t.queue_position ASC
        `);

    req.io.emit("queue-updated", updatedQueue.rows);

    res.json({ message: "Ticket completed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
