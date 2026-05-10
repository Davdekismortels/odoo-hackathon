import { Router } from "express";
import * as tripController from "../controllers/trip.controller.js";
import { requireAuth } from "../middleware/auth.js";

import { validateRequest } from "../middleware/validateRequest.js";
import { CreateTripSchema, UpdateTripSchema, CreateStopSchema, UpdateStopSchema } from "../schemas/trip.schema.js";

const router = Router();

// All trip routes require authentication
router.use(requireAuth);

// Trips
router.get("/", tripController.listTrips);
router.post("/", validateRequest(CreateTripSchema), tripController.createTrip);
router.get("/:id", tripController.getTrip);
router.patch("/:id", validateRequest(UpdateTripSchema), tripController.updateTrip);
router.delete("/:id", tripController.deleteTrip);

// Stops (nested under trips)
router.get("/:id/stops", tripController.listStops);
router.post("/:id/stops", validateRequest(CreateStopSchema), tripController.addStop);
router.patch("/:tripId/stops/:stopId", validateRequest(UpdateStopSchema), tripController.updateStop);
router.delete("/:tripId/stops/:stopId", tripController.removeStop);

export default router;
