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

router.use(authMiddleware);
router.use(adminOnly);


router.get("/students", getAllStudents);

router.get("/queue", getQueue);

router.post("/call-next", callNextStudent);

router.patch("/done/:ticketId", markTicketDone);

export default router;