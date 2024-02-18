export interface SizeList {
  size: number;
  id: string;
}

export interface CustomerDetails {
  userId: string;
  customerId: string;
  name: string;
  number: number;
  shirtSize: number[];
  pantSize: number[];
  customerPhoto: string;
}
