import React from "react";
import OrderDetailsCard from "./OrderDetailsCard";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getCustomerOrderDetails } from "@/utils/commonApi";

const CustomerOrder = async ({ params }: { params: { slug: string[] } }) => {
  const queryClient = new QueryClient();
  const customerId = params.slug[0];
  const orderId = +params.slug[1];

  await queryClient.prefetchQuery({
    queryKey: ["customer-order", customerId, orderId],
    queryFn: () => getCustomerOrderDetails({ customerId, orderId }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderDetailsCard customerId={customerId} orderId={orderId} />
    </HydrationBoundary>
  );
};

export default CustomerOrder;
