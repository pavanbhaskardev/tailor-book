"use client";
import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import avatarUtil from "@/utils/avatarUtil";
import { CustomerDetails } from "@/utils/interfaces";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { formatSize } from "@/components/SizeDrawer";

const UserOption = ({ details }: { details: CustomerDetails }) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const { color, initials } = avatarUtil(details.name);
  let [scope, { height }] = useMeasure();

  const shirtSizeList = details.shirtSize.map((size) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  const pantSizeList = details.pantSize.map((size) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  return (
    <div className="px-3 py-4 bg-card rounded-sm">
      <div className="flex w-full justify-between">
        <div className="flex gap-3 items-center">
          <RadioGroupItem value={details.customerId} id={details.customerId} />

          <Avatar>
            <AvatarImage src={details.customerPhoto} />
            <AvatarFallback style={{ backgroundColor: color }}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="grid">
            <p className="text-sm capitalize">{details.name}</p>
            <span className="text-[0.75rem] text-muted-foreground">
              {details.number}
            </span>
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          data-state={showMoreDetails ? "open" : "closed"}
          onClick={() => setShowMoreDetails((current) => !current)}
          className="transition-all [&[data-state=open]>svg]:rotate-180"
        >
          <ChevronDownIcon className="h-4 w-4 transition-transform duration-200" />
        </Button>
      </div>

      <motion.div animate={{ height }}>
        {showMoreDetails ? (
          <div className="mt-4 space-y-2 text-sm" ref={scope}>
            <div>
              <span>Shirt size: </span>
              <span className="text-muted-foreground">
                {shirtSizeList.map(({ size, quarter }, index) => (
                  <span key={index}>
                    {size} <sup>{quarter}</sup>
                    {index !== shirtSizeList.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            </div>

            <div>
              <span>Pant size: </span>
              <span className="text-muted-foreground">
                {pantSizeList.map(({ size, quarter }, index) => (
                  <span key={index}>
                    {size} <sup>{quarter}</sup>
                    {index !== pantSizeList.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default UserOption;
