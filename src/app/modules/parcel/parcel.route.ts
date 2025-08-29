import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ParcelController } from "./parcel.controller";
import {
  createParcelZodSchema,
  updateParcelZodSchema,
} from "./parcel.validation";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.USER),
  validateRequest(createParcelZodSchema),
  ParcelController.createNewParcel
);

router.get("/sent/me", checkAuth(Role.USER), ParcelController.getMySentParcels);

router.get(
  "/received/me",
  checkAuth(Role.USER),
  ParcelController.getMyIncomingParcels
);

router.get(
  "/rider/pickup/me",
  checkAuth(Role.RIDER),
  ParcelController.getMyPickupParcels
);

router.get(
  "/rider/delivery/me",
  checkAuth(Role.RIDER),
  ParcelController.getMyDeliveryParcels
);

router.get(
  "/track/:trackingId",
  checkAuth(...Object.values(Role)),
  ParcelController.trackParcel
);

router.patch(
  "/update/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateParcelZodSchema),
  ParcelController.updateParcel
);

export const ParcelRoutes = router;
