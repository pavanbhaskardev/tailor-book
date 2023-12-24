import React from "react";
import { Input } from "./ui/input";

const Search = ({ placeholder }: { placeholder: string }) => {
  return (
    <div className="">
      <Input type="text" placeholder={placeholder} />
    </div>
  );
};

export default Search;
