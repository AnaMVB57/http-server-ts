import { Request, Response } from "express";
import { BadRequestError } from "../../middleware/error/errors.js";
import { createChirps } from "../../../db/queries/chirps.js";

export async function handleCreateChirps(req: Request, res: Response) {
  const { body, userId } = req.body as { body: string; userId: string };

  if (!body || typeof body !== "string") {
    throw new BadRequestError("Chirp body was not provided.");
  }

  if (body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (profaneWords.includes(words[i].toLowerCase())) {
      words[i] = "****";
    }
  }

  const cleanedBody = words.join(" ");

  const chirp = await createChirps({ body: cleanedBody, userId });

  res.header("Content-Type", "application/json");
  res.status(201).send(JSON.stringify(chirp));
}
