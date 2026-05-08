import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { getTodayMissions, completeMission, regenerateMissions } from "../controllers/mission.controller.js";

const missionRouter = Router();

/** GET  /api/missions/today         — fetch or generate today's missions */
missionRouter.get("/today",                  authenticateUser, getTodayMissions);

/** PATCH /api/missions/:id/complete — mark a mission as complete */
missionRouter.patch("/:missionId/complete",  authenticateUser, completeMission);

/** POST /api/missions/regenerate    — force regenerate today's missions */
missionRouter.post("/regenerate",            authenticateUser, regenerateMissions);

export default missionRouter;
