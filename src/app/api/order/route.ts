import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB";
import { Order } from "@/models/order";

export async function POST(request: Request) {
  const orderDetails = await request.json();
  const { userId } = auth();

  // checking if the user is authenticated or not
  if (!userId) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  // connects to MongoDB
  await connectMongoDB();

  const newShirtSize = orderDetails?.newShirtSize
    ? {
        newShirtSize: orderDetails?.newShirtSize,
      }
    : {};

  const newPantSize = orderDetails?.newPantSize
    ? {
        newPantSize: orderDetails?.newPantSize,
      }
    : {};

  try {
    const response = await Order.findOneAndUpdate(
      { orderId: orderDetails.orderId },
      {
        userId: orderDetails.userId,
        customerId: orderDetails.customerId,
        customerDetails: orderDetails.customerDetails,
        orderId: orderDetails.orderId,
        status: orderDetails.status,
        orderPhotos: orderDetails.orderPhotos,
        deliveryDate: orderDetails.deliveryDate,
        description: orderDetails.description,
        ...newPantSize,
        ...newShirtSize,
        shirtCount: orderDetails.shirtCount,
        pantCount: orderDetails.pantCount,
        price: orderDetails.price,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json(
      { message: "Successfully updated order", data: response },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to update order",
        data: error,
      },
      { status: 500 }
    );
  }
}
