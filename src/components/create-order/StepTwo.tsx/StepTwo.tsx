"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import {
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  CalendarIcon,
} from "@heroicons/react/16/solid";
import { isEmpty } from "ramda";
import { v4 as uuidv4 } from "uuid";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { format, endOfToday } from "date-fns";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerDetails, SizeList } from "@/utils/interfaces";
import SizeDrawer, { formatSize } from "@/components/SizeDrawer";
import avatarUtil from "@/utils/avatarUtil";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Form, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

type stepTwoType = {
  customerDetails: CustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
};

const variants = {
  initial: {
    y: "20px",
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: {
    opacity: 0,
    scale: 0,
  },
};

const StepTwo = ({
  customerDetails,
  setCustomerDetails,
  setActiveStep,
}: stepTwoType) => {
  const [shirtSize, setShirtSize] = useState(0);
  const [shirtList, setShirtList] = useState<SizeList[]>(
    customerDetails?.shirtSize.map((size) => ({
      size,
      id: uuidv4(),
    }))
  );
  const [pantSize, setPantSize] = useState(0);
  const [pantList, setPantList] = useState<SizeList[]>(
    customerDetails?.pantSize.map((size) => ({
      size,
      id: uuidv4(),
    }))
  );
  const [date, setDate] = React.useState<Date>();
  const [shirtCount, setShirtCount] = useState(0);
  const [pantCount, setPantCount] = useState(0);
  const [errorStatus, setErrorStatus] = useState({
    shirtListStatus: false,
    pantSizeListStatus: false,
    imageSizeStatus: false,
    clothesCountStatus: false,
    imageCountStatus: false,
    dateStatus: false,
  });
  const [filesList, setFilesList] = useState<File[]>([]);
  const [filesURL, setFilesURL] = useState<string[]>([]);

  // removing the created objectURL's
  useEffect(() => {
    return () => {
      if (!isEmpty(filesURL)) {
        filesURL.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, []);

  const { color, initials } = avatarUtil(customerDetails?.name || "");
  // returns the formatted sizes list
  const formattedShirtSizeList = shirtList.map(({ size }, index) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  // returns the formatted sizes list
  const formattedPantSizeList = pantList.map(({ size }, index) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      const keys = Object.keys(files);
      let filesLength = filesList.length;
      const imageFiles: File[] = [];

      if (filesList.length === 3) {
        return toast.error("Maximum of 3 images allowed per order.");
      } else {
        const imageURL: string[] = [];

        keys.forEach((key) => {
          if (filesLength < 3) {
            imageFiles.push(files[+key]);
            imageURL.push(URL.createObjectURL(files[+key]));
            filesLength += 1;
          }
        });

        setFilesURL((current) => [...current, ...imageURL]);
        setFilesList((current) => [...current, ...imageFiles]);
      }
    }
  };

  const removeFile = (id: number) => {
    const objectURL = filesURL[id];
    const files = filesList.filter((details, index) => index !== id);
    const urls = filesURL.filter((details, index) => index !== id);

    setFilesList(files);
    setFilesURL(urls);
    URL.revokeObjectURL(objectURL);
  };

  const handleSubmit = () => {
    setErrorStatus((current) => ({
      ...current,
      clothesCountStatus: shirtCount === 0 && pantCount === 0,
    }));
  };

  return (
    <section className="space-y-8">
      {/* customer name & number */}
      <div className="flex gap-3 items-center">
        <Avatar className="h-14 w-14">
          <AvatarImage
            src={customerDetails?.customerPhoto || ""}
            alt={customerDetails?.name || ""}
          />
          <AvatarFallback style={{ backgroundColor: color }}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="capitalize text-lg">{customerDetails?.name}</p>
          <span className="text-muted-foreground">
            {customerDetails?.number}
          </span>
        </div>
      </div>

      {/* customer shirt list */}
      <div className="flex flex-col gap-3">
        <Label
          className={`${errorStatus.shirtListStatus ? "text-destructive" : ""}`}
        >
          Shirt Size
        </Label>

        <div className="flex flex-wrap gap-3 items-center border border-input p-2 rounded-sm">
          {formattedShirtSizeList.map(({ size, quarter }, index) => (
            <span key={index}>
              {size} <sup>{quarter}</sup>
              {index !== formattedShirtSizeList.length - 1 ? "," : ""}
            </span>
          ))}

          <SizeDrawer
            name="Shirt Size"
            size={shirtSize}
            setSize={setShirtSize}
            sizeList={shirtList}
            setSizeList={setShirtList}
            onDrawerClose={() => {}}
          >
            <Button type="button" variant="secondary" size="icon">
              <PlusIcon height={16} width={16} />
            </Button>
          </SizeDrawer>
        </div>

        {/* {errorStatus.shirtListStatus && (
          <FormDescription className="text-destructive">
            Shirt list can&apos;t be empty
          </FormDescription>
        )} */}
      </div>

      {/* customer pant list */}
      <div className="flex flex-col gap-3">
        <Label
          className={`${
            errorStatus.pantSizeListStatus ? "text-destructive" : ""
          }`}
        >
          Pant Size
        </Label>

        <div className="flex flex-wrap gap-3 items-center border border-input p-2 rounded-sm">
          {formattedPantSizeList.map(({ size, quarter }, index) => (
            <span key={index}>
              {size} <sup>{quarter}</sup>
              {index !== formattedPantSizeList.length - 1 ? "," : ""}
            </span>
          ))}

          <SizeDrawer
            name="Pant Size"
            size={pantSize}
            setSize={setPantSize}
            sizeList={pantList}
            setSizeList={setPantList}
            onDrawerClose={() => {}}
          >
            <Button type="button" variant="secondary" size="icon">
              <PlusIcon height={16} width={16} />
            </Button>
          </SizeDrawer>
        </div>

        {/* {errorStatus.pantSizeListStatus && (
          <FormDescription className="text-destructive">
            Shirt list can&apos;t be empty
          </FormDescription>
        )} */}
      </div>

      {/* shirt & pant count addition */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 w-1/2">
          <Label
            className={`${
              errorStatus.clothesCountStatus ? "text-destructive" : ""
            }`}
          >
            Shirt Count
          </Label>

          <div className="flex">
            <Button
              size="icon"
              variant="secondary"
              className="flex-none border-r-0 rounded-r-none"
              onClick={() => {
                setShirtCount((value) => {
                  if (value === 0) {
                    return value;
                  }

                  return value - 1;
                });
              }}
            >
              <MinusIcon height={16} width={16} />
            </Button>

            <Input
              className="rounded-none"
              type="number"
              value={shirtCount}
              onChange={(e) => {
                if (e.target.value < "0") {
                  return;
                }

                setShirtCount(+e.target.value);
              }}
            />

            <Button
              size="icon"
              variant="secondary"
              className="flex-none border-l-0 rounded-l-none"
              onClick={() => {
                setShirtCount((value) => {
                  return value + 1;
                });
              }}
            >
              <PlusIcon height={16} width={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-1/2">
          <Label
            className={`${
              errorStatus.clothesCountStatus ? "text-destructive" : ""
            }`}
          >
            Pant Count
          </Label>

          <div className="flex">
            <Button
              size="icon"
              variant="secondary"
              className="flex-none border-r-0 rounded-r-none"
              onClick={() => {
                setPantCount((value) => {
                  if (value === 0) {
                    return value;
                  }

                  return value - 1;
                });
              }}
            >
              <MinusIcon height={16} width={16} />
            </Button>

            <Input
              className="rounded-none"
              type="number"
              value={pantCount}
              onChange={(e) => {
                if (e.target.value < "0") {
                  return;
                }

                setPantCount(+e.target.value);
              }}
            />

            <Button
              size="icon"
              variant="secondary"
              className="flex-none border-l-0 rounded-l-none"
              onClick={() => {
                setPantCount((value) => {
                  return value + 1;
                });
              }}
            >
              <PlusIcon height={16} width={16} />
            </Button>
          </div>
        </div>

        {/* {errorStatus.clothesCountStatus && (
          <FormDescription className="text-destructive">
            Shirt & Pant count can&apos;t be empty
          </FormDescription>
        )} */}
      </div>

      <div className="flex flex-col gap-3">
        <Label
          className={`${errorStatus.dateStatus ? "text-destructive" : ""}`}
        >
          Delivery Date
        </Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(current) => endOfToday() > current}
            />
          </PopoverContent>
        </Popover>

        {/* {errorStatus.dateStatus && (
          <FormDescription className="text-destructive">
            Date can&apos;t be empty
          </FormDescription>
        )} */}
      </div>

      <div className="flex flex-col gap-3">
        <Label>Note</Label>
        <Textarea />
      </div>

      <Label
        htmlFor="dropzone-file"
        className="cursor-pointer flex flex-col items-center justify-center w-full border border-input rounded-sm"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 gap-3 text-muted-foreground">
          <ArrowUpTrayIcon height={24} width={24} />

          <p className="text-sm">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>

          <p className="text-xs">Max image size is 5MB</p>
        </div>

        <input
          id="dropzone-file"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </Label>

      <div className="flex flex-col gap-y-2">
        <AnimatePresence>
          {!isEmpty(filesList)
            ? filesList.map((file, index) => {
                return (
                  <motion.div
                    className="border border-input p-5 rounded-sm flex justify-between items-center gap-2 w-full"
                    key={index}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                    }}
                    layout
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filesURL[index]}
                      className="h-20 w-28 object-cover rounded-sm"
                      alt={file.name}
                    />

                    <p
                      className="text-sm whitespace-nowrap text-ellipsis overflow-hidden"
                      title="Image name.png"
                    >
                      {file.name}
                    </p>

                    <Button
                      size="icon"
                      variant="secondary"
                      className="flex-none"
                      onClick={() => removeFile(index)}
                    >
                      <XMarkIcon height={16} width={16} />
                    </Button>
                  </motion.div>
                );
              })
            : null}
        </AnimatePresence>
      </div>

      <div className="flex w-full justify-between items-center">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => {
            setActiveStep(1);
            setCustomerDetails({
              userId: "",
              customerId: "",
              name: "",
              number: 0,
              shirtSize: [],
              pantSize: [],
              customerPhoto: "",
            });
          }}
        >
          <ChevronLeftIcon height={24} width={24} />
        </Button>

        <Button onClick={handleSubmit}>Create Order</Button>
      </div>
    </section>
  );
};

export default StepTwo;
