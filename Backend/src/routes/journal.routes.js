import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  getTodayEntry,
  upsertTodayEntry,
  getHistory,
  getEntryByDate,
} from "../controllers/journal.controller.js";

const journalRouter = Router();

/** GET  /api/journal/today        — get or create today's entry */
journalRouter.get("/today",   authenticateUser, getTodayEntry);

/** PUT  /api/journal/today        — save today's entry */
journalRouter.put("/today",   authenticateUser, upsertTodayEntry);

/** GET  /api/journal/history      — paginated past entries */
journalRouter.get("/history", authenticateUser, getHistory);

/** GET  /api/journal/:date        — entry for a specific date */
journalRouter.get("/:date",   authenticateUser, getEntryByDate);

export default journalRouter;
