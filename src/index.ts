import { Request, Response } from "express";
import express from "express";
import { middlewareLogResponse } from "./app/middleware/middlewareLogResponses.js";

export let app = express();
const PORT = 8080;

app.use(middlewareLogResponse);

function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

app.get("/healthz", handlerReadiness);

app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});