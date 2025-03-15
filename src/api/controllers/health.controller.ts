import { Request, Response } from "express";
import Success from "server/responses/success-response/success";
import HealthService from "services/health.service";

export default class HealthController {
    public static getHealth = (req: Request, res: Response) => {
        const health = HealthService.getHealth();
        const response = new Success(health).toJson;
        res.send(response);
    }
}