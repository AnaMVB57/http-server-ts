import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export async function createChirps(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();

  if (!result) {
    throw new Error("Failed to create chirp");
  }

  return result;
}
