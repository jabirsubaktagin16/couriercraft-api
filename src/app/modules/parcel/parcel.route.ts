import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ParcelController } from "./parcel.controller";
import { createParcelZodSchema } from "./parcel.validation";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.USER),
  validateRequest(createParcelZodSchema),
  ParcelController.createNewParcel
);

export const ParcelRoutes = router;
