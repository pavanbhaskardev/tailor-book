import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB";
import { Order } from "@/models/order";
import { Customer } from "@/models/customer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") as string;
  const orderId = searchParams.get("orderId") as string;

  // connects to MongoDB
  await connectMongoDB();

  try {
    const response = await Order.find({
      customerId,
      orderId: +orderId,
    }).populate({ path: "customerDetails", model: Customer });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error) {
    console.log("failed to retrieve orders", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve customer order",
        error: error,
      },
      { status: 500 }
    );
  }
}
