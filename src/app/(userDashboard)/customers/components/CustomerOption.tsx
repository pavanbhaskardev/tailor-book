import React from "react";

import { CustomerDetails } from "@/utils/interfaces";
import avatarUtil from "@/utils/avatarUtil";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const CustomerOption = ({
  details,
  lastElement,
}: {
  details: CustomerDetails;
  lastElement: ((node: HTMLAnchorElement | null) => void) | null;
}) => {
  const { color, initials } = avatarUtil(details.name);

  return (
    <Link
      ref={lastElement}
      href={`/customers/${details.customerId}`}
      className="ml-5 pl-4 py-3 flex gap-3 items-center hover:bg-stone-900 transition-colors duration-200"
    >
      <Avatar>
        <AvatarImage src={details.customerPhoto} />
        <AvatarFallback style={{ backgroundColor: color }}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="grid">
        <p className="text-sm capitalize">{details.name}</p>
      </div>
    </Link>
  );
};

export default CustomerOption;
