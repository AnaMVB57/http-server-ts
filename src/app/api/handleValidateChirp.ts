import { Request, Response } from "express";
import { BadRequestError } from "../middleware/error/errors.js";

export function handleValidateChirp(req: Request, res: Response) {
  const { body } = req.body;

  if (!body || typeof body !== "string") {
    res.header("Content-Type", "application/json");
    res.status(400).send(JSON.stringify({ error: "Something went wrong" }));
    return;
  }
  if (body.length > 140) {
    res.header("Content-Type", "application/json");
    throw new BadRequestError("Chirp is too long. Max length is 140" );
  }

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (profaneWords.includes(words[i].toLowerCase())) {
      words[i] = "****";
    }
  }

  const cleanedBody = words.join(" ");

  res.header("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({cleanedBody: cleanedBody}));
}
