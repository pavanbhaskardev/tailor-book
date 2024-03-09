"use client";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useQuery } from "@tanstack/react-query";
import Search from "@/components/Search";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import axiosConfig from "@/utils/axiosConfig";

const Page = () => {
  const { user } = useUser();

  const createNewUser = async () => {
    try {
      const response = await axiosConfig({
        url: "api/user",
        method: "POST",
        data: {
          id: user?.id,
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          incrementOrder: "false",
        },
      });

      return response?.data?.data;
    } catch (error) {
      console.log({ error });
      return error;
    }
  };

  // this hook is to create a new user in mongoDB
  useQuery({
    queryKey: ["user-details"],
    queryFn: createNewUser,
    enabled: user ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return (
    <section className="relative" style={{ height: "calc(100vh - 5.125rem)" }}>
      {/* <Search placeholder="Search" onChange={()=>{}} spin={false}/> */}

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
