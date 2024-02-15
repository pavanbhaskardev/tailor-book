import { auth } from "@clerk/nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const { userId } = auth();
  const { searchParams } = new URL(request.url);
  const fileSize = searchParams.get("fileSize") || 0;
  const fileType = searchParams.get("fileType") || "";
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const maxFileSize = 1024 * 1024 * 10;

  // checking if the user is authenticated or not
  if (!userId) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  // added the max file size validation
  if (+fileSize > maxFileSize) {
    return NextResponse.json(
      { message: "File size greater than 10mb not allowed" },
      { status: 400 }
    );
  }

  // added fileType validation
  if (!allowedFileTypes.includes(fileType)) {
    return NextResponse.json(
      { message: `File type: ${fileType} is not supported` },
      { status: 400 }
    );
  }

  const putObject = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: uuidv4(),
    ContentType: fileType,
    ContentLength: +fileSize,
    Metadata: {
      userId,
    },
  });

  try {
    const signedUrl = await getSignedUrl(s3, putObject, { expiresIn: 60 });

    return NextResponse.json(
      {
        url: signedUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
  }
}
