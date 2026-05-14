import { Request, Response } from "express";
import { upgradeChirpyRed } from "../../../db/queries/users/users.js";

export async function handlePolkaWebhook(req: Request, res: Response) {
    const { event, data } = req.body as {
        event: string;
        data: { userId: string };
    };

    if (event !== "user.upgraded") {
        res.status(204).send();
        return;
    }

    await upgradeChirpyRed(data.userId);
    res.status(204).send();
}