import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "../../index.js";
import { refresh_tokens } from "../../schema.js";
import { getBearerToken, makeJWT } from "../../../app/api/auth/auth.js";
import { Response, Request } from "express";
import { config } from "../../../config.js";

export async function createRefreshToken(
  token: string,
  userId: string,
  expiresAt: Date,
) {
  await db.insert(refresh_tokens).values({
    token,
    userId,
    expires_at: expiresAt,
  });
}

export async function getValidRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refresh_tokens)
    .where(
      and(
        eq(refresh_tokens.token, token),
        isNull(refresh_tokens.revoked_at),
        gt(refresh_tokens.expires_at, new Date()),
      ),
    );
  return result;
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refresh_tokens)
    .set({ revoked_at: new Date() })
    .where(eq(refresh_tokens.token, token));
}

export async function handleRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const validToken = await getValidRefreshToken(refreshToken);

  if (!validToken) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  const newAccessToken = makeJWT(validToken.userId, 3600, config.api.jwtSecret);

  res.status(200).json({ token: newAccessToken });
}

export async function handleRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();
}
