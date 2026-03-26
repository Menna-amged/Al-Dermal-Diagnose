import { Router } from "express";
import { getAll, create, update, remove, publish } from "./reports.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:id/publish", publish);

export default router;
