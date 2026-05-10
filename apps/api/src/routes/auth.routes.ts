import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { signupSchema, loginSchema, updateProfileSchema } from "@traveloop/shared";

const router = Router();

// Apply strict rate limit to all auth routes
router.use(authLimiter);

// Public routes
router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);

// Protected routes
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);
router.patch("/profile", requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.delete("/account", requireAuth, authController.deleteAccount);

export default router;

