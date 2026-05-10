import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as publicCtrl from "../controllers/public.controller.js";

const router = Router();

// ── Publish / unpublish (scoped under trip) ──────────────────────────────────
// Mounted separately as /api/v1/trips/:tripId
router.post("/:tripId/publish", requireAuth, publicCtrl.publish);
router.delete("/:tripId/publish", requireAuth, publicCtrl.unpublish);

// ── Public read (no auth) ─────────────────────────────────────────────────────
router.get("/public/:slug", publicCtrl.getPublic);

// ── Clone (auth required) ─────────────────────────────────────────────────────
router.post("/public/:slug/clone", requireAuth, publicCtrl.clone);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/stats", requireAuth, publicCtrl.adminStats);

export default router;
