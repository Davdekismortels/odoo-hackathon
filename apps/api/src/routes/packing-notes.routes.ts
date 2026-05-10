import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as packingCtrl from "../controllers/packing.controller.js";
import * as notesCtrl from "../controllers/notes.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { AddPackingItemSchema, TogglePackingItemSchema, AddNoteSchema, UpdateNoteSchema } from "../schemas/trip.schema.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// Packing
router.get("/packing", packingCtrl.listItems);
router.post("/packing", validateRequest(AddPackingItemSchema), packingCtrl.addItem);
router.post("/packing/reset", packingCtrl.resetItems);
router.patch("/packing/:itemId/toggle", validateRequest(TogglePackingItemSchema), packingCtrl.toggleItem);
router.patch("/packing/:itemId", packingCtrl.editItem);
router.delete("/packing/:itemId", packingCtrl.removeItem);

// Notes
router.get("/notes", notesCtrl.listNotes);
router.post("/notes", validateRequest(AddNoteSchema), notesCtrl.addNote);
router.patch("/notes/:noteId", validateRequest(UpdateNoteSchema), notesCtrl.editNote);
router.delete("/notes/:noteId", notesCtrl.removeNote);

export default router;
