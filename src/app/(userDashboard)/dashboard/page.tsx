"use client";
import Search from "@/components/Search";
import { useAuth } from "@clerk/nextjs";

const createUser = async ({ id }: { id: string | null }) => {
  try {
    const response = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    const data = await response.json();
    console.log({ data });
  } catch (error) {
    console.log("error details", error);
  }
};

const Page = () => {
  // const user = auth();
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  // if (userId) {
  //   createUser({ id: userId });
  // }

  return (
    <main className="px-3 my-3">
      <Search placeholder="Search" />
    </main>
  );
};

export default Page;
