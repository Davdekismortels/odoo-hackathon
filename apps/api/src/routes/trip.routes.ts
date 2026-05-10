import { Router } from "express";
import * as tripController from "../controllers/trip.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All trip routes require authentication
router.use(requireAuth);

// Trips
router.get("/", tripController.listTrips);
router.post("/", tripController.createTrip);
router.get("/:id", tripController.getTrip);
router.patch("/:id", tripController.updateTrip);
router.delete("/:id", tripController.deleteTrip);

// Stops (nested under trips)
router.get("/:id/stops", tripController.listStops);
router.post("/:id/stops", tripController.addStop);
router.patch("/:tripId/stops/:stopId", tripController.updateStop);
router.delete("/:tripId/stops/:stopId", tripController.removeStop);

export default router;
