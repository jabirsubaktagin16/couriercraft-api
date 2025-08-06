import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { HubRoutes } from "../modules/hub/hub.route";
import { FeeConfigRoutes } from "../modules/feeConfig/feeConfig.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/hub",
    route: HubRoutes,
  },
  {
    path: "/fee-config",
    route: FeeConfigRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
