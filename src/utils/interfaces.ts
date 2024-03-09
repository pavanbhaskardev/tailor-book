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
  customerDetails: string;
  orderId: number;
  status: string;
  orderPhotos: string[];
  deliveryDate: Date;
  description?: string;
  newShirtSize?: number[];
  newPantSize?: number[];
  price: number;
};

export type UserDetailsType = {
  id: string;
  name: string;
  email: string;
  incrementOrder: "true" | "false";
};
