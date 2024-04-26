import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB";
import { Customer } from "@/models/customer";

type Query = {
  name?: { $regex: string; $options: string };
  $expr?: { $regexMatch: { input: { $toString: string }; regex: RegExp } };
  customerId?: string;
};

// to get the customer list
export async function GET(request: Request) {
  const { userId } = auth();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const limitValue = limit ? +limit : 10;
  const offsetValue = offset ? +offset : 0;
  const searchWord = searchParams.get("searchWord") || "";
  const sortBy = searchParams.get("sortBy") || "asc";
  const customerId = searchParams.get("customerId");

  let query: Query = {};
  const regex = /^[0-9]+$/;

  // added the case
  if (!userId) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  if (customerId) {
    query.customerId = customerId;
  } else {
    if (regex.test(searchWord)) {
      query.$expr = {
        $regexMatch: {
          input: { $toString: "$number" },
          regex: new RegExp(searchWord),
        },
      };
    } else {
      query.name = { $regex: searchWord, $options: "i" };
    }
  }

  // connects to MongoDB
  await connectMongoDB();

  try {
    const response = await Customer.find({
      userId: id,
      ...query,
    })
      .sort({ name: sortBy === "asc" ? 1 : -1 })
      .limit(limitValue)
      .skip(offsetValue);

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
    const response = await Customer.findOneAndUpdate(
      { customerId: customerDetails.customerId },
      {
        userId: customerDetails.userId,
        customerId: customerDetails.customerId,
        name: customerDetails.name,
        number: customerDetails.number,
        shirtSize: customerDetails.shirtSize,
        pantSize: customerDetails.pantSize,
        customerPhoto: customerDetails.customerPhoto,
      },
      { upsert: true, new: true }
    );

    console.log({ response });

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
  const customerId = searchParams.get("customerId");

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

  if (!customerId) {
    return NextResponse.json(
      {
        message: "Customer ID is required",
      },
      { status: 400 }
    );
  }

  try {
    const response = await Customer.findOneAndDelete({
      customerId,
    });

    // finally checking the deleted customerId is same or not
    if (customerId === response?.customerId) {
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
