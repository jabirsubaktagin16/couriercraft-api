import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to MongoDB");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listening on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

process.on("SIGTERM", () => {
  console.log("SIGTERM is received");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection detected, system shutting down.....");
  if (server) {
    server.close(() => {
      console.log(error);
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception detected, system shutting down.....");
  if (server) {
    server.close(() => {
      console.log(error);
      process.exit(1);
    });
  }
  process.exit(1);
});
