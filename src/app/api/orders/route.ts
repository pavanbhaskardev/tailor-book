import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB";
import { Order } from "@/models/order";
import { Customer } from "@/models/customer";

type Query = {
  orderId?: number;
  customerId?: string;
};

export async function GET(request: Request) {
  const { userId: id } = auth();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const limit = searchParams.get("limit") as string;
  const offset = searchParams.get("offset") as string;
  const limitValue = +limit;
  const offsetValue = +offset;

  const customerId = searchParams.get("customerId");
  const searchWord = searchParams.get("searchWord") || "";
  let query: Query = {};
  const regex = /^[0-9]+$/;

  // added the case
  if (!id) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  if (regex.test(searchWord)) {
    query = { orderId: +searchWord };
  }

  if (customerId) {
    query.customerId = customerId;
  }
  // connects to MongoDB
  await connectMongoDB();

  try {
    const response = await Order.find({
      userId,
      ...query,
    })
      .limit(limitValue)
      .skip(offsetValue)
      .sort({ createdAt: -1 })
      .populate({ path: "customerDetails", model: Customer });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to retrieve orders",
        error: error,
      },
      { status: 500 }
    );
  }
}

// this is to create & update order
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
      { orderId: orderDetails.orderId, customerId: orderDetails.customerId },
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
