import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";

import {
  getAllStudents,
  getQueue,
  callNextStudent,
  markTicketDone,
} from "../controllers/adminController.js";

const router = express.Router();
