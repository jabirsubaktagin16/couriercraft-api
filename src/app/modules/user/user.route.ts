import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { createUserZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser
);

export const UserRoutes = router;
