import axiosConfig from "./axiosConfig";
import {
  UserDetailsType,
  OldCustomerAPIType,
  OrderDetailsType,
  CustomerDetails,
} from "./interfaces";

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
      "Content-Length": file.size,
    },
  });
};

export const getPresignedURL = async ({
  size,
  type,
}: {
  size: number;
  type: string;
}) => {
  return axiosConfig({
    url: "api/images/presigned-url",
    method: "POST",
    data: { size, type },
  });
};

export const uploadToPresignedURL = async ({
  file,
  url,
}: {
  file: File;
  url: string;
}) => {
  return axiosConfig({
    url,
    method: "PUT",
    data: file,
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

export const getOldCustomersList = async ({
  id,
  limit,
  offset,
  searchWord,
  sortBy,
  signal,
  customerId,
}: OldCustomerAPIType) => {
  try {
    const response = await axiosConfig({
      url: "api/customer",
      method: "GET",
      params: {
        id,
        limit,
        offset,
        searchWord: searchWord.trim(),
        sortBy,
        customerId,
      },
      signal,
    });

    return response?.data?.data || [];
  } catch (error: unknown) {
    throw new Error(`failed to get customers list: ${error}`);
  }
};

export const deleteImageFromS3 = async ({ id }: { id: string }) => {
  return axiosConfig({
    url: "api/images",
    method: "DELETE",
    data: {
      id,
    },
  });
};

export const getAllOrders = async ({
  pageParam,
  signal,
  userId,
  customerId = "",
  searchWord,
}: {
  pageParam: number;
  signal: AbortSignal;
  userId: string;
  searchWord: string;
  customerId?: string;
}) => {
  const customer = customerId ? { customerId } : {};

  try {
    const response = await axiosConfig({
      url: "api/orders",
      method: "GET",
      params: {
        userId,
        limit: 10,
        offset: pageParam,
        searchWord,
        ...customer,
      },
      signal,
    });

    return response?.data?.data;
  } catch (error) {
    throw new Error(`failed to get orders ${error}`);
  }
};
