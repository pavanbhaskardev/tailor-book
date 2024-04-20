export interface SizeList {
  size: number;
  id: string;
}

export type CustomerDetails = {
  userId: string;
  customerId: string;
  name: string;
  number: number;
  shirtSize: number[];
  pantSize: number[];
  customerPhoto: string;
  _id?: string;
};

export type OrderDetailsType = {
  userId: string;
  customerId: string;
  customerDetails: string | CustomerDetails;
  orderId: number;
  status: string;
  orderPhotos: string[];
  deliveryDate: Date;
  description?: string;
  newShirtSize?: number[];
  newPantSize?: number[];
  price: number;
  shirtCount: number;
  pantCount: number;
};

export type UserDetailsType = {
  id: string;
  name: string;
  email: string;
  incrementOrder: "true" | "false";
};

export type EmailPayloadType = {
  fromAddress: string;
  url: string;
  errorMessage: string;
};

export interface OldCustomerAPIType {
  id: string;
  limit: number;
  offset: number;
  searchWord: string;
  sortBy: string;
  signal: AbortSignal;
}
