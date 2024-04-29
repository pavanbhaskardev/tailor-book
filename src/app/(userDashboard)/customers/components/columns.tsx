"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OrderDetailsType } from "@/utils/interfaces";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { badgeColor, displayStatus } from "@/components/OrderCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";

export const columns: ColumnDef<OrderDetailsType>[] = [
  {
    accessorKey: "orderId",
    cell: ({ row }) => (
      <Link
        href={`/orders/${row.getValue("orderId")}`}
        className="text-primary hover:text-primary/80"
      >{`#${row.getValue("orderId")}`}</Link>
    ),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "deliveryDate",
    cell: ({ row }) => format(row.getValue("deliveryDate"), "PPP"),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Delivery date
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge className={badgeColor[status]}>{displayStatus[status]}</Badge>
      );
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "price",
    cell: ({ row }) => `₹ ${row.getValue("price")}`,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];
