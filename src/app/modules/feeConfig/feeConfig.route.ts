import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createFeeConfigZodSchema } from "./feeConfig.validation";
import { Role } from "../user/user.interface";
import { FeeConfigController } from "./feeConfig.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createFeeConfigZodSchema),
  FeeConfigController.createFeeConfig
);

router.get(
  "/list",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  FeeConfigController.getAllFeeConfigs
);

export const FeeConfigRoutes = router;
