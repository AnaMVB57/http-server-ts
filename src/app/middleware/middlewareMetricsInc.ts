import { NextFunction, Request, Response } from "express";
import { config } from "../../config.js";  
import { app } from "../../index.js";

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++;  
    next();                   
}

export function handlerMetrics(req: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
}

export function handlerReset(req: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits = 0}`);
}