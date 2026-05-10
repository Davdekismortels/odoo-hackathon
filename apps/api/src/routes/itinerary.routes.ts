import { Router } from "express";
import * as itineraryController from "../controllers/itinerary.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router({ mergeParams: true }); // inherit :tripId from parent

router.use(requireAuth);

// Stop activities
router.get("/stops/:stopId/activities", itineraryController.listStopActivities);
router.post("/stops/:stopId/activities", itineraryController.addStopActivity);
router.delete("/stops/:stopId/activities/:entryId", itineraryController.removeStopActivity);

// Reorder
router.patch("/stops/reorder", itineraryController.reorderStops);

// Budget
router.get("/budget", itineraryController.getBudget);

export default router;
