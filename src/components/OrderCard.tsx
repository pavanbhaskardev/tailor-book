"use client";
import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { OrderDetailsType } from "@/utils/interfaces";

export const displayStatus: { [key: string]: string } = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

export const badgeColor: { [key: string]: string } = {
  todo: "bg-slate-400 hover:bg-slate-400/90",
  inProgress: "bg-blue-400 hover:bg-blue-400/90",
  done: "bg-emerald-400 hover:bg-emerald-400/90",
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
    <Link href={`/orders/${details?.orderId}`}>
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        transition={{
          delay: 0.05 * index,
          ease: [0.33, 1, 0.68, 1],
        }}
        className="flex gap-4 bg-card p-3 mb-3 rounded-md hover:bg-stone-800"
        ref={lastElement}
      >
        <Image
          height={110}
          width={120}
          src={details?.orderPhotos?.[0]}
          alt={`order_image_${index}`}
          className="h-[110px] w-[120px] object-cover rounded-sm"
        />

        <div className="flex flex-col gap-1 grow h-full">
          <div className="flex w-full justify-between items-end">
            <p className="font-medium leading-5"># {details?.orderId}</p>
            <Badge className={badgeColor[details?.status]}>
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
        </div>
      </motion.div>
    </Link>
  );
};

export default OrderCard;
