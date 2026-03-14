import express from "express";
import { getNearbyVolunteers } from "../controllers/volunteerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/volunteers/nearby?latitude=...&longitude=...
router.get("/nearby", protect, getNearbyVolunteers);

export default router;