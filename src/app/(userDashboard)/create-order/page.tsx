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
import SizeDrawer from "@/components/SizeDrawer";
import { PlusIcon } from "@heroicons/react/16/solid";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { AnimatePresence, motion } from "framer-motion";

export interface SizeList {
  size: number;
  id: string;
}

const CreateOrder = () => {
  const [size, setSize] = useState<number>(0);
  const [sizeList, setSizeList] = useState<SizeList[]>([]);

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

  const removeSize = (index: number) => {
    const newList = sizeList.filter((size, i) => i !== index);
    setSizeList(newList);
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

              <div className="relative">
                <Label>Shirt Size</Label>

                <SizeDrawer
                  name={"Shirt Size"}
                  size={size}
                  setSize={setSize}
                  sizeList={sizeList}
                  setSizeList={setSizeList}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute right-2 bottom-2"
                  >
                    <PlusIcon height={16} width={16} />
                  </Button>
                </SizeDrawer>
              </div>

              <div>
                <Label>Pant Size</Label>
                <div className="w-full h-24 border border-input rounded-sm mt-2"></div>
              </div>

              <Button type="submit" className="gap-1">
                Create Order
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
