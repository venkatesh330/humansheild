import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assessmentsRouter from "./assessments";
import digestRouter from "./digest";
import safeCareersRouter from "./safeCareers";
import resourcesRouter from "./resources";
import liveDataRouter from "./liveData";
import learningPathsRouter from "./learningPaths";
import roadmapRouter from "./roadmap";
import journalRouter from "./journal";
import scoresRouter from "./scores"; // PHASE-2: Score history API

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/assessments", assessmentsRouter);
router.use("/digest", digestRouter);
router.use("/safe-careers", safeCareersRouter);
router.use("/resources", resourcesRouter);
router.use("/live-data", liveDataRouter);
router.use("/learning-paths", learningPathsRouter);
router.use("/roadmap", roadmapRouter);
router.use("/journal", journalRouter);
router.use("/scores", scoresRouter);

export default router;
