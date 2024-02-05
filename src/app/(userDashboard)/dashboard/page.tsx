"use client";
import Search from "@/components/Search";
import { useAuth } from "@clerk/nextjs";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const getCustomerList = async (userId: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/customer?id=${userId}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    console.log({ data });
  } catch (error) {
    console.log("error details", error);
  }
};

const Page = () => {
  // const user = auth();
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  if (userId) {
    getCustomerList(userId);
  }

  return (
    <section className="relative" style={{ height: "calc(100vh - 5.125rem)" }}>
      <Search placeholder="Search" />

      <Button
        size="icon"
        className="absolute bottom-0 right-0 w-12 h-12"
        asChild
      >
        <Link href="/create-order">
          <PlusIcon height={24} width={24} />
        </Link>
      </Button>
    </section>
  );
};

export default Page;
