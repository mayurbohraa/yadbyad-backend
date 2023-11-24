import mongoose from "mongoose";
import { SettingsModel } from "../models";

export async function createSettings(
  userId: mongoose.Types.ObjectId,
  settingObj: any = null
) {
  return await SettingsModel.create({ user: userId, ...settingObj });
}

export async function getSettings(userId: mongoose.Types.ObjectId) {
  const settings = await SettingsModel.find({
    user: userId,
  });
  return settings;
}

export async function updateSettings(
  userId: mongoose.Types.ObjectId,
  updateObj: any
) {
  const settings = await SettingsModel.findOneAndUpdate(
    {
      user: userId,
    },
    {
      ...updateObj,
    },
    {
      new: true,
    }
  );
  return settings;
}
