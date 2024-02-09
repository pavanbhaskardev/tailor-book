"use client";
import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";

interface SizeDrawerProps {
  children: React.ReactNode;
  handleClear: () => void;
  handleSizeChange: (value: number) => void;
  addQatarSizes: (value: number) => void;
  size: number;
  handleSizeList: () => void;
}

const SizeDrawer = ({
  children,
  handleClear,
  handleSizeChange,
  addQatarSizes,
  size,
  handleSizeList,
}: SizeDrawerProps) => {
  const sizeOptions = [
    {
      name: "1/4",
      value: 0.25,
    },
    {
      name: "1/2",
      value: 0.5,
    },
    {
      name: "3/4",
      value: 0.75,
    },
  ];

  const formatSize = (value: number) => {
    let formattedDecimal = "";
    const tolerance = 0.001; // A small tolerance value to handle floating-point precision issues

    if (Math.abs((value % 1) - 0.25) < tolerance) {
      formattedDecimal = "1/4";
    } else if (Math.abs((value % 1) - 0.5) < tolerance) {
      formattedDecimal = "1/2";
    } else if (Math.abs((value % 1) - 0.75) < tolerance) {
      formattedDecimal = "3/4";
    }

    return `${Math.floor(value)} ${formattedDecimal}`;
  };

  return (
    <Drawer onClose={handleClear}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="">
        <div className="my-5 mx-10 space-y-4">
          <h3 className="text-4xl text-center font-medium">
            {formatSize(size)}
          </h3>

          <Slider
            value={[size]}
            max={120}
            step={1}
            onValueChange={([e]) => handleSizeChange(e)}
          />

          <div className="grid grid-cols-3 gap-2 h-20">
            {sizeOptions.map(({ value, name }) => {
              return (
                <Button
                  key={value}
                  variant="outline"
                  className="h-full text-base"
                  onClick={() => addQatarSizes(value)}
                >
                  {name}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSizeList}>Add</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SizeDrawer;
