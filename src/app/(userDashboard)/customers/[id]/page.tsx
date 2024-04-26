"use client";
import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon } from "@heroicons/react/24/outline";
import { CountdownTimerIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatarUtil from "@/utils/avatarUtil";
import { Button } from "@/components/ui/button";
import { isEmpty } from "ramda";
import { formatSize } from "@/components/SizeDrawer";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerDetails } from "@/utils/interfaces";
import { getOldCustomersList } from "@/utils/commonApi";
import { useAuth } from "@clerk/nextjs";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import EditDetailsForm from "../components/EditDetailsForm";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

const CustomerDetailsPage = ({ params }: { params: { id: string } }) => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const [oldCustomerList] = queryClient.getQueriesData({
    queryKey: ["old-customers-list"],
  });

  const placeholder = useMemo(() => {
    if (isEmpty(oldCustomerList || [])) {
      return {};
    } else {
      const customersList = oldCustomerList[1] as unknown as {
        pages: [] | CustomerDetails[];
      };

      if (isEmpty(customersList.pages)) {
        return {};
      } else {
        return customersList.pages.flat().filter((details) => {
          return details.customerId === params.id;
        });
      }
    }
  }, [oldCustomerList, params.id]);

  const placeholderData = isEmpty(placeholder)
    ? {}
    : { placeholderData: placeholder };

  const {
    data,
    isLoading,
  }: { data: undefined | [CustomerDetails]; isLoading: boolean } = useQuery({
    queryKey: ["customers-list", params.id],
    queryFn: ({ signal }) =>
      getOldCustomersList({
        signal,
        customerId: params.id,
        limit: 1,
        offset: 0,
        id: userId || "",
        searchWord: "",
      }),
    enabled: !!userId && isEmpty(placeholderData),
    ...placeholderData,
  });

  if (isLoading) {
    return (
      <div className="flex w-screen justify-center items-center h-[60vh] sm:max-w-2xl">
        <ArrowPathIcon
          height={24}
          width={24}
          className="animate-spin fill-muted-foreground"
        />
      </div>
    );
  }

  if (!isLoading && !isEmpty(data || []) && data) {
    const [details] = data;
    const { color, initials } = avatarUtil(details.name);

    return (
      <section className="space-y-8 py-4">
        <div className="flex flex-col gap-4 items-start">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage
              src={details.customerPhoto || ""}
              alt={details?.name || ""}
            />
            <AvatarFallback style={{ backgroundColor: color }}>
              {initials}
            </AvatarFallback>
          </Avatar>

          {!showForm && (
            <>
              <div className="flex justify-between w-full">
                <div>
                  <p className="capitalize text-lg">{details?.name}</p>
                  <span className="text-muted-foreground">
                    {details?.number}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setShowForm(true);
                  }}
                >
                  <PencilIcon className="h-4 w-4" /> Edit
                </Button>
              </div>

              <div className="grid">
                <p>Sizes:</p>

                {!isEmpty(details.shirtSize) && details.shirtSize && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Shirt Size: </span>

                    {details.shirtSize.map((size, index) => {
                      const quarter = Math.floor(size) - size;
                      const flooredSize = Math.floor(size);
                      return (
                        <span key={index} className="ml-1">
                          {flooredSize} <sup>{formatSize(quarter)}</sup>
                          {index !== details.shirtSize.length - 1 ? "," : ""}
                        </span>
                      );
                    })}
                  </p>
                )}

                {!isEmpty(details.pantSize) && details.pantSize && (
                  <p className="text-sm mt-1">
                    <span className="text-muted-foreground">Pant Size: </span>
                    {details.pantSize.map((size, index) => {
                      const quarter = size - Math.floor(size);
                      const flooredSize = Math.floor(size);

                      return (
                        <span key={index} className="ml-1">
                          {flooredSize} <sup>{formatSize(quarter)}</sup>
                          {index !== details.pantSize.length - 1 ? "," : ""}
                        </span>
                      );
                    })}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {showForm && (
          <EditDetailsForm
            setShowForm={setShowForm}
            customerDetails={details}
            userId={userId}
          />
        )}

        {!showForm && (
          <div className="pt-6">
            <div className="flex gap-2 items-center">
              <CountdownTimerIcon className="h-5 w-5" />
              <h3>History</h3>
            </div>

            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium">
                      {invoice.invoice}
                    </TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      {invoice.totalAmount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    );
  }

  if (!isLoading && isEmpty(data || [])) {
    return <p className="text-center mt-80">Customer details not found!</p>;
  }
};

export default CustomerDetailsPage;
