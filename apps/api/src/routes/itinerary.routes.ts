import { Router } from "express";
import * as itineraryController from "../controllers/itinerary.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { AddActivitySchema, ReorderStopsSchema } from "../schemas/trip.schema.js";

const router = Router({ mergeParams: true }); // inherit :tripId from parent

router.use(requireAuth);

// Stop activities
router.get("/stops/:stopId/activities", itineraryController.listStopActivities);
router.post("/stops/:stopId/activities", validateRequest(AddActivitySchema), itineraryController.addStopActivity);
router.delete("/stops/:stopId/activities/:entryId", itineraryController.removeStopActivity);

// Reorder
router.patch("/stops/reorder", validateRequest(ReorderStopsSchema), itineraryController.reorderStops);

// Budget
router.get("/budget", itineraryController.getBudget);

export default router;
