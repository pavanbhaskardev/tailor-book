"use client";
import React from "react";
import { Bars2Icon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const authenticatedLinks = user
    ? [
        {
          title: "Customers",
          link: "/customers",
          icon: <UsersIcon height={24} width={24} />,
          active: pathname.includes("customers"),
        },
      ]
    : [];

  const navLinks = [
    ...authenticatedLinks,

    // support page
    {
      title: "Support",
      link: "/support",
      icon: <QuestionMarkCircleIcon height={24} width={24} />,
      active: pathname.includes("support"),
    },
  ];

  return (
    <nav className="flex justify-between items-center px-5 py-3 bg-card">
      <Link href={"/"}>
        <span className="flex items-center gap-1">
          <BookOpenIcon height={24} width={24} className="fill-primary" />
          <h1>Tailor Book</h1>
        </span>
      </Link>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Bars2Icon height={24} width={24} className="cursor-pointer" />
          </Button>
        </SheetTrigger>
        <SheetContent className="pt-10">
          {user ? (
            <div className="grid ">
              <SheetHeader>
                <Avatar className="h-11 w-11 mb-2">
                  <AvatarImage
                    src={user?.imageUrl}
                    alt={user?.fullName || ""}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </SheetHeader>

              <p className="text-ellipsis overflow-hidden">{user?.fullName}</p>
              <Link href="/profile" className="text-xs text-muted-foreground">
                View profile
              </Link>
              <Separator className="my-4" />
            </div>
          ) : null}

          {navLinks.map((details, index) => {
            if (details) {
              const { title, icon, link, active } = details;
              return (
                <SheetClose asChild key={index}>
                  <Link
                    href={link}
                    className={`flex items-center gap-4 mt-2 hover:underline pr-3 py-2 rounded-md ${
                      active && "underline"
                    }`}
                    key={index}
                  >
                    {[icon, title]}
                  </Link>
                </SheetClose>
              );
            } else {
              return null;
            }
          })}
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
