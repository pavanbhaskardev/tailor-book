import axiosConfig from "./axiosConfig";
import { CustomerDetails } from "./interfaces";

// returns the presigned s3 URL
export const getS3URL = (imageFile: File) => {
  return axiosConfig.get("/api/images", {
    params: { fileSize: imageFile.size, fileType: imageFile.type },
  });
};

// Uploads the image to the s3 and return the image URL
export const uploadImageToS3 = async ({
  file,
  url,
}: {
  file: File;
  url: string;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("url", url);

  return axiosConfig({
    url: "api/images",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": file.type,
    },
  });
};

export const createNewCustomer = async ({
  userId,
  customerId,
  name,
  number,
  shirtSize,
  pantSize,
  customerPhoto,
}: CustomerDetails) => {
  return axiosConfig({
    url: "/api/customer",
    method: "POST",
    data: {
      userId,
      customerId,
      name,
      number,
      shirtSize,
      pantSize,
      customerPhoto,
    },
  });
};
