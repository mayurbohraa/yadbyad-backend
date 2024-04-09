import { Request, Response } from "express";

export async function getSettings(req: Request, res: Response) {
  try {
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json(error);
  }
}
