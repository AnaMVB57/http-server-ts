import { Request, Response } from "express";
import express from "express";
import { middlewareLogResponse } from "./app/middleware/middlewareLogResponses.js";
import {
  handlerMetrics,
  middlewareMetricsInc,
} from "./app/middleware/middlewareMetricsInc.js";
import { errorHandler } from "./app/middleware/error/errorHandler.js";
import { handleCreateUsers, handlerReset } from "./app/api/users/users.js";
import { handleCreateChirps, handleGetAllChirps, handleGetChirpById } from "./app/api/chirps/chirps.js";

export let app = express();
const PORT = 8080;

function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

app.use(middlewareLogResponse);
app.use(express.json());

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.post("/api/users", handleCreateUsers);

app.post("/api/chirps", handleCreateChirps);
app.get("/api/chirps", handleGetAllChirps);

app.get("/api/chirps/:chirpId", handleGetChirpById);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
