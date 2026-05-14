import { Request, Response } from "express";
import {
  createUser,
  deleteAllUsers,
  updateUser,
} from "../../../db/queries/users/users.js";
import { config } from "../../../config.js";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../../middleware/error/errors.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth/auth.js";

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

export async function handleUpdateUsers(req: Request, res: Response) {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);

    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      throw new BadRequestError("Email and password are required.");
    }
    if (!userId) {
      throw new BadRequestError("User ID is required.");
    }

    const hashedPassword = await hashPassword(password);
    const user = await updateUser(userId, email, hashedPassword);

    const { hashedPassword: _, ...userResponse } = user;
    res.header("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(userResponse));
  } catch (error) {
    throw new UnauthorizedError("User not authorized");
  }
}
