"use client";
import React, { useState } from "react";
import StepOne from "@/components/create-order/stepOne/StepOne";
import { UserIcon } from "@heroicons/react/16/solid";
import { DocumentCheckIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/16/solid";
import { CustomerDetails } from "@/utils/interfaces";

const allSteps = {
  1: {
    description: "Customer details",
  },
  2: {
    description: "Order details",
  },
  3: {
    description: "Confirmation",
  },
};

const CreateOrder = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>();

  return (
    <section>
      <ol className="flex items-center w-full">
        <li
          className={`flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block ${
            activeStep !== 1 ? "after:border-primary" : "after:border-input"
          }`}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 bg-primary shrink-0">
            <UserIcon height={20} width={20} className="text-background" />
          </span>
        </li>

        <li
          className={`flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block ${
            activeStep > 2 ? "after:border-primary" : "after:border-input"
          } `}
        >
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 ${
              activeStep >= 2 ? "bg-primary text-background" : "bg-input"
            }  shrink-0`}
          >
            <DocumentCheckIcon height={20} width={20} />
          </span>
        </li>

        <li className="flex items-center w-max">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 ${
              activeStep === 3 ? "bg-primary text-background" : "bg-input"
            }  shrink-0`}
          >
            <CheckIcon height={20} width={20} />
          </span>
        </li>
      </ol>

      <p className="mt-4 mb-8 text-lg text-muted-foreground">
        {allSteps[activeStep].description}
      </p>

      {activeStep === 1 && (
        <StepOne
          setCustomerDetails={setCustomerDetails}
          setActiveStep={setActiveStep}
        />
      )}
    </section>
  );
};

export default CreateOrder;
