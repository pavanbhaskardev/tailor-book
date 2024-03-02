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

  try {
    const response = await Order.findOneAndUpdate(
      { orderId: orderDetails.orderId },
      {
        userId: orderDetails.userId,
        customerId: orderDetails.customerId,
        customerDetails: orderDetails.customerObjectId,
        orderId: orderDetails.orderId,
        status: orderDetails.status,
        orderPhotos: orderDetails.photos,
        deliveryDate: orderDetails.deliveryDate,
        description: orderDetails.description,
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
