import { Request, Response } from "express";
import { upgradeChirpyRed } from "../../../db/queries/users/users.js";
import { getAPIKey } from "../auth/auth.js";
import { config } from "../../../config.js";
import { NotFoundError } from "../../middleware/error/errors.js";

export async function handlePolkaWebhook(req: Request, res: Response) {
  try {
    const apiKey = getAPIKey(req);
    if (apiKey !== config.api.polkaKey) {
      return res.status(401).json({ error: "Invalid API Key" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { event, data } = req.body as {
    event: string;
    data: { userId: string };
  };

  if (event !== "user.upgraded") {
    return res.status(204).send();
  }

  try {
    await upgradeChirpyRed(data.userId);
    return res.status(204).send();
  } catch (error) {
    throw new NotFoundError("User not found");
  }
}
