import { Request, Response } from "express";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../middleware/error/errors.js";
import {
  createChirps,
  deleteChirpById,
  getAllChirps,
  getChirpById,
} from "../../../db/queries/chirps/chirps.js";
import { getBearerToken, validateJWT } from "../auth/auth.js";
import { config } from "../../../config.js";

export async function handleCreateChirps(req: Request, res: Response) {
  let token = "";
  let userId: string | null = null;

  try {
    token = getBearerToken(req);
    userId = validateJWT(token, config.api.jwtSecret);

    if (!userId) {
      res.status(401).json({ error: "User not authorized." });
      return;
    }
  } catch (error) {
    res.status(401).json({ error: "User not authorized." });
    return;
  }

  const { body } = req.body as { body: string };

  if (!body || typeof body !== "string") {
    res.status(400).json({ error: "Chirp body was not provided." });
    return;
  }

  if (body.length > 140) {
    res.status(400).json({ error: "Chirp is too long. Max length is 140" });
    return;
  }

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (profaneWords.includes(words[i].toLowerCase())) {
      words[i] = "****";
    }
  }

  const cleanedBody = words.join(" ");

  try {
    const chirp = await createChirps({ body: cleanedBody, userId });
    res.status(201).json(chirp);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong on our end" });
  }
}

export async function handleGetAllChirps(req: Request, res: Response) {
  try {
    const chirps = await getAllChirps();
    res.header("Content-Type", "application/json");
    res.status(200).json(chirps);
  } catch (error) {
    throw new NotFoundError("Couldn't load chirps.");
  }
}

export async function handleGetChirpById(req: Request, res: Response) {
  const { chirpId } = req.params as { chirpId: string };
  try {
    const chirp = await getChirpById(chirpId);

    if (!chirp) {
      throw new NotFoundError("Chirp not found");
    }

    res.header("Content-Type", "application/json");
    res.status(200).json(chirp);
  } catch (error) {
    throw new NotFoundError("Couldn't load chirp.");
  }
}

export async function handleDeleteChirpById(req: Request, res: Response) {
  const { chirpId } = req.params as { chirpId: string };
  let userId: string | null = null;

  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.api.jwtSecret);

    if (!userId) {
      res.status(401).json({ error: "User not authorized." });
      return;
    }
  } catch (error) {
    res.status(401).json({ error: "User not authorized." });
    return;
  }

  try {
    const chirp = await getChirpById(chirpId);

    if (!chirp) {
      throw new BadRequestError("Chirp was not found");
    }

    if (chirp.userId !== userId) {
      throw new ForbiddenError("You are not the author of this chirp.");
    }

    await deleteChirpById(chirpId);

    res.status(204).send(JSON.stringify("Chirp deleted successfully."));
  } catch (error) {
    throw new ForbiddenError(`Chirp with ID ${chirpId} was not found.`);
  }
}
