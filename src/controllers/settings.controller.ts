import { Request, Response } from "express";

export async function getSettings(req: Request, res: Response) {
  try {
    // const settings = await SettingsService.getSettings();
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json(error);
  }
}
