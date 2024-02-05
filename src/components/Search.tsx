import React from "react";
import { Input } from "./ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const Search = ({ placeholder }: { placeholder: string }) => {
  return (
    <div className="relative">
      <MagnifyingGlassIcon
        height={20}
        width={20}
        className="absolute top-[0.45rem] left-2 fill-muted-foreground"
      />
      <Input type="text" placeholder={placeholder} className="pl-9" />
    </div>
  );
};

export default Search;
