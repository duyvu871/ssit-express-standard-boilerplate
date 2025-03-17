import { Router } from "express";
import healthRoute from "./routes/health.route";
import authRoute from "./routes/auth.route";
import notificationRouter from "./routes/notification.route";
import pageRoutes from "./routes/page.route";

const apiRouter = Router();
const pageRouter = Router();

apiRouter.use('/health', healthRoute);
apiRouter.use('/auth', authRoute);

pageRouter.use("/notification", notificationRouter);

// Add page routes directly to the page router
pageRouter.use("/", pageRoutes);

export default {
    apiRoutes: apiRouter,
    pageRoutes: pageRouter
};