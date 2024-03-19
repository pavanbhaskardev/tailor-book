import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/orders");
  }

  return (
    <main className="flex flex-col grow-0 items-start justify-center gap-2 mt-5 md:max-w-3xl mx-auto md:mt-10">
      <h1 className="text-4xl text-pretty md:text-7xl">
        Tailoring made <span className="text-primary">simple.</span>
      </h1>
      <p className="text-muted-foreground md:text-lg">
        One place to track measurements & orders.
      </p>
      <Button asChild>
        <Link href={"/sign-in"}>Get Started</Link>
      </Button>
    </main>
  );
}
