import { Router } from "express";
import { list, read, readAll, remove, create } from "./alerts.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware, requireRole("DOCTOR"));

router.get("/", list);
router.post("/", create);
router.patch("/read-all", readAll);
router.patch("/:id/read", read);
router.delete("/:id", remove);

export default router;
