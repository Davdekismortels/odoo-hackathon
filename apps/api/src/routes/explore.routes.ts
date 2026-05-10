import { Router } from "express";
import * as exploreController from "../controllers/explore.controller.js";

const router = Router();

router.get("/cities", exploreController.searchCities);
router.get("/cities/:id/activities", exploreController.getCityActivities);
router.get("/countries", exploreController.listCountries);

export default router;
