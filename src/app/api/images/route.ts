import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const maxFileSize = 1024 * 1024 * 7;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb", // Increase the limit to 8MB (adjust as needed)
    },
    maxDuration: 10,
  },
};

export async function POST(request: NextRequest) {
  console.log("i've entered API endpoint");

  const fileData = await request.formData();
  const file: File | null = fileData.get("file") as unknown as File;
  const imageCompression: string | null = fileData.get(
    "imageCompression"
  ) as unknown as string;
  const { userId } = auth();
  const uniqueFileName = uuidv4();

  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!userId) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  // user haven't specified any file
  if (!file || !imageCompression) {
    return NextResponse.json(
      {
        message: "Required field are missing",
      },
      { status: 400 }
    );
  }

  // added the max file size validation
  if (file.size > maxFileSize) {
    return NextResponse.json(
      { message: "File size greater than 10mb not allowed" },
      { status: 400 }
    );
  }

  // added fileType validation
  if (!allowedFileTypes.includes(file.type)) {
    return NextResponse.json(
      { message: `File type: ${file.type} is not supported` },
      { status: 400 }
    );
  }

  try {
    console.log("i entered the tryCatch");

    const arrayBuffer = await file.arrayBuffer(); // Convert file to Buffer
    let resizedImage;

    if (imageCompression === "resize") {
      console.log("i entered the profile pic resize");

      // compressing the image for performance
      resizedImage = await sharp(arrayBuffer)
        .resize({
          width: 400,
          height: 400,
          fit: sharp.fit.cover,
          withoutEnlargement: true,
        })
        .withMetadata()
        .jpeg({ quality: 80 })
        .toBuffer();
    } else if (imageCompression === "compress") {
      console.log("i entered the jpg compression pic resize");
      resizedImage = await sharp(arrayBuffer)
        .withMetadata()
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    // changed from presigned URL to putObject
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFileName,
      Body: resizedImage,
      ContentType: file.type,
      Metadata: {
        userId: userId || "",
      },
    });

    // uploading the resized image to s3
    try {
      console.log("entered the s3 tryCatch block");
      await s3.send(command);

      return NextResponse.json(
        {
          message: "Successfully uploaded image to s3",
          data: `${process.env.AWS_BUCKET_FULL_URL}${uniqueFileName}`,
        },
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
