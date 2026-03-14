import express from "express";
import {
  createEmergency,
  getEmergencyById,
  acceptEmergency,
  resolveEmergency,
} from "../controllers/emergencyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/emergency - Create emergency (protected)
router.post("/", protect, createEmergency);

// GET /api/emergency/:id - Get emergency details (protected)
router.get("/:id", protect, getEmergencyById);

// PUT /api/emergency/:id/accept - Volunteer accepts (protected)
router.put("/:id/accept", protect, acceptEmergency);

// PUT /api/emergency/:id/resolve - Volunteer resolves (protected)
router.put("/:id/resolve", protect, resolveEmergency);

export default router;