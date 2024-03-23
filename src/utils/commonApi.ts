import axiosConfig from "./axiosConfig";
import { CustomerDetails } from "./interfaces";
import { OrderDetailsType } from "./interfaces";
import { UserDetailsType } from "./interfaces";

// Uploads the image to the s3 and return the image URL
export const uploadImageToS3 = async ({
  file,
  imageCompression,
}: {
  file: File;
  imageCompression: string;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("imageCompression", imageCompression);

  return axiosConfig({
    url: "api/images",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
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
    url: "api/customer",
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

export const createNewOrder = async (payload: OrderDetailsType) => {
  return axiosConfig({
    url: "api/orders",
    method: "POST",
    data: payload,
  });
};

export const incrementOrderId = async (payload: UserDetailsType) => {
  return axiosConfig({
    url: "api/user",
    method: "POST",
    data: payload,
  });
};

export const getCustomerOrderDetails = async ({
  customerId,
  orderId,
}: {
  customerId: string;
  orderId: number;
}) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/api/customer-order",
      params: {
        customerId: customerId,
        orderId: orderId,
      },
    });

    return response?.data?.data?.[0];
  } catch (error: unknown) {
    throw new Error(`Failed to get customer order ${error}`);
  }
};
