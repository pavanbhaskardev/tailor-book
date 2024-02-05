import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB";
import { Customer } from "@/models/customer";

// to get the customer list
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const limitValue = limit ? +limit : 10;
  const offsetValue = offset ? +offset : 0;

  // added the case
  if (!id) {
    return NextResponse.json(
      {
        message: "Invalid userId",
      },
      { status: 400 }
    );
  }

  // connects to MongoDB
  await connectMongoDB();

  try {
    const response = await Customer.find({
      userId: id,
    })
      .limit(limitValue)
      .skip(offsetValue * limitValue);

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to retrieve customer",
        data: error,
      },
      { status: 500 }
    );
  }
}

// to create a new customer
export async function POST(request: Request) {
  const customerDetails = await request.json();
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
    const response = await Customer.create({
      userId: customerDetails.userId,
      customerId: customerDetails.customerId,
      name: customerDetails.name,
      number: customerDetails.number,
      shirtSize: customerDetails.shirtSize,
      pantSize: customerDetails.pantSize,
      customerPhoto: customerDetails.customerPhoto,
    });

    return NextResponse.json(
      { message: "Successfully created customer", data: response },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to create customer",
        data: error,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
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

  if (!id) {
    return NextResponse.json(
      {
        message: "Customer ID is required",
      },
      { status: 400 }
    );
  }

  try {
    const response = await Customer.findOneAndDelete({
      customerId: id,
    });

    // finally checking the deleted customerId is same or not
    if (id === response?.customerId) {
      return NextResponse.json(
        { message: "Successfully deleted" },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Failed to delete customer",
        data: error,
      },
      { status: 500 }
    );
  }
}
