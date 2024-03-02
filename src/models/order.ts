import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: String, required: true, immutable: true, unique: true },
    customerId: { type: String, required: true, immutable: true, unique: true },
    customerDetails: { type: mongoose.Types.ObjectId, ref: "Customer" },
    orderId: { type: String, required: true, immutable: true, unique: true },
    status: { type: String, required: true },
    orderPhotos: { type: [String] },
    deliveryDate: { type: Date, required: true, immutable: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export { Order };
