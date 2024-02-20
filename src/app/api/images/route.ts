import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs";
import axiosConfig from "@/utils/axiosConfig";

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
    // ContentLength: +fileSize,
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

export async function POST(request: NextRequest) {
  const fileData = await request.formData();
  const file = fileData.getAll("file")[0] as File;
  const url = fileData.getAll("url")[0] as string;

  try {
    const buffer = await file.arrayBuffer(); // Convert file to Buffer

    // compressing the image for performance
    const image = sharp(buffer)
      .resize({
        width: 200,
        height: 200,
        fit: sharp.fit.cover,
        withoutEnlargement: true,
      })
      .jpeg();

    // converting the image to buffer format again
    const resizedBuffer = await image.toBuffer();

    // uploading the resized image to s3
    try {
      const response = await axiosConfig(url, {
        method: "PUT",
        data: resizedBuffer,
        headers: {
          "Content-Type": file.type,
        },
      });

      // sending the s3 URL in the response
      const imageURl = response?.config?.url?.split("?")[0];

      return NextResponse.json(
        { message: "Successfully uploaded image to s3", data: imageURl },
        { status: 201 }
      );
    } catch (error) {
      console.log("failed to upload image to s3", error);

      return NextResponse.json(
        { message: "Failed to upload image to s3", error: error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("failed to compress image", error);

    return NextResponse.json(
      { message: "Failed to compress image", error: error },
      { status: 500 }
    );
  }
}
