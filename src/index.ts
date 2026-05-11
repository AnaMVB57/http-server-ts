import { Request, Response } from "express";
import express from "express";
import { middlewareLogResponse } from "./app/middleware/middlewareLogResponses.js";
import { handlerMetrics, handlerReset, middlewareMetricsInc } from "./app/middleware/middlewareMetricsInc.js";

export let app = express();
const PORT = 8080;

app.use(middlewareLogResponse);


app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});