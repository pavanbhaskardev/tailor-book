"use client";
import React, { useEffect } from "react";
import { toast } from "sonner";

// showing toaster when user goes to offline & online
const NetworkStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const handleOnline = () => {
    toast.success("You're back online");
  };

  const handleOffline = () => {
    toast.error("No internet connection");
  };

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return <>{children}</>;
};

export default NetworkStatusProvider;
