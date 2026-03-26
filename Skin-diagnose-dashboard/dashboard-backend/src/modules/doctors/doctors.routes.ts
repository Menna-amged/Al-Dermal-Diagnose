import { Router } from "express";
import { getAll, create, update, remove, toggleBanDoctor } from "./doctors.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:id/toggle-ban", toggleBanDoctor);

export default router;
