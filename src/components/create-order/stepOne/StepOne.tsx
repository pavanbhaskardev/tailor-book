"use client";
import React, { ChangeEvent, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Avatar, AvatarImage } from "../../ui/avatar";
import Search from "@/components/Search";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon, ArrowRightIcon } from "@heroicons/react/16/solid";
import { isEmpty } from "ramda";
import { CustomerDetails, SizeList } from "@/utils/interfaces";
import { useAuth } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldValues, useForm } from "react-hook-form";
import { formatSize } from "@/components/SizeDrawer";
import SizeDrawer from "@/components/SizeDrawer";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useQuery, useMutation, useIsMutating } from "@tanstack/react-query";
import { RadioGroup } from "@/components/ui/radio-group";
import UserOption from "./UserOption";
import {
  uploadImageToS3,
  createNewCustomer,
  getOldCustomersList,
} from "@/utils/commonApi";
import useDebounce from "@/utils/useDebounce";

interface StepOneProps {
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

const maxFileSize = 1024 * 1024 * 7;

const StepOne = ({ setCustomerDetails, setActiveStep }: StepOneProps) => {
  const [size, setSize] = useState<number>(0);
  const [shirtList, setShirtList] = useState<SizeList[]>([]);
  const [pantSize, setPantSize] = useState<number>(0);
  const [pantSizeList, setPantSizeList] = useState<SizeList[]>([]);
  const [errorStatus, setErrorStatus] = useState({
    shirtListStatus: false,
    pantSizeListStatus: false,
    imageSizeStatus: false,
  });
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [avatarURL, setAvatarURL] = useState<string>("");
  const [searchWord, setSearchWord] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const debouncedValue = useDebounce({ value: searchWord, delay: 800 });
  const { userId } = useAuth();
  const btnRef = useRef<HTMLButtonElement>(null);
  const isMutating = useIsMutating();

  const {
    data: oldCustomersData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["old-customers-list", debouncedValue],
    queryFn: ({ signal }) => {
      setSelectedCustomerId("");
      return getOldCustomersList({
        searchWord: debouncedValue,
        id: userId || "",
        offset: 0,
        limit: 20,
        sortBy: "asc",
        signal,
      });
    },
  });

  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: uploadImageToS3,
    mutationKey: ["upload-to-s3"],
  });

  const { mutate } = useMutation({
    mutationFn: createNewCustomer,
    mutationKey: ["create-customer"],
  });

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

  const onSubmit = async (values: FieldValues) => {
    let imageURL = "";

    // not uploading data when shirt or pant size is empty
    if ((isEmpty(shirtSizeList) && isEmpty(pantSizeList)) || !userId) {
      return;
    }

    // if user uploaded image greater than 10mb exiting api call
    if (imageFile && imageFile.size > maxFileSize) {
      return;
    }

    // checking if user added photo or not
    if (imageFile) {
      await uploadImageMutation(
        {
          file: imageFile,
          imageCompression: "resize",
        },
        {
          onSuccess: (response) => {
            console.log(response);

            imageURL = response?.data?.data;
          },
          onError: (error) => {
            console.log(error);
            imageURL = "";
          },
        }
      );
    }

    mutate(
      {
        name: values.customerName,
        number: values.phoneNumber,
        userId,
        customerId: uuidv4(),
        shirtSize: !isEmpty(shirtList) ? shirtList.map(({ size }) => size) : [],
        pantSize: !isEmpty(pantSizeList)
          ? pantSizeList.map(({ size }) => size)
          : [],
        customerPhoto: imageURL,
      },
      {
        onSuccess: (response) => {
          setCustomerDetails(response?.data?.data);
          setActiveStep(2);
        },
      }
    );
  };

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

  // storing the image in state when the upload the image
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file);

    if (file && file?.size > maxFileSize) {
      setErrorStatus((current) => ({ ...current, imageSizeStatus: true }));
    } else {
      setErrorStatus((current) => ({ ...current, imageSizeStatus: false }));
    }

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchWord(e.target.value);
  };

  // triggered when old customers selected
  const handleValueChange = (id: string) => {
    setSelectedCustomerId(id);
    const submitBtn = btnRef.current;

    // scrolls to the submit button after selecting a customer
    if (submitBtn) {
      setTimeout(() => {
        submitBtn.scrollIntoView({ behavior: "smooth" });
      }, 10);
    }
  };

  const handleCustomerSelect = () => {
    const data = oldCustomersData.filter(
      (details: CustomerDetails) => details?.customerId === selectedCustomerId
    )[0];

    setCustomerDetails(data);
    setActiveStep(2);
  };

  return (
    <Tabs defaultValue="newCustomer" className="pb-4">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="newCustomer">New Customer</TabsTrigger>
        <TabsTrigger value="oldCustomer">Old Customer</TabsTrigger>
      </TabsList>

      {/* creating customer content */}
      <TabsContent value="newCustomer">
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
                  onChange={handleImageChange}
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
              {errorStatus.pantSizeListStatus &&
                errorStatus.shirtListStatus && (
                  <FormDescription className="text-destructive">
                    Shirt or Pant list is required
                  </FormDescription>
                )}
            </div>

            <Button
              type="submit"
              onClick={validateSizeList}
              className="gap-1"
              disabled={isMutating === 1}
            >
              Create Customer
              {isMutating ? (
                <ArrowPathIcon
                  height={20}
                  width={20}
                  className="animate-spin"
                />
              ) : (
                <ArrowRightIcon height={16} width={16} />
              )}
            </Button>
          </form>
        </Form>
      </TabsContent>

      {/* adding existing customer */}
      <TabsContent value="oldCustomer" className="space-y-4">
        <Search
          placeholder="Enter customer name"
          value={searchWord}
          onChange={handleChange}
        />

        <RadioGroup
          value={selectedCustomerId}
          onValueChange={handleValueChange}
        >
          {!isEmpty(oldCustomersData || [])
            ? oldCustomersData?.map(
                (details: CustomerDetails, index: number) => {
                  return <UserOption details={details} key={index} />;
                }
              )
            : null}
        </RadioGroup>

        {isEmpty(oldCustomersData || []) &&
        !isLoading &&
        !isFetching &&
        oldCustomersData ? (
          <p className="text-center">No results found!</p>
        ) : null}

        {isLoading && (
          <ArrowPathIcon
            height={24}
            width={24}
            className="animate-spin fill-muted-foreground mx-auto"
          />
        )}

        <Button
          type="submit"
          className={`gap-1 ${
            !isEmpty(selectedCustomerId) ? "flex" : "hidden"
          }`}
          ref={btnRef}
          onClick={handleCustomerSelect}
        >
          Create Order
          <ArrowRightIcon height={16} width={16} />
        </Button>
      </TabsContent>
    </Tabs>
  );
};

export default StepOne;
