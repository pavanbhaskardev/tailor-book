import axiosConfig from "./axiosConfig";
import { CustomerDetails } from "./interfaces";

// Uploads the image to the s3 and return the image URL
export const uploadImageToS3 = async ({ file }: { file: File }) => {
  const formData = new FormData();
  formData.append("file", file);

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
