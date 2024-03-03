"use client";
import React, { useEffect, useRef, useState } from "react";
import StepOne from "@/components/create-order/stepOne/StepOne";
import StepTwo from "@/components/create-order/StepTwo.tsx/StepTwo";
import { UserIcon } from "@heroicons/react/16/solid";
import { DocumentCheckIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/16/solid";
import { CustomerDetails } from "@/utils/interfaces";
import { AnimatePresence, motion } from "framer-motion";

const CreateOrder = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    userId: "",
    customerId: "",
    name: "",
    number: 0,
    shirtSize: [],
    pantSize: [],
    customerPhoto: "",
    _id: "",
  });
  const stepsContainerRef = useRef(null);

  useEffect(() => {
    const container = stepsContainerRef.current;

    if (container) {
      container.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [activeStep]);

  const variants = {
    initial: {
      y: "20vh",
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

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

  const ActiveComponent = () => {
    if (activeStep === 1) {
      return (
        <StepOne
          setCustomerDetails={setCustomerDetails}
          setActiveStep={setActiveStep}
        />
      );
    } else if (activeStep === 2) {
      return (
        <StepTwo
          customerDetails={customerDetails}
          setCustomerDetails={setCustomerDetails}
          setActiveStep={setActiveStep}
        />
      );
    } else if (activeStep === 3) {
      return <p>Step 3</p>;
    }
  };

  return (
    <section>
      <ol className="flex items-center w-full" ref={stepsContainerRef}>
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

      <AnimatePresence mode="wait">
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: [0.33, 1, 0.68, 1],
          }}
          key={activeStep}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default CreateOrder;
