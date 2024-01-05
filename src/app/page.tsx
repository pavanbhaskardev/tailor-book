// "use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useAuth } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col grow-0 items-start justify-center px-5 gap-2 mt-5">
      <h1 className="text-4xl text-pretty">
        Tailoring made <span className="text-primary">simple.</span>
      </h1>
      <p className="text-muted-foreground">
        One place to track measurements & orders.
      </p>
      <Button asChild>
        <Link href={"/sign-in"}>Get Started</Link>
      </Button>
    </main>
  );
}
