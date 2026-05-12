import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import pool from "../db/index.js";

export const registerStudent = async (req, res) => {
  const { fullname, university_id, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO students 
            (fullname, university_id, email, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, fullname, email`,
      [fullname, university_id, email, hashedPassword],
    );

    res.status(201).json({
      message: "Student registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM students WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //compare passwords
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      role: user.role || "student",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//admin login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   const token = generateToken(
     {
       id: admin.id,
       role: "admin",
     },
     "7d",
   );

    return res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        fullname: admin.fullname,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
