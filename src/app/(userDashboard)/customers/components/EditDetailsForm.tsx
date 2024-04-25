"use client";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SizeDrawer, { formatSize } from "@/components/SizeDrawer";
import { PlusIcon } from "@heroicons/react/16/solid";
import { SizeList } from "@/utils/interfaces";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "ramda";
import { CustomerDetails } from "@/utils/interfaces";

type FormType = {
  customerDetails: CustomerDetails;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditDetailsForm = ({ customerDetails, setShowForm }: FormType) => {
  const [size, setSize] = useState<number>(0);
  const [shirtList, setShirtList] = useState<SizeList[]>([]);
  const [pantSize, setPantSize] = useState<number>(0);
  const [pantSizeList, setPantSizeList] = useState<SizeList[]>([]);
  const [errorStatus, setErrorStatus] = useState({
    shirtListStatus: false,
    pantSizeListStatus: false,
    imageSizeStatus: false,
  });
  const [avatarURL, setAvatarURL] = useState<string>("");

  const customerSchema = z.object({
    customerName: z
      .string({
        required_error: "Name is required",
      })
      .min(3, "Name must be at least 3 characters"),
    phoneNumber: z
      .string({
        required_error: "Phone Number is required",
      })
      .min(10, "Number must be at least 10 characters"),
  });

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: customerDetails.name,
      phoneNumber: customerDetails.number.toString(),
    },
  });

  // returns the formatted sizes list
  const shirtSizeList = shirtList.map(({ size }, index) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  // returns the formatted sizes list
  const formattedPantSizeList = pantSizeList.map(({ size }, index) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  const onDrawerClose = () => {
    if (!isEmpty(shirtSizeList)) {
      setErrorStatus((current) => ({ ...current, shirtListStatus: false }));
    }

    if (!isEmpty(pantSizeList)) {
      setErrorStatus((current) => ({
        ...current,
        pantSizeListStatus: false,
      }));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          console.log(values);
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          <Label
            className={`${
              errorStatus.imageSizeStatus ? "text-destructive" : ""
            }`}
          >
            Photo
          </Label>

          <div className="flex gap-2 items-center">
            <Avatar className="bg-input">
              <AvatarImage
                src={avatarURL}
                // className="object-cover"
                alt="customer"
              />
            </Avatar>
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              //   onChange={handleImageChange}
            />
          </div>

          {errorStatus.imageSizeStatus && (
            <FormDescription className="text-destructive">
              File size can&apos;t be greater than 5MB
            </FormDescription>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Label
            className={`${
              errorStatus.pantSizeListStatus && errorStatus.shirtListStatus
                ? "text-destructive"
                : ""
            }`}
          >
            Shirt Size
          </Label>

          <div className="flex flex-wrap gap-3 items-center border border-input p-2 rounded-sm">
            {shirtSizeList.map(({ size, quarter }, index) => (
              <span key={index}>
                {size} <sup>{quarter}</sup>
                {index !== shirtSizeList.length - 1 ? "," : ""}
              </span>
            ))}

            <SizeDrawer
              name={"Shirt Size"}
              size={size}
              setSize={setSize}
              sizeList={shirtList}
              setSizeList={setShirtList}
              onDrawerClose={onDrawerClose}
            >
              <Button type="button" variant="secondary" size="icon">
                <PlusIcon height={16} width={16} />
              </Button>
            </SizeDrawer>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label
            className={`${
              errorStatus.pantSizeListStatus && errorStatus.shirtListStatus
                ? "text-destructive"
                : ""
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
              name={"Pant Size"}
              size={pantSize}
              setSize={setPantSize}
              sizeList={pantSizeList}
              setSizeList={setPantSizeList}
              onDrawerClose={onDrawerClose}
            >
              <Button type="button" variant="secondary" size="icon">
                <PlusIcon height={16} width={16} />
              </Button>
            </SizeDrawer>
          </div>
          {errorStatus.pantSizeListStatus && errorStatus.shirtListStatus && (
            <FormDescription className="text-destructive">
              Shirt or Pant list is required
            </FormDescription>
          )}
        </div>

        <div className="flex w-full justify-end">
          <Button type="submit" className="mr-2">
            Save
          </Button>
          <Button
            variant="outline"
            type="reset"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditDetailsForm;
