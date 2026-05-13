import { Request, Response } from "express";
import { getUserByEmail } from "../../../db/queries/users.js";
import { UnauthorizedError } from "../../middleware/error/errors.js";
import { checkPassword } from "../auth/auth.js";

export async function handleLogin(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
        throw new UnauthorizedError("incorrect email or password");
    }

    try {
        const user = await getUserByEmail(email);
        const passwordMatch = await checkPassword(password, user.hashedPassword);

        if (!passwordMatch) {
            throw new UnauthorizedError("incorrect email or password");
        }

        const { hashedPassword: _, ...userResponse } = user;
        res.header("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(userResponse));

    } catch {
        throw new UnauthorizedError("incorrect email or password");
    }
}