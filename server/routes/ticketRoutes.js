import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import { 
    createTicket 
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/create", authMiddleware, createTicket);

export default router;
