import { Resend } from "resend";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import ErrorTemplate from "@/components/email-templates/ErrorTemplate";
import { EmailPayloadType } from "@/utils/interfaces";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const emailDetails: EmailPayloadType = await request.json();
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

  try {
    const response = await resend.emails.send({
      from: "Tailor Book <onboarding@resend.dev>",
      to: ["pavanbhaskardev@gmail.com"],
      subject: "Tailor Book Error Alert",
      react: ErrorTemplate({
        url: emailDetails.url,
        fromAddress: emailDetails.fromAddress,
        errorMessage: emailDetails.errorMessage,
      }),
    });

    return NextResponse.json(
      { message: "Successfully updated order", data: response },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
