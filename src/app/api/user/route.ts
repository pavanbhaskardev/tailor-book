import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB";
import User from "@/models/user";

interface userDetails {
  id: string;
  name: string;
  email: string;
  incrementOrder: "true" | "false";
}

export async function POST(request: Request) {
  const userDetails: userDetails = await request.json();
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

  const incrementOrder = Boolean(userDetails.incrementOrder);
  const updateDetails = incrementOrder
    ? { $inc: { ordersCount: 1 } }
    : {
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
      };

  // creating the user in our database
  try {
    const user = await User.findOneAndUpdate(
      {
        id: userDetails.id,
      },
      updateDetails,
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json(
      { message: "Successfully updated user", data: user },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Failed to create user ${error.message}`,
      },
      { status: 500 }
    );
  }
}
