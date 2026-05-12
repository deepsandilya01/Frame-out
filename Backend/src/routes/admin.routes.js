import express from "express";
import { authenticateUser, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { 
  getPlatformStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  assignTask,
  getAuditLogs
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes here require authentication and admin role
router.use(authenticateUser, authorizeAdmin);

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.get("/logs", getAuditLogs);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.post("/tasks/assign", assignTask);

export default router;
