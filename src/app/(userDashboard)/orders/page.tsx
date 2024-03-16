"use client";
import React, { useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/16/solid";
import { isEmpty } from "ramda";
import { ArrowPathIcon, InboxIcon } from "@heroicons/react/24/solid";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Search from "@/components/Search";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import axiosConfig from "@/utils/axiosConfig";
import { OrderDetailsType } from "@/utils/interfaces";
import OrderCard from "@/components/OrderCard";

const DisplayStatus: { [key: string]: string } = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

// image files animation variants
const variants = {
  initial: {
    y: "40px",
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
};

const Page = () => {
  const { user } = useUser();
  const observer = useRef<IntersectionObserver>(null);

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

  const getAllOrders = async ({
    pageParam,
    signal,
  }: {
    pageParam: number;
    signal: AbortSignal;
  }) => {
    try {
      const response = await axiosConfig({
        url: "api/orders",
        method: "GET",
        params: {
          userId: user?.id,
          limit: 10,
          offset: pageParam,
        },
        signal,
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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["order-list"],
      queryFn: ({ pageParam, signal }) => getAllOrders({ pageParam, signal }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 10) {
          return allPages.length * 10;
        }

        return undefined;
      },
      enabled: user ? true : false,
    });

  const orderData = useMemo(() => {
    if (data && Array.isArray(data?.pages)) {
      return data.pages.flat();
    } else {
      return [];
    }
  }, [data]);

  // this is for infinite query
  const lastElement = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasNextPage) {
        return;
      }

      if (isFetchingNextPage) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio > 0) {
          fetchNextPage();
        }
      });

      observer.current.observe(node);
    },
    [data, isFetchingNextPage]
  );

  return (
    <section className="relative">
      <Search
        className="mt-1 mb-4"
        value=""
        placeholder="Search"
        onChange={() => {}}
        spin={false}
      />

      {isLoading && (
        <div className="flex w-screen justify-center items-center h-[60vh] ">
          <ArrowPathIcon
            height={24}
            width={24}
            className="animate-spin fill-muted-foreground"
          />
        </div>
      )}

      {!isEmpty(orderData) && !isLoading ? (
        <>
          {orderData.map((details: OrderDetailsType, index) => (
            <OrderCard
              details={details}
              index={index}
              key={details?.orderId}
              lastElement={orderData.length === index + 1 ? lastElement : null}
            />
          ))}

          {isFetchingNextPage && (
            <ArrowPathIcon
              height={24}
              width={24}
              className="animate-spin fill-muted-foreground mx-auto"
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
          <InboxIcon height={40} width={40} className="fill-muted-foreground" />
          <p className="text-muted-foreground">No order created</p>
        </div>
      )}

      <Button size="icon" className="fixed bottom-2 right-2 w-12 h-12" asChild>
        <Link href="/create-order">
          <PlusIcon height={24} width={24} />
        </Link>
      </Button>
    </section>
  );
};

export default Page;
