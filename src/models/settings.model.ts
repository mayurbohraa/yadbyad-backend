import mongoose, { Schema } from "mongoose";

const SettingsSchema: Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  razorpay: {
    keyId: {
      type: String,
    },
    keySecret: {
      type: String,
    },
  },
  stripe: {
    keyId: {
      type: String,
    },
    keySecret: {
      type: String,
    },
  },
});

export default mongoose.model("settings", SettingsSchema);
