import { Router } from "express";
import healthRoute from "./routes/health.route";
import authRoute from "./routes/auth.route";

const apiRouter = Router();
const pageRouter = Router();

apiRouter.use('/health', healthRoute);
apiRouter.use('/auth', authRoute);

export default {
    apiRoutes: apiRouter,
    pageRoutes: pageRouter
};