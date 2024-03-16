"use client";
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { OrderDetailsType } from "@/utils/interfaces";

export const displayStatus: { [key: string]: string } = {
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

const OrderCard = ({
  details,
  index,
  lastElement,
}: {
  details: OrderDetailsType;
  index: number;
  lastElement: ((node: HTMLDivElement | null) => void) | null;
}) => {
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
      ref={lastElement}
    >
      <img
        src={details?.orderPhotos[0]}
        alt="order_image"
        className="h-[110px] w-[120px] object-cover rounded-sm"
      />

      <div className="flex flex-col gap-1 grow">
        <div className="flex w-full justify-between items-end">
          <p className="font-medium leading-5"># {details?.orderId}</p>
          <Badge className="bg-slate-400 hover:bg-slate-400/90">
            {displayStatus[details?.status]}
          </Badge>
        </div>

        <p className="text-[12px] mt-4">
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
};

export default OrderCard;
