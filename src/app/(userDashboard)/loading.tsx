import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

const Loading = () => {
  return (
    <div className="h-[40vh] flex justify-center items-end">
      <ArrowPathIcon height={24} width={24} className="animate-spin" />
    </div>
  );
};

export default Loading;
