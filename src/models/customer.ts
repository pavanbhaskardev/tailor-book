import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderId: String,
    photos: [String],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

const customerSchema = new Schema(
  {
    id: String,
    name: String,
    number: Number,
    shirtSize: [Number],
    pantSize: [Number],
    customerPhoto: String,
    orders: [orderSchema],
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

export { Customer, Order };
