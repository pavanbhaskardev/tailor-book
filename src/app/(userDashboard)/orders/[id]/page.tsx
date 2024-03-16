"use client";
/* eslint-disable @next/next/no-img-element */
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { ArrowPathIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

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
import { OrderDetailsType, CustomerDetails } from "@/utils/interfaces";
import { isEmpty, type } from "ramda";
import avatarUtil from "@/utils/avatarUtil";
import { formatSize } from "@/components/SizeDrawer";

const Page = ({ params }: { params: { id: string } }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { user } = useUser();

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

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const {
    data,
    isLoading,
  }: { data: OrderDetailsType | undefined; isLoading: boolean } = useQuery({
    queryKey: ["order-id"],
    queryFn: ({ signal }) => getOrderDetails(signal),
    enabled: user ? true : false,
  });

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

  const formattedPrice = (price: number) => {
    const parts = price.toString().split(".");
    // Add commas for thousands
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Join the parts and update the price state
    return parts.join(".");
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
                  className="aspect-square object-cover rounded-sm"
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
          <p className="font-medium"># 1</p>

          <Select defaultValue="todo">
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
        </div>

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
      </section>
    );
  }
};

export default Page;
