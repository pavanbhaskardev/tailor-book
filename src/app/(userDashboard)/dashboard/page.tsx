"use client";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/16/solid";
import { isEmpty } from "ramda";
import { useQuery } from "@tanstack/react-query";
import Search from "@/components/Search";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import axiosConfig from "@/utils/axiosConfig";
import OrderCard from "@/components/OrderCard";
import { OrderDetailsType } from "@/utils/interfaces";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";

const Page = () => {
  const { user } = useUser();

  const createNewUser = async () => {
    try {
      const response = await axiosConfig({
        url: "api/user",
        method: "POST",
        data: {
          id: user?.id,
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          incrementOrder: "false",
        },
      });

      return response?.data?.data;
    } catch (error) {
      console.log({ error });
      return error;
    }
  };

  const getAllOrders = async () => {
    try {
      const response = await axiosConfig({
        url: "api/orders",
        method: "GET",
        params: {
          userId: user?.id,
          limit: 10,
          offset: 0,
        },
      });

      return response?.data?.data;
    } catch (error) {
      throw new Error(`failed to get orders ${error}`);
    }
  };

  // this hook is to create a new user in mongoDB
  useQuery({
    queryKey: ["user-details"],
    queryFn: createNewUser,
    enabled: user ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["order-details"],
    queryFn: getAllOrders,
    enabled: user ? true : false,
  });

  return (
    <section className="relative" style={{ height: "calc(100vh - 5.125rem)" }}>
      <Search
        className="mt-1"
        value=""
        placeholder="Search"
        onChange={() => {}}
        spin={false}
      />

      <div className="mt-4">
        {!isEmpty(data || [])
          ? data.map((details: OrderDetailsType) => {
              const quantity = details.shirtCount + details.pantCount;

              return (
                <Fragment key={details?.orderId}>
                  <OrderCard
                    deliveryDate={details.deliveryDate}
                    quantity={quantity}
                    orderId={details?.orderId}
                    pic={details.orderPhotos[0]}
                    status={details?.status}
                  />
                  <Separator className="my-4" />
                </Fragment>
              );
            })
          : null}
      </div>

      <Button
        size="icon"
        className="absolute bottom-0 right-0 w-12 h-12"
        asChild
      >
        <Link href="/create-order">
          <PlusIcon height={24} width={24} />
        </Link>
      </Button>
    </section>
  );
};

export default Page;
