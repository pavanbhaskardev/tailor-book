import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
  {
    userId: { type: String, required: true, immutable: true, unique: true },
    customerId: { type: String, required: true, immutable: true, unique: true },
    name: { type: String, required: true, lowercase: true, trim: true },
    number: { type: Number, required: true },
    shirtSize: { type: [Number], required: true },
    pantSize: { type: [Number], required: true },
    customerPhoto: { type: String },
  },
  {
    timestamps: true,
  }
);

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export { Customer };
