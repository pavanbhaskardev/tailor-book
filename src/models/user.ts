import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    id: { type: String, required: true, lowercase: true },
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
