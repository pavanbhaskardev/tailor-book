import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: String, required: true, immutable: true },
    customerId: { type: String, required: true, immutable: true },
    customerDetails: { type: mongoose.Types.ObjectId, ref: "Customer" },
    orderId: { type: String, required: true, immutable: true },
    status: { type: String, required: true },
    orderPhotos: { type: [String], required: true },
    deliveryDate: { type: Date, required: true, immutable: true },
    description: { type: String },
    shirtCount: { type: Number, required: true, immutable: true },
    pantCount: { type: Number, required: true, immutable: true },
    newShirtSize: { type: [Number] },
    newPantSize: { type: [Number] },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export { Order };
