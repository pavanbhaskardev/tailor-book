"use client";
import React from "react";
import {
  Bars2Icon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import avatarUtil from "@/utils/avatarUtil";

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
  const { color, initials } = avatarUtil(user?.fullName || "");
  const params = new URLSearchParams();
  params.set("height", "200");
  params.set("width", "200");
  params.set("quality", "85");
  params.set("fit", "crop");

  const imageSrc = `${user?.imageUrl}?${params.toString()}`;

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
    <nav className="flex justify-between items-center px-4 py-3 bg-card sticky top-0 z-10">
      <Link href={user ? "/orders" : "/"}>
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
                  <AvatarImage src={imageSrc} alt={user?.fullName || ""} />
                  <AvatarFallback style={{ backgroundColor: color }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </SheetHeader>

              <p className="text-ellipsis overflow-hidden">{user?.fullName}</p>

              <SheetClose asChild>
                <Link
                  href="/profile"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  View profile
                </Link>
              </SheetClose>
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

          {user && (
            <SignOutButton>
              <SheetClose>
                <span className="flex items-center gap-4 mt-2 hover:underline pr-3 py-2 rounded-md">
                  <ArrowLeftStartOnRectangleIcon height={24} width={24} />
                  Sign out
                </span>
              </SheetClose>
            </SignOutButton>
          )}
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
