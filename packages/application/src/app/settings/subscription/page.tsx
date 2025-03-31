import { SubscriptionPlans } from "./client";

export default function Page() {
  return (
    <div className="py-12 flex flex-col gap-16">
      <div className="mx-auto w-full max-w-7xl px-12">
        <SubscriptionPlans />
      </div>
    </div>
  );
}
