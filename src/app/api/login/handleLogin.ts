import { Request, Response } from "express";
import { getUserByEmail } from "../../../db/queries/users.js";
import { UnauthorizedError } from "../../middleware/error/errors.js";
import { checkPassword, makeJWT } from "../auth/auth.js";
import { config } from "../../../config.js";

export async function handleLogin(req: Request, res: Response) {
  const { email, password, expiresInSeconds } = req.body as {
    email: string;
    password: string;
    expiresInSeconds: number;
  };

  if (!email || !password) {
    throw new UnauthorizedError("incorrect email or password");
  }

  try {
    const user = await getUserByEmail(email);
    const passwordMatch = await checkPassword(password, user.hashedPassword);

    if (!passwordMatch) {
      throw new UnauthorizedError("incorrect email or password");
    }

    const oneHour = 3600;
    const expiry =
      !expiresInSeconds || expiresInSeconds > oneHour
        ? oneHour
        : expiresInSeconds;

    const token = makeJWT(user.id, expiry, config.api.jwtSecret);

    const { hashedPassword: _, ...userResponse } = user;
    res.header("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({ ...userResponse, token }));
  } catch (error) {
    throw new UnauthorizedError("incorrect email or password");
  }
}
