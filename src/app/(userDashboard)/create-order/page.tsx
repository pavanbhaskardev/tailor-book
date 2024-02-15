"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Search from "@/components/Search";
import StepOne from "@/components/create-order/StepOne";

const CreateOrder = () => {
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
          <StepOne />
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
