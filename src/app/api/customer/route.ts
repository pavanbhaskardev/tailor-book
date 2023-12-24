import connectMongoDB from "@/lib/mongoDB";
import { Customer } from "@/models/customer";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

interface Customer {
  id: string;
  name: string;
  number: number;
  shirtSize: [number];
  pantSize: [number];
  customerPhoto: string;
}

export async function POST(data: Customer) {
  const { userId } = auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectMongoDB();

  // waiting to create a new customer
  try {
    await Customer.create({
      ...data,
    });

    NextResponse.json(
      { message: "Customer created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log("customer not created successfully", error);
  }
}
