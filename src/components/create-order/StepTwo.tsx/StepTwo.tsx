"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import {
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  CalendarIcon,
} from "@heroicons/react/16/solid";
import { isEmpty, equals } from "ramda";
import { v4 as uuidv4 } from "uuid";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { format, endOfToday } from "date-fns";
import { toast } from "sonner";
import useSound from "use-sound";
import { useMutation } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { uploadImageToS3 } from "@/utils/commonApi";
import { createNewOrder } from "@/utils/commonApi";

type StepTwoType = {
  customerDetails: CustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
};

type FileUrlType = {
  url: string;
  id: string;
};

type FileListType = {
  file: File;
  id: string;
};

const variants = {
  initial: {
    y: "20px",
    opacity: 0,
    scale: 0.75,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
  },
};

const maxFileSize = 1024 * 1024 * 5;

const StepTwo = ({
  customerDetails,
  setCustomerDetails,
  setActiveStep,
}: StepTwoType) => {
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
    pantSizeListStatus: false,
    shirtSizeListStatus: false,
    imageSizeStatus: false,
    clothesCountStatus: false,
    imageCountStatus: false,
    dateStatus: false,
  });
  const [filesList, setFilesList] = useState<FileListType[]>([]);
  const [filesURL, setFilesURL] = useState<FileUrlType[]>([]);
  const [play] = useSound("/sounds/list_removal_sound.mp3", { volume: 0.25 });

  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: uploadImageToS3,
    mutationKey: ["upload-to-s3"],
  });

  const { mutate: createOrderMutation } = useMutation({
    mutationFn: createNewOrder,
    mutationKey: ["create-new-order"],
  });

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
      const imageFiles: FileListType[] = [];

      if (filesList.length === 3) {
        return toast.error("Maximum of 3 images allowed per order.");
      } else {
        const imageURL: FileUrlType[] = [];
        let showMaxSizeToaster = false;

        keys.forEach((key) => {
          if (filesLength < 3) {
            if (files[+key].size > maxFileSize) {
              showMaxSizeToaster = true;
            } else {
              const id = uuidv4();
              imageFiles.push({ file: files[+key], id });
              imageURL.push({
                url: URL.createObjectURL(files[+key]),
                id,
              });

              filesLength += 1;
            }
          }
        });

        if (showMaxSizeToaster) {
          toast.error("Maximum file size is 5MB");
        }

        setFilesURL((current) => [...current, ...imageURL]);
        setFilesList((current) => [...current, ...imageFiles]);
        if (errorStatus.imageCountStatus) {
          setErrorStatus((current) => ({
            ...current,
            imageCountStatus: false,
          }));
        }
      }
    }
  };

  const removeFile = (id: string) => {
    const objectURL = filesURL.filter((urlDetails) => urlDetails.id === id)[0]
      .url;
    const files = filesList.filter((details) => details.id !== id);
    const urls = filesURL.filter((details) => details.id !== id);

    setFilesList(files);
    setFilesURL(urls);
    URL.revokeObjectURL(objectURL);
    play();
  };

  const handleSubmit = async () => {
    // setting the error states
    setErrorStatus((current) => ({
      ...current,
      clothesCountStatus: shirtCount === 0 && pantCount === 0,
      dateStatus: date === undefined,
      imageCountStatus: isEmpty(filesList),
      pantSizeListStatus: pantCount >= 1 && isEmpty(pantList),
      shirtSizeListStatus: shirtCount >= 1 && isEmpty(shirtList),
    }));

    // returning if any validation not met
    if (
      (shirtCount !== 0 || pantCount !== 0) &&
      date !== undefined &&
      !isEmpty(filesList)
    ) {
      if (
        (pantCount >= 1 && isEmpty(pantList)) ||
        (shirtCount >= 1 && isEmpty(shirtList))
      ) {
        return;
      }

      let imageURLs: string[] = [];
      for (const details of filesList) {
        await uploadImageMutation(
          {
            file: details.file,
            imageCompression: "compress",
          },
          {
            onSuccess: (response) => {
              console.log(response?.data?.data);
              imageURLs.push(response?.data?.data);
            },
            onError: (error) => {
              console.log(error);
              imageURLs.push("");
            },
          }
        );
      }

      const shirtSizeList = shirtList.map((details) => details.size);
      const pantSizeList = pantList.map((details) => details.size);

      const newShirtSize = equals(customerDetails.shirtSize, shirtSizeList)
        ? {}
        : { newShirtSize: shirtSizeList };
      const newPantSize = equals(customerDetails.pantSize, pantSizeList)
        ? {}
        : { newShirtSize: pantSizeList };

      const payload = {
        userId: customerDetails.userId,
        customerId: customerDetails.customerId,
        customerDetails: customerDetails._id,
        orderId: uuidv4(),
        status: "todo",
        orderPhotos: imageURLs,
        deliveryDate: date,
        description: "",
        ...newShirtSize,
        ...newPantSize,
        shirtCount,
        pantCount,
      };

      createOrderMutation(payload, {
        onSuccess: (response) => {
          console.log(response);
        },
        onError: (error) => {
          console.log(error);
        },
      });
    }
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
          className={`${
            errorStatus.shirtSizeListStatus ? "text-destructive" : ""
          }`}
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
            onDrawerClose={() => {
              if (!isEmpty(shirtList) && errorStatus.shirtSizeListStatus) {
                setErrorStatus((current) => ({
                  ...current,
                  shirtSizeListStatus: false,
                }));
              }
            }}
          >
            <Button type="button" variant="secondary" size="icon">
              <PlusIcon height={16} width={16} />
            </Button>
          </SizeDrawer>
        </div>

        {errorStatus.shirtSizeListStatus && (
          <p className="text-[0.8rem] font-medium text-destructive">
            Shirt list can&apos;t be empty
          </p>
        )}
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
            onDrawerClose={() => {
              if (!isEmpty(pantList) && errorStatus.pantSizeListStatus) {
                setErrorStatus((current) => ({
                  ...current,
                  pantSizeListStatus: false,
                }));
              }
            }}
          >
            <Button type="button" variant="secondary" size="icon">
              <PlusIcon height={16} width={16} />
            </Button>
          </SizeDrawer>
        </div>

        {errorStatus.pantSizeListStatus && (
          <p className="text-[0.8rem] font-medium text-destructive">
            Pant list can&apos;t be empty
          </p>
        )}
      </div>

      {/* shirt & pant count addition */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
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

                if (errorStatus.clothesCountStatus && shirtCount + 1 > 0) {
                  setErrorStatus((current) => ({
                    ...current,
                    clothesCountStatus: false,
                  }));
                }
              }}
            >
              <PlusIcon height={16} width={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
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

                if (errorStatus.clothesCountStatus && pantCount + 1 > 0) {
                  setErrorStatus((current) => ({
                    ...current,
                    clothesCountStatus: false,
                  }));
                }
              }}
            >
              <PlusIcon height={16} width={16} />
            </Button>
          </div>
        </div>

        {errorStatus.clothesCountStatus && (
          <p className="text-[0.8rem] font-medium text-destructive col-span-2">
            Shirt or Pant count is required
          </p>
        )}
      </div>

      {/* Delivery date */}
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
              onSelect={(date) => {
                setDate(date);

                if (errorStatus.dateStatus) {
                  setErrorStatus((current) => ({
                    ...current,
                    dateStatus: date === undefined,
                  }));
                }
              }}
              initialFocus
              disabled={(current) => endOfToday() > current}
            />
          </PopoverContent>
        </Popover>

        {errorStatus.dateStatus && (
          <p className="text-[0.8rem] font-medium text-destructive">
            Delivery date is required
          </p>
        )}
      </div>

      {/* user note */}
      <div className="flex flex-col gap-3">
        <Label>Note</Label>
        <Textarea />
      </div>

      {/* shirt & pant count */}
      <div className="flex flex-col gap-3">
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

        {errorStatus.imageCountStatus && (
          <p className="text-[0.8rem] font-medium text-destructive">
            Please add image of the clothes for better tracking
          </p>
        )}
      </div>

      {/* images of the clothes */}
      <div className="flex flex-col gap-y-2">
        <AnimatePresence>
          {!isEmpty(filesList)
            ? filesList.map((details, index) => {
                const url = filesURL.filter(
                  (urlDetails) => urlDetails.id === details.id
                )[0].url;

                return (
                  <motion.div
                    className="border border-input p-5 rounded-sm flex justify-between items-center gap-2 w-full"
                    key={details.id}
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
                      src={url}
                      className="h-20 w-28 object-cover rounded-sm"
                      alt={details.file.name}
                    />

                    <p
                      className="text-sm whitespace-nowrap text-ellipsis overflow-hidden"
                      title="Image name.png"
                    >
                      {details.file.name}
                    </p>

                    <Button
                      size="icon"
                      variant="secondary"
                      className="flex-none"
                      onClick={() => removeFile(details.id)}
                    >
                      <XMarkIcon height={16} width={16} />
                    </Button>
                  </motion.div>
                );
              })
            : null}
        </AnimatePresence>
      </div>

      {/* continue & back btn */}
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
              _id: "",
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
