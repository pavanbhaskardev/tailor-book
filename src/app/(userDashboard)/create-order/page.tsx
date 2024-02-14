"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "ramda";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Search from "@/components/Search";
import SizeDrawer from "@/components/SizeDrawer";
import { PlusIcon } from "@heroicons/react/16/solid";
import { formatSize } from "@/components/SizeDrawer";
export interface SizeList {
  size: number;
  id: string;
}

const CreateOrder = () => {
  const [size, setSize] = useState<number>(0);
  const [sizeList, setSizeList] = useState<SizeList[]>([]);
  const [pantSize, setPantSize] = useState<number>(0);
  const [pantSizeList, setPantSizeList] = useState<SizeList[]>([]);
  const [errorStatus, setErrorStatus] = useState({
    shirtListStatus: false,
    pantSizeListStatus: false,
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

  const onSubmit = (values: FieldValues) => {
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

    console.log(values);
  };

  const shirtSizeList = sizeList.map(({ size }, index) => {
    const flooredSize = Math.floor(size);

    return { size: flooredSize, quarter: formatSize(size - flooredSize) };
  });

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
    <section>
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-2xl">Step 1</h2>
      </div>
      <p className="text-muted-foreground text-sm">Enter customer details.</p>

      <Tabs defaultValue="newCustomer" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="newCustomer">New Customer</TabsTrigger>
          <TabsTrigger value="oldCustomer">Old Customer</TabsTrigger>
        </TabsList>

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
        </TabsContent>

        <TabsContent value="oldCustomer" className="space-y-4">
          <Search placeholder="Enter customer name" />
          <Button type="submit" className="gap-1">
            Create Order
            <ArrowRightIcon height={16} width={16} />
          </Button>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default CreateOrder;
