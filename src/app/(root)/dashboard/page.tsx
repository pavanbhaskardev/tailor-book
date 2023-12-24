import Search from "@/components/Search";
import { currentUser } from "@clerk/nextjs";

const createUser = async (userId: string) => {
  try {
    const response = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      body: JSON.stringify({ id: userId }),
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log({ error });
  }
};

const Page = async () => {
  const user = await currentUser();

  if (user) {
    createUser(user?.id);
  }

  return (
    <main className="px-3 my-3">
      <Search placeholder="Search" />
    </main>
  );
};

export default Page;
