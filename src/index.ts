import { Request, Response } from "express";
import express from "express";
import { middlewareLogResponse } from "./app/middleware/middlewareLogResponses.js";
import {
  handlerMetrics,
  middlewareMetricsInc,
} from "./app/middleware/middlewareMetricsInc.js";
import { errorHandler } from "./app/middleware/error/errorHandler.js";
import { handleCreateUsers, handlerReset, handleUpdateUsers } from "./app/api/users/users.js";
import { handleCreateChirps, handleDeleteChirpById, handleGetAllChirps, handleGetChirpById } from "./app/api/chirps/chirps.js";
import { handleLogin } from "./app/api/login/handleLogin.js";
import { handleRefresh, handleRevoke } from "./db/queries/refresh_tokens/refreshTokens.js";
import { handlePolkaWebhook } from "./app/api/webhooks/handlePolkaWebhook.js";

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
app.put("/api/users", handleUpdateUsers);

app.post("/api/login", handleLogin);
app.post("/api/refresh", handleRefresh);
app.post("/api/revoke", handleRevoke);

app.post("/api/chirps", handleCreateChirps);
app.get("/api/chirps", handleGetAllChirps);

app.get("/api/chirps/:chirpId", handleGetChirpById);

app.delete("/api/chirps/:chirpId", handleDeleteChirpById);

app.post("/api/polka/webhooks", handlePolkaWebhook);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
