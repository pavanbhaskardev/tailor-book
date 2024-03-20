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

export async function POST(request: NextRequest) {
  const fileData = await request.formData();
  const file = fileData.getAll("file")[0] as File;
  const imageCompression = fileData.get("imageCompression") as string;
  const { userId } = auth();
  const uniqueFileName = uuidv4();

  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

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
    let resizedBuffer;

    if (imageCompression === "resize") {
      console.log("i entered the profile pic resize");

      // compressing the image for performance
      resizedImage = sharp(arrayBuffer)
        .resize({
          width: 400,
          height: 400,
          fit: sharp.fit.cover,
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 });
    } else if (imageCompression === "compress") {
      console.log("i entered the jpg compression pic resize");
      resizedImage = sharp(arrayBuffer).jpeg({ quality: 80 });
    }

    // converting the image to buffer format again
    if (resizedImage) {
      console.log("entered the buffer format block");
      resizedBuffer = await resizedImage.toBuffer();
    }

    // changed from presigned URL to putObject
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFileName,
      Body: resizedBuffer,
      ContentType: file.type,
      Metadata: {
        userId,
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
