import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getPackingList,
  addPackingItem,
  updatePackingItem,
  removePackingItem
} from "../controllers/packing.controller.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", getPackingList);
router.post("/", addPackingItem);
router.patch("/:itemId", updatePackingItem);
router.delete("/:itemId", removePackingItem);

export default router;
