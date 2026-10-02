import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getUsage } from "../services/billingService.js";

const router = express.Router();

router.get("/usage", authenticate, async (req, res) => {
  try {
    const usage = await getUsage(req.user.UserID);
    return res.json({
      success: true,
      usage,
    });
  } catch (err) {
    console.error("Billing usage failed:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
