"use client";
/* eslint-disable @next/next/no-img-element */
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowPathIcon, InboxIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { displayStatus } from "@/components/OrderCard";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import axiosConfig from "@/utils/axiosConfig";
import { OrderDetailsType } from "@/utils/interfaces";
import { isEmpty } from "ramda";
import avatarUtil from "@/utils/avatarUtil";
import { formatSize } from "@/components/SizeDrawer";

const Page = ({ params }: { params: { id: string } }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { user } = useUser();
  const queryClient = useQueryClient();

  // order-id details API
  const getOrderDetails = async (signal: AbortSignal) => {
    try {
      const response = await axiosConfig({
        url: "api/orders",
        method: "GET",
        params: {
          userId: user?.id,
          limit: 1,
          offset: 0,
          searchWord: params.id,
        },
        signal,
      });

      return response?.data?.data?.[0];
    } catch (error: unknown) {
      throw new Error(`Failed to get order details ${error}`);
    }
  };

  // update status API
  const updateStatus = async (payload: OrderDetailsType) => {
    await axiosConfig({
      url: "api/orders",
      method: "POST",
      data: payload,
    });
  };

  const {
    data,
    isLoading,
  }: { data: OrderDetailsType | undefined; isLoading: boolean } = useQuery({
    queryKey: ["order-id", params.id],
    queryFn: ({ signal }) => getOrderDetails(signal),
    enabled: user ? true : false,
    staleTime: 0,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["status-update"],
    mutationFn: updateStatus,
    onMutate: (newOrderData: OrderDetailsType) => {
      const previousOrderData = queryClient.getQueryData([
        "order-id",
        params.id,
      ]) as object;

      queryClient.setQueryData(["order-id", params.id], {
        ...previousOrderData,
        status: newOrderData.status,
      });

      return { previousOrderData };
    },

    onError: (err, variables, context) => {
      if (context?.previousOrderData) {
        queryClient.setQueryData(
          ["order-id", params.id],
          context.previousOrderData
        );
      }
    },
  });

  // this is to show the carousel slide status
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, data]);

  // showing a loader on initial
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

  // gives the price in formatted way
  const formattedPrice = (price: number) => {
    const parts = price.toString().split(".");
    // Add commas for thousands
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Join the parts and update the price state
    return parts.join(".");
  };

  // triggered when status select field changes
  const handleStatusChange = (status: string) => {
    let payload;

    if (typeof data?.customerDetails !== "string" && data) {
      payload = {
        ...data,
        customerDetails: data?.customerDetails?._id as string,
        status,
      };

      mutate(payload, {
        onSuccess: () => {
          toast.success("Successfully updated status", { duration: 1500 });
        },

        onError: () => {
          toast.error("Failed updated status", { duration: 1500 });
        },
      });
    }
  };

  if (
    !isEmpty(data || {}) &&
    data &&
    typeof data?.customerDetails !== "string"
  ) {
    const { color, initials } = avatarUtil(data?.customerDetails?.name || "");
    const shirtSize = isEmpty(data?.newShirtSize)
      ? data?.customerDetails?.shirtSize
      : data?.newShirtSize;
    const pantSize = isEmpty(data?.newPantSize)
      ? data?.customerDetails?.pantSize
      : data?.newPantSize;

    return (
      <section className="mt-2">
        <Carousel className="w-full my-3" setApi={setApi}>
          <CarouselContent>
            {data?.orderPhotos.map((src, index) => (
              <CarouselItem key={index}>
                <img
                  alt="order-image"
                  className="aspect-square object-cover rounded-sm sm:h-[500px] sm:aspect-video"
                  src={src}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-2 right-2 backdrop-blur-sm bg-black/50 text-xs px-2 py-1.5 rounded-sm">
            {`${current}/${count}`}
          </div>
        </Carousel>

        <div className="flex justify-between items-center">
          <p className="font-medium"># {data?.orderId}</p>

          <Select
            value={data?.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {Object.entries(displayStatus).map(([key, value]) => {
                  return (
                    <SelectItem value={key} key={key}>
                      {value}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* customer details */}
        <div className="grid gap-2 mt-6">
          <p className="font-medium">Customer:</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={data?.customerDetails?.customerPhoto}
                  alt="@shadcn"
                />
                <AvatarFallback style={{ backgroundColor: color }}>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="capitalize text-sm">
                  {data?.customerDetails?.name}
                </p>
                <span className="text-muted-foreground text-sm">
                  {data?.customerDetails?.number}
                </span>
              </div>
            </div>

            <a href={`tel:+${data?.customerDetails?.number}`}>
              <Button size="icon">
                <PhoneIcon height={16} width={16} />
              </Button>
            </a>
          </div>
        </div>

        {/* sizes */}
        <div className="grid gap-2 mt-6">
          <p className="font-medium">Sizes:</p>

          {!isEmpty(shirtSize) && shirtSize && (
            <p className="text-sm">
              <span className="text-muted-foreground">Shirt Size: </span>

              {shirtSize.map((size, index) => {
                const quarter = Math.floor(size) - size;
                const flooredSize = Math.floor(size);
                return (
                  <span key={index} className="ml-1">
                    {flooredSize} <sup>{formatSize(quarter)}</sup>
                    {index !== shirtSize.length - 1 ? "," : ""}
                  </span>
                );
              })}
            </p>
          )}

          {!isEmpty(pantSize) && pantSize && (
            <p className="text-sm">
              <span className="text-muted-foreground">Pant Size: </span>
              {pantSize.map((size, index) => {
                const quarter = size - Math.floor(size);
                const flooredSize = Math.floor(size);

                return (
                  <span key={index} className="ml-1">
                    {flooredSize} <sup>{formatSize(quarter)}</sup>
                    {index !== pantSize.length - 1 ? "," : ""}
                  </span>
                );
              })}
            </p>
          )}
        </div>

        {/* price & deliveryDate */}
        <div className="grid gap-2 mt-6">
          <p className="font-medium">Details:</p>

          <p className="text-sm">
            <span className="text-muted-foreground">Delivery: </span>
            {format(data?.deliveryDate, "PPP")}
          </p>

          <p className="text-sm">
            <span className="text-muted-foreground">Price: </span>₹{" "}
            {formattedPrice(data?.price)}
          </p>

          {data?.description && (
            <p className="text-sm">
              <span className="text-muted-foreground">Note: </span>
              {data?.description}
            </p>
          )}
        </div>

        {/* Qty */}
        <div className="grid gap-2 mt-6">
          <p className="font-medium">Qty:</p>

          <div className="flex gap-4 text-sm">
            {data?.shirtCount ? (
              <p>
                <span className="text-muted-foreground">Shirt Count: </span>
                {data?.shirtCount}
              </p>
            ) : null}

            {data?.pantCount ? (
              <p>
                <span className="text-muted-foreground">Pant Count: </span>
                {data?.pantCount}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
        <InboxIcon height={40} width={40} className="fill-muted-foreground" />
        <p className="text-muted-foreground">Order details not found!</p>
      </div>
    );
  }
};

export default Page;
