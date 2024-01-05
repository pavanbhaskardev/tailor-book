import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="grid place-content-center mt-10">
      <SignUp />
    </section>
  );
}
