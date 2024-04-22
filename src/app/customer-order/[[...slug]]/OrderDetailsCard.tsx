"use client";
import React, { useEffect, useState } from "react";
import { isEmpty } from "ramda";
import { InboxIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { displayStatus, badgeColor } from "@/components/OrderCard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getCustomerOrderDetails } from "@/utils/commonApi";
import { OrderDetailsType } from "@/utils/interfaces";
import avatarUtil from "@/utils/avatarUtil";
import { formatSize } from "@/components/SizeDrawer";

const OrderDetailsCard = ({
  customerId = "",
  orderId = 0,
}: {
  customerId: string;
  orderId: number;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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
  }, [api]);

  const { data }: { data: OrderDetailsType | undefined } = useQuery({
    queryKey: ["customer-order", customerId, orderId],
    queryFn: () => getCustomerOrderDetails({ customerId, orderId }),
  });

  // gives the price in formatted way
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
      <section className="sm:max-w-2xl sm:mx-auto">
        <Carousel className="w-full my-3" setApi={setApi}>
          <CarouselContent>
            {data?.orderPhotos.map((src, index) => (
              <CarouselItem key={index}>
                <Image
                  alt={`order-image-${index}`}
                  height={300}
                  width={500}
                  className="aspect-square object-cover rounded-sm md:h-[500px] w-full sm:aspect-video"
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
          <Badge className={badgeColor[data?.status]}>
            {displayStatus[data?.status]}
          </Badge>
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

              <p className="capitalize text-sm">
                {data?.customerDetails?.name}
              </p>
            </div>
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

export default OrderDetailsCard;
