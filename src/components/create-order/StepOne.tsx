import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarImage } from "../ui/avatar";
import SizeDrawer from "../SizeDrawer";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/16/solid";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "ramda";
import { formatSize } from "../SizeDrawer";
import axiosConfig from "@/utils/axiosConfig";
import { useAuth } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";

export interface SizeList {
  size: number;
  id: string;
}

const StepOne = () => {
  const [size, setSize] = useState<number>(0);
  const [sizeList, setSizeList] = useState<SizeList[]>([]);
  const [pantSize, setPantSize] = useState<number>(0);
  const [pantSizeList, setPantSizeList] = useState<SizeList[]>([]);
  const [errorStatus, setErrorStatus] = useState({
    shirtListStatus: false,
    pantSizeListStatus: false,
  });
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [avatarURL, setAvatarURL] = useState<string>("");
  const { userId } = useAuth();

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
  });

  const uploadImageToS3 = async ({
    file,
    url,
  }: {
    file: File;
    url: string;
  }) => {
    try {
      const response: { config: { url: string } } = await axiosConfig({
        url,
        method: "PUT",
        data: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      console.log(response);
      return response?.config?.url;
    } catch (error: unknown) {
      console.log(error);
      return "";
    }
  };

  const onSubmit = async (values: FieldValues) => {
    let imageURL = "";
    // handling the validation for controlled inputs shirtSize & pantSize
    if (isEmpty(shirtSizeList)) {
      setErrorStatus((current) => ({ ...current, shirtListStatus: true }));
    } else {
      setErrorStatus((current) => ({ ...current, shirtListStatus: false }));
    }

    if (isEmpty(pantSizeList)) {
      setErrorStatus((current) => ({ ...current, pantSizeListStatus: true }));
    } else {
      setErrorStatus((current) => ({ ...current, pantSizeListStatus: false }));
    }

    if (imageFile) {
      try {
        const response = await axiosConfig.get("/api/images", {
          params: { fileSize: imageFile.size, fileType: imageFile.type },
        });

        imageURL = await uploadImageToS3({
          url: response.data.url,
          file: imageFile,
        });
      } catch (error) {
        console.log({ error });
      }
    }

    try {
      const response = await axiosConfig({
        url: "/api/customer",
        method: "POST",
        data: {
          userId: userId,
          customerId: uuidv4(),
          name: values.customerName,
          number: values.phoneNumber,
          shirtSize: shirtSizeList.map(({ size }) => size),
          pantSize: pantSizeList.map(({ size }) => size),
          customerPhoto: imageURL,
        },
      });

      console.log({ response });
    } catch (error) {
      console.log({ error });
    }
  };

  const shirtSizeList = sizeList.map(({ size }, index) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  const formattedPantSizeList = pantSizeList.map(({ size }, index) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

  // here validating the sizeList conditions
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file);

    if (avatarURL) {
      URL.revokeObjectURL(avatarURL);
    }

    // this gives the preview of the image to the user
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarURL(url);
    } else {
      setAvatarURL("");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
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
          <Label>Photo</Label>

          <div className="flex gap-2 items-center">
            <Avatar className="bg-input">
              <AvatarImage
                src={avatarURL}
                className="object-cover"
                alt="customer"
              />
            </Avatar>
            <Input
              type="file"
              capture="user"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label
            className={`${
              errorStatus.shirtListStatus ? "text-destructive" : ""
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
              sizeList={sizeList}
              setSizeList={setSizeList}
              onDrawerClose={onDrawerClose}
            >
              <Button type="button" variant="secondary" size="icon">
                <PlusIcon height={16} width={16} />
              </Button>
            </SizeDrawer>
          </div>
          {errorStatus.shirtListStatus && (
            <FormDescription className="text-destructive">
              Shirt list can&apos;t be empty
            </FormDescription>
          )}
        </div>

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
          {errorStatus.pantSizeListStatus && (
            <FormDescription className="text-destructive">
              Pant list can&apos;t be empty
            </FormDescription>
          )}
        </div>

        <Button type="submit" className="gap-1">
          Create Customer
          <ArrowRightIcon height={16} width={16} />
        </Button>
      </form>
    </Form>
  );
};

export default StepOne;
