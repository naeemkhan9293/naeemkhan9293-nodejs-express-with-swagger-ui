import express from "express";
import serverHealthRouter from "#src/routes/serverHealth.routes";
import routerNotFound from "#src/error/routerNotFound";
import userRouter from "#src/routes/user.routes";

const router = express.Router();

router.use("/", serverHealthRouter);
router.use("/users", userRouter);
router.all("/{*splat}", routerNotFound);

export default router;
