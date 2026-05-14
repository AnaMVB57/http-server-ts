import { Request, Response } from "express";
import { createUser, deleteAllUsers } from "../../../db/queries/users/users.js";
import { config } from "../../../config.js";
import { ForbiddenError } from "../../middleware/error/errors.js";
import { hashPassword } from "../auth/auth.js";

export async function handleCreateUsers(req: Request, res: Response) {
  let userData = req.body as { email: string; password: string };

  if (
    !userData ||
    typeof userData !== "object" ||
    typeof userData.email !== "string" ||
    typeof userData.email !== "string"
  ) {
    throw new TypeError("User data was not provided.");
  }

  const hashedPassword = await hashPassword(userData.password);
  const user = await createUser({ email: userData.email, hashedPassword });

  const { hashedPassword: _, ...userResponse } = user;

  res.header("Content-Type", "application/json");
  res.status(201).send(JSON.stringify(userResponse));
}

export async function handlerReset(req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError("User not authorized to perform this action.");
  }
  res.set("Content-Type", "text/plain; charset=utf-8");
  await deleteAllUsers();
  res.send(`Hits: ${(config.api.fileserverHits = 0)}`);
}
