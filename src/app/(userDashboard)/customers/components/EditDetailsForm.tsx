"use client";
import React, { ChangeEvent, useState } from "react";
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
import { v4 as uuidv4 } from "uuid";
import { type FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "ramda";
import { CustomerDetails } from "@/utils/interfaces";
import {
  createNewCustomer as updateCustomerDetails,
  uploadImageToS3,
  deleteImageFromS3,
} from "@/utils/commonApi";
import {
  useMutation,
  useIsMutating,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

type FormType = {
  customerDetails: CustomerDetails;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | undefined | null;
};

const maxFileSize = 1024 * 1024 * 4;
const EditDetailsForm = ({
  customerDetails,
  setShowForm,
  userId,
}: FormType) => {
  const [size, setSize] = useState<number>(0);
  const [shirtList, setShirtList] = useState<SizeList[]>(() => {
    if (isEmpty(customerDetails.shirtSize)) {
      return [];
    } else {
      return customerDetails.shirtSize.map((sizeDetails) => ({
        size: sizeDetails,
        id: uuidv4(),
      }));
    }
  });

  const [pantSize, setPantSize] = useState<number>(0);
  const [pantSizeList, setPantSizeList] = useState<SizeList[]>(() => {
    if (isEmpty(customerDetails.pantSize)) {
      return [];
    } else {
      return customerDetails.pantSize.map((pantDetails) => ({
        size: pantDetails,
        id: uuidv4(),
      }));
    }
  });

  const [errorStatus, setErrorStatus] = useState({
    shirtListStatus: false,
    pantSizeListStatus: false,
    imageSizeStatus: false,
  });

  const [avatar, setAvatar] = useState<{ url: string; file: undefined | File }>(
    {
      url: "",
      file: undefined,
    }
  );

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

  // uploads image to s3
  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: uploadImageToS3,
    mutationKey: ["upload-to-s3"],
  });

  // updates the customer details
  const { mutateAsync: updateCustomerMutation } = useMutation({
    mutationFn: updateCustomerDetails,
    mutationKey: ["create-customer"],
  });

  // deletes the already uploaded image
  const { mutate: deleteImageMutation } = useMutation({
    mutationFn: deleteImageFromS3,
    mutationKey: ["delete-from-s3"],
  });

  const isMutating = useIsMutating();
  const queryClient = useQueryClient();

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

  // handling the validation for controlled inputs shirtSize & pantSize
  const validateSizeList = () => {
    if (isEmpty(shirtSizeList)) {
      setErrorStatus((current) => ({ ...current, shirtListStatus: true }));
    } else {
      setErrorStatus((current) => ({ ...current, shirtListStatus: false }));
    }

    if (isEmpty(pantSizeList)) {
      setErrorStatus((current) => ({
        ...current,
        pantSizeListStatus: true,
      }));
    } else {
      setErrorStatus((current) => ({
        ...current,
        pantSizeListStatus: false,
      }));
    }
  };

  // storing the image in state when the upload the image
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file?.size > maxFileSize) {
      setErrorStatus((current) => ({ ...current, imageSizeStatus: true }));
    } else {
      setErrorStatus((current) => ({ ...current, imageSizeStatus: false }));
    }

    if (avatar.url) {
      URL.revokeObjectURL(avatar.url);
    }

    // this gives the preview of the image to the user
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar({ url, file });
    } else {
      setAvatar({ url: "", file: undefined });
    }
  };

  const onSubmit = async (values: FieldValues) => {
    let imageURL = "";

    // not uploading data when shirt or pant size is empty
    if ((isEmpty(shirtSizeList) && isEmpty(pantSizeList)) || !userId) {
      return;
    }

    // if user uploaded image greater than 4mb exiting api call
    if (avatar.file && avatar.file.size > maxFileSize) {
      return;
    }

    // deleting the uploaded photo if user uploads new photo
    if (
      customerDetails.customerPhoto &&
      !isEmpty(customerDetails.customerPhoto) &&
      avatar.file
    ) {
      deleteImageMutation({
        id: customerDetails.customerPhoto.split("/")[3],
      });
    }

    // checking if user added photo or not
    if (avatar.file) {
      await uploadImageMutation(
        {
          file: avatar.file,
          imageCompression: "resize",
        },
        {
          onSuccess: (response) => {
            imageURL = response?.data?.data;
          },
          onError: (error) => {
            imageURL = "";
          },
        }
      );
    }

    // updating the customer details
    await updateCustomerMutation(
      {
        name: values.customerName,
        number: values.phoneNumber,
        userId,
        customerId: customerDetails.customerId,
        shirtSize: !isEmpty(shirtList) ? shirtList.map(({ size }) => size) : [],
        pantSize: !isEmpty(pantSizeList)
          ? pantSizeList.map(({ size }) => size)
          : [],
        customerPhoto: imageURL || customerDetails.customerPhoto,
      },
      {
        onSuccess: (response) => {
          if (response?.data?.data) {
            queryClient.setQueryData(
              ["customers-list", customerDetails.customerId],
              () => [response?.data?.data]
            );
          }

          setShowForm(false);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          onSubmit(values);
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
                src={avatar.url}
                // className="object-cover"
                alt="customer"
              />
            </Avatar>
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
            />
          </div>

          {errorStatus.imageSizeStatus && (
            <FormDescription className="text-destructive">
              File size can&apos;t be greater than 4MB
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
          <Button
            type="submit"
            className="mr-2"
            onClick={validateSizeList}
            disabled={isMutating === 1}
          >
            Save
            {isMutating === 1 && (
              <ArrowPathIcon height={20} width={20} className="animate-spin" />
            )}
          </Button>
          <Button
            variant="outline"
            type="reset"
            onClick={() => setShowForm(false)}
            disabled={isMutating === 1}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditDetailsForm;
