import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { OrderDetailsType, CustomerDetails } from "@/utils/interfaces";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import {
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import {
  TwitterLogo,
  FacebookLogo,
  WhatsappLogo,
  TelegramLogo,
} from "@/components/Svg";
import { Button } from "@/components/ui/button";

type StepThreeTypes = {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  orderDetails: OrderDetailsType;
  setOrderDetails: React.Dispatch<React.SetStateAction<OrderDetailsType>>;
  customerDetails: CustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
};

const StepThree = ({
  setActiveStep,
  setOrderDetails,
  orderDetails,
  customerDetails,
  setCustomerDetails,
}: StepThreeTypes) => {
  const url =
    process.env.NEXT_PUBLIC_BASE_URL +
    `customer-order/${orderDetails.customerId}/${orderDetails.orderId}`;
  const title = `Hi ${customerDetails.name}👋, Here are your order details: `;

  // resetting all the states to default if customer selected new order
  const handleNewOrder = () => {
    setOrderDetails({
      userId: "",
      customerId: "",
      customerDetails: "",
      orderId: 0,
      status: "",
      orderPhotos: [],
      deliveryDate: new Date(),
      description: "",
      newShirtSize: [],
      newPantSize: [],
      price: 0,
      shirtCount: 0,
      pantCount: 0,
    });

    setCustomerDetails({
      userId: "",
      customerId: "",
      name: "",
      number: 0,
      shirtSize: [],
      pantSize: [],
      customerPhoto: "",
      _id: "",
    });

    setActiveStep(1);
  };

  return (
    <section className="pb-4">
      <div className="p-3 bg-white rounded-sm max-w-max mx-auto">
        <QRCodeSVG
          value={url}
          size={300}
          includeMargin={false}
          className="mx-auto"
        />
      </div>

      <p className="mt-8 mb-3">Share this link via</p>

      <div className="flex justify-between gap-2">
        <FacebookShareButton url={url} title={title}>
          <FacebookLogo />
        </FacebookShareButton>

        <TwitterShareButton url={url} title={title}>
          <TwitterLogo />
        </TwitterShareButton>

        <WhatsappShareButton url={url} title={title}>
          <WhatsappLogo />
        </WhatsappShareButton>

        <TelegramShareButton url={url} title={title}>
          <TelegramLogo />
        </TelegramShareButton>
      </div>

      <div className="flex justify-between mt-40">
        <Button variant="secondary" className="gap-2" asChild>
          <Link href="/orders">
            <ArrowLeftIcon height={16} width={16} />
            Home
          </Link>
        </Button>

        <Button onClick={handleNewOrder}>New Order</Button>
      </div>
    </section>
  );
};

export default StepThree;
