"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Search from "@/components/Search";
import { Slider } from "@/components/ui/slider";
import { NoSymbolIcon } from "@heroicons/react/24/solid";

const CreateOrder = () => {
  const [size, setSize] = useState<number>(0);

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
    console.log(values);
  };

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
    // {
    //   name: <NoSymbolIcon height={24} width={24} />,
    //   value: "reset",
    // },
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
              className="space-y-4"
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

              <div>
                <Label>Shirt Size</Label>

                <Drawer>
                  <DrawerTrigger asChild>
                    <div className="w-full h-24 border border-input rounded-sm mt-2 cursor-pointer"></div>
                  </DrawerTrigger>

                  <DrawerContent className="">
                    <div className="my-5 mx-10 space-y-4">
                      <h3 className="text-4xl text-center font-medium">
                        {formatSize(size)}
                      </h3>

                      <Slider
                        value={[size]}
                        max={120}
                        step={1}
                        onValueChange={([e]) => setSize(e)}
                      />

                      <div className="grid grid-cols-3 gap-2 h-20">
                        {sizeOptions.map(({ value, name }) => {
                          return (
                            <Button
                              key={value}
                              variant="outline"
                              className="h-full text-base"
                              onClick={() =>
                                setSize((previousSize) => previousSize + value)
                              }
                            >
                              {name}
                            </Button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => setSize(0)}>
                          Clear
                        </Button>
                        <Button>Add</Button>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              <div>
                <Label>Pant Size</Label>
                <div className="w-full h-24 border border-input rounded-sm mt-2"></div>
              </div>

              <Button type="submit" className="gap-1">
                Continue
                <ArrowRightIcon height={16} width={16} />
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="oldCustomer" className="space-y-4">
          <Search placeholder="Enter customer name" />
          <Button type="submit" className="gap-1">
            Continue
            <ArrowRightIcon height={16} width={16} />
          </Button>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default CreateOrder;
