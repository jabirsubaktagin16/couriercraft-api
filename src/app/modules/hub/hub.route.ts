import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createHubZodSchema, updateHubZodSchema } from "./hub.validation";
import { HubController } from "./hub.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createHubZodSchema),
  HubController.createHub
);

router.get(
  "/list",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  HubController.getAllHubs
);

router.get(
  "/riders/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  HubController.findRidersByHub
);

router.patch(
  "/update/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateHubZodSchema),
  HubController.updateHub
);

export const HubRoutes = router;
