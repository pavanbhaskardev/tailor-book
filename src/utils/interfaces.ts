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
  _id: string;
};

export type OrderDetailsType = {
  userId: string;
  customerId: string;
  customerDetails: string;
  orderId: string;
  status: string;
  orderPhotos: string[];
  deliveryDate: Date;
  description?: string;
  newShirtSize?: number[];
  newPantSize?: number[];
};
