import React, { ChangeEvent } from "react";
import { Input } from "./ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

interface SearchProps {
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  spin: boolean;
  className?: string;
}

const Search = ({
  placeholder,
  onChange,
  value,
  spin,
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
      {spin && (
        <ArrowPathIcon
          height={20}
          width={20}
          className="absolute top-[0.5rem] right-2 animate-spin fill-muted-foreground"
        />
      )}
    </div>
  );
};

export default Search;
