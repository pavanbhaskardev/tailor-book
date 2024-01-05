import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="grid place-content-center mt-10">
      <SignIn />
    </section>
  );
}
