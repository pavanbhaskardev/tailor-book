"use client";
/* eslint-disable @next/next/no-img-element */
import React, { Fragment, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/16/solid";
import { isEmpty } from "ramda";
import { format } from "date-fns";
import { ArrowPathIcon, InboxIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Search from "@/components/Search";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import axiosConfig from "@/utils/axiosConfig";
import { OrderDetailsType } from "@/utils/interfaces";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
      console.log({ node, hasNextPage, isFetchingNextPage });

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

  const OrdersList = () => {
    if (isLoading) {
      return (
        <div className="flex w-screen justify-center items-center h-[60vh] ">
          <ArrowPathIcon
            height={24}
            width={24}
            className="animate-spin fill-muted-foreground"
          />
        </div>
      );
    }

    if (!isLoading && !isEmpty(orderData)) {
      return orderData.map((details: OrderDetailsType, index) => {
        const quantity = details.shirtCount + details.pantCount;

        return (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            transition={{
              delay: 0.05 * index,
            }}
            className="flex gap-4 items-center bg-card p-3 mb-3 rounded-md"
            ref={orderData.length === index + 1 ? lastElement : null}
            key={details.orderId}
          >
            <img
              src={details?.orderPhotos[0]}
              alt="order_image"
              className="h-[110px] w-[120px] object-cover rounded-sm"
            />

            <div className="flex flex-col gap-2 grow">
              <div className="flex w-full justify-between items-end">
                <p className="font-medium"># {details?.orderId}</p>
                <Badge className="bg-slate-400 hover:bg-slate-400/90">
                  {DisplayStatus[details?.status]}
                </Badge>
              </div>

              <p className="text-[12px] mt-3">
                <span className="text-muted-foreground">Delivery: </span>
                {format(details?.deliveryDate, "PPP")}
              </p>

              <p className="text-[12px]">
                <span className="text-muted-foreground">Qty: </span>
                {quantity}
              </p>

              <Link
                href="/dashboard"
                className="text-[12px] text-primary cursor-pointer hover:underline"
              >
                Details
              </Link>
            </div>
          </motion.div>
        );
      });
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
          <InboxIcon height={40} width={40} className="fill-muted-foreground" />
          <p className="text-muted-foreground">No order created</p>
        </div>
      );
    }
  };

  return (
    <section className="relative" onScroll={(e) => console.log(e)}>
      <Search
        className="mt-1 mb-4"
        value=""
        placeholder="Search"
        onChange={() => {}}
        spin={false}
      />

      <OrdersList />

      <Button size="icon" className="fixed bottom-2 right-2 w-12 h-12" asChild>
        <Link href="/create-order">
          <PlusIcon height={24} width={24} />
        </Link>
      </Button>
    </section>
  );
};

export default Page;
