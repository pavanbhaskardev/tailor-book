"use client";
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "./ui/badge";

type OrderCardType = {
  deliveryDate: Date;
  quantity: number;
  orderId: number;
  pic: string;
  status: string;
};

const DisplayStatus: { [key: string]: string } = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

const OrderCard = ({
  deliveryDate,
  quantity,
  orderId,
  pic,
  status,
}: OrderCardType) => {
  return (
    <div>
      <div className="flex w-full justify-between items-center">
        <p className="font-medium"># {orderId}</p>
        <Badge className="bg-slate-400 hover:bg-slate-400/90">
          {DisplayStatus[status]}
        </Badge>
      </div>

      <div className="flex gap-4 items-center mt-1">
        <img
          src={pic}
          alt="order_image"
          className="h-[110px] w-[110px] object-cover rounded-sm"
        />

        <div className="text-[12px] flex flex-col gap-2">
          <p>
            <span className="text-muted-foreground">Delivery: </span>
            {format(deliveryDate, "PPP")}
          </p>

          <p>
            <span className="text-muted-foreground">Qty: </span>
            {quantity}
          </p>

          <Link
            href="/dashboard"
            className="text-primary cursor-pointer hover:underline"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
