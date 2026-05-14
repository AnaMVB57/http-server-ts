import { Request, Response } from "express";
import { getUserByEmail } from "../../../db/queries/users/users.js";
import { UnauthorizedError } from "../../middleware/error/errors.js";
import { checkPassword, makeJWT, makeRefreshToken } from "../auth/auth.js";
import { config } from "../../../config.js";
import { createRefreshToken } from "../../../db/queries/refresh_tokens/refreshTokens.js";

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Incorrect email or password");
    }

    const passwordMatch = await checkPassword(password, user.hashedPassword);

    if (!passwordMatch) {
      throw new UnauthorizedError("Incorrect email or password");
    }

    //Generate Access Token
    const accessToken = makeJWT(user.id, 3600, config.api.jwtSecret);

    //Generate Refresh Token
    const refreshTokenStr = makeRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    await createRefreshToken(refreshTokenStr, user.id, expiresAt);

    const { hashedPassword: _, ...userResponse } = user;

    res.status(200).json({
      ...userResponse,
      token: accessToken,
      refreshToken: refreshTokenStr,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong during login" });
  }
}
