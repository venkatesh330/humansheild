import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assessmentsRouter from "./assessments";
import digestRouter from "./digest";
import safeCareersRouter from "./safeCareers";
import resourcesRouter from "./resources";
import liveDataRouter from "./liveData";
import learningPathsRouter from "./learningPaths";

const router: IRouter = Router();

router.use("/health",         healthRouter);
router.use("/assessments",    assessmentsRouter);
router.use("/digest",         digestRouter);
router.use("/safe-careers",   safeCareersRouter);
router.use("/resources",      resourcesRouter);
router.use("/live-data",      liveDataRouter);
router.use("/learning-paths", learningPathsRouter);

export default router;
