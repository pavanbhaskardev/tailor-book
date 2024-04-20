import React, { ChangeEvent } from "react";
import { Input } from "./ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface SearchProps {
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  spin?: boolean;
  className?: string;
}

const Search = ({
  placeholder,
  onChange,
  value,
  className = "",
}: SearchProps) => {
  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon
        height={20}
        width={20}
        className="absolute top-[0.45rem] left-2 fill-muted-foreground"
      />
      <Input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="px-9"
      />
    </div>
  );
};

export default Search;
