import connectMongoDB from "@/lib/mongoDB";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function POST(request: Request) {
  const { id } = await request.json();
  const { userId } = auth();

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

  // creates a new user if the user already exists
  const createNewUser = async () => {
    // creating if user doesn't exist
    try {
      const newUser = await User.create({ id });

      return NextResponse.json(
        { message: "Customer created successfully", data: newUser },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          message: `Unable to create customer ${error?.message}`,
        },
        { status: 500 }
      );
    }
  };

  // check if user exists already or not
  try {
    const user = await User.find({ id }).limit(1);

    if (user?.length !== 0) {
      return NextResponse.json(
        { message: "Customer already exists", data: user },
        { status: 200 }
      );
    }
    createNewUser();
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Unable to find user ${error.message}`,
      },
      { status: 403 }
    );
  }
}
