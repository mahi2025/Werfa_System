export const getAllStudents = async (req, res) => {
  const result = await pool.query(
    "SELECT id, fullname, email, university_id FROM students",
  );

  res.json(result.rows);
};

export const getQueue = async (req, res) => {
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

  res.json(result.rows);
};

export const callNextStudent = async (req, res) => {
  await pool.query(`
        UPDATE tickets
        SET status = 'serving'
        WHERE queue_position = (
            SELECT MIN(queue_position)
            FROM tickets
            WHERE status = 'waiting'
        )
    `);

    const updatedQueue = await getUpdatedQueue(pool);
     req.io.emit("queue-updated", updatedQueue);
  res.json({ message: "Next student called" });
};

export const markTicketDone = async (req, res) => {
  const { ticketId } = req.params;

  await pool.query("UPDATE tickets SET status = 'done' WHERE id = $1", [
    ticketId,
  ]);


  res.json({ message: "Ticket completed" });
};

