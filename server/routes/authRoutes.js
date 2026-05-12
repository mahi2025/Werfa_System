import express from "express";

import {
  registerStudent,
  loginStudent,
  adminLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);

router.post("/admin/login", adminLogin);

export default router;
