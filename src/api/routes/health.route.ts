import { Router } from "express";
import HealthController from "../controllers/health.controller";

const healthRoute = Router();

healthRoute.get('/health', HealthController.getHealth);

export default healthRoute;