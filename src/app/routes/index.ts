import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { FeeConfigRoutes } from "../modules/feeConfig/feeConfig.route";
import { HubRoutes } from "../modules/hub/hub.route";
import { ParcelRoutes } from "../modules/parcel/parcel.route";
import { UserRoutes } from "../modules/user/user.route";

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
    path: "/parcel",
    route: ParcelRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
