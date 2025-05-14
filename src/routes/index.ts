import express from "express";
import serverHealthRouter from "#src/routes/serverHealth.routes";
import routerNotFound from "#src/error/routerNotFound";
import userRouter from "#src/routes/user.routes";
import profileRouter from "#src/routes/profile.routes";

const router = express.Router();

router.use("/", serverHealthRouter);
router.use("/users", userRouter);
router.use("/profile", profileRouter);
router.all("/{*splat}", routerNotFound);

export default router;
