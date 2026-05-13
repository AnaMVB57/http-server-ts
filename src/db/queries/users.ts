import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();

  if (!result) {
    throw new Error("User already exists");
  }

  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}
