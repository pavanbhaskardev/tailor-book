import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs";
import { z } from "zod";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// payload schema
const payloadSchema = z.object({
  size: z.number().max(1024 * 1024 * 7, "File size can't be greater than 7MB"),
  type: z.string({ required_error: "Type is required" }),
});

export async function POST(request: NextRequest) {
  const imageDetails = await request.json();
  const { userId } = auth();
  const uniqueFileName = uuidv4();

  // doing all the validation here
  const validation = payloadSchema.safeParse({
    ...imageDetails,
    size: imageDetails.size ? +imageDetails.size : undefined,
  });

  if (!validation.success) {
    return NextResponse.json(
      {
        data: validation.error.issues,
      },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: imageDetails?.type,
      ContentLength: imageDetails?.size,
      Metadata: {
        userId,
      },
    });

    const response = await getSignedUrl(s3, command, { expiresIn: 6000 });

    return NextResponse.json(
      {
        data: response,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        data: `Failed to get presigned URL ${error}`,
      },
      { status: 500 }
    );
  }
}
