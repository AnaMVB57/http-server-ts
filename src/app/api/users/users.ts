import { Request, Response } from "express";
import { createUser, deleteAllUsers } from "../../../db/queries/users.js";
import { config } from "../../../config.js";
import { ForbiddenError } from "../../middleware/error/errors.js";

export async function handleCreateUsers(req: Request, res: Response) {
  const userData = req.body as { email: string };

  if (
    !userData ||
    typeof userData !== "object" ||
    typeof userData.email !== "string"
  ) {
    throw new TypeError("User data was not provided.");
  }

  const user = await createUser(userData);

  res.header("Content-Type", "application/json");
  res.status(201).send(JSON.stringify(user));
}

export async function handlerReset(req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError("User not authorized to perform this action.");
  }
  res.set("Content-Type", "text/plain; charset=utf-8");
  await deleteAllUsers();
  res.send(`Hits: ${(config.api.fileserverHits = 0)}`);
}
