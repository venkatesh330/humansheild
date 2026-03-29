import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assessmentsRouter from "./assessments";
import digestRouter from "./digest";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/assessments", assessmentsRouter);
router.use("/digest", digestRouter);

export default router;
