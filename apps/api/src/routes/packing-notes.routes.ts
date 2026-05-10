import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as packingCtrl from "../controllers/packing.controller.js";
import * as notesCtrl from "../controllers/notes.controller.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// Packing
router.get("/packing", packingCtrl.listItems);
router.post("/packing", packingCtrl.addItem);
router.patch("/packing/:itemId/toggle", packingCtrl.toggleItem);
router.patch("/packing/:itemId", packingCtrl.editItem);
router.delete("/packing/:itemId", packingCtrl.removeItem);

// Notes
router.get("/notes", notesCtrl.listNotes);
router.post("/notes", notesCtrl.addNote);
router.patch("/notes/:noteId", notesCtrl.editNote);
router.delete("/notes/:noteId", notesCtrl.removeNote);

export default router;
