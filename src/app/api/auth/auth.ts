import * as argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../../middleware/error/errors.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export function checkPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function makeJWT(userId: string, expiresIn: number, secret: string): string {
    const token: payload = {
        iss: "chirpy",
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
    }
    return jwt.sign(token, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
    const decodedToken = jwt.verify(tokenString, secret) as payload;
    if(!decodedToken.sub) throw new UnauthorizedError("Invalid token");
    return decodedToken.sub;
}
