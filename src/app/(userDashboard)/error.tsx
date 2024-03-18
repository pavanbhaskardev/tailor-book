"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import axiosConfig from "@/utils/axiosConfig";
import { toast } from "sonner";
import { EmailPayloadType } from "@/utils/interfaces";
import { ArrowPathIcon } from "@heroicons/react/16/solid";

const reportIssue = async (data: EmailPayloadType) => {
  return await axiosConfig({
    url: "api/report",
    method: "POST",
    data,
  });
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { user } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  console.log(error.message);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("there was some error", error);
  }, [error]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["report-issue"],
    mutationFn: reportIssue,
  });

  const handleReport = () => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      const url = `${pathname}?${searchParams}`;

      const data: EmailPayloadType = {
        url,
        errorMessage: JSON.stringify(error.message),
        fromAddress: user.primaryEmailAddress?.emailAddress,
      };

      mutate(data, {
        onSuccess: () => {
          toast.success("Reported issue successfully");
        },
        onError: () => {
          toast.error("Failed to report issue");
        },
      });
    }
  };

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>Something went wrong!</AlertDialogTitle>
          <AlertDialogDescription>
            Please report an issue, we&apos;ll try to fix it asap.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button onClick={handleReport} disabled={isPending} className="gap-1">
            Report issue
            {isPending && (
              <ArrowPathIcon height={20} width={20} className="animate-spin" />
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
