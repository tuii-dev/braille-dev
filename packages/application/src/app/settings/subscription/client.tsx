"use client";

import { Fragment, useState } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  seats: number;
  ppm: number;
  premiumApps: boolean;
  price: string;
  available: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    seats: 1,
    ppm: 50,
    premiumApps: false,
    price: "Free!",
    available: true,
  },
  {
    name: "Premium",
    seats: 5,
    ppm: 200,
    premiumApps: true,
    price: "$200",
    available: false,
  },
];

export const SubscriptionPlans = () => {
  const [selected, setSelected] = useState(plans[0]);

  return (
    <fieldset aria-label="Server size">
      <RadioGroup value={selected} onChange={setSelected} className="space-y-4">
        {plans.map((plan) => (
          <Radio
            key={plan.name}
            value={plan}
            aria-label={plan.name}
            aria-description={`${plan.seats} seats, ${plan.ppm} pages per month, ${plan.premiumApps} included, for ${plan.price} per month`}
            className={cn(
              "group relative block cursor-pointer rounded-lg border border-gray-300 bg-white dark:bg-midnight-500 dark:text-white px-6 py-4 shadow-sm focus:outline-none data-[focus]:border-indigo-600 data-[focus]:ring-2 data-[focus]:ring-indigo-600 sm:flex sm:justify-between",
              { "opacity-50 cursor-not-allowed": !plan.available },
            )}
            disabled={!plan.available}
          >
            <span className="flex items-center">
              <span className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-white">
                  {plan.name}
                </span>
                <span className="text-gray-500 dark:text-gray-300  text-sm">
                  <span className="block sm:inline">
                    {plan.seats} {plan.seats > 1 ? "seats" : "seat"} /{" "}
                    {plan.ppm} pages / month
                  </span>{" "}
                  {plan.premiumApps && (
                    <Fragment>
                      <span
                        aria-hidden="true"
                        className="hidden sm:mx-1 sm:inline"
                      >
                        &middot;
                      </span>{" "}
                      <span className="block sm:inline">
                        Access to Premium Apps
                      </span>
                    </Fragment>
                  )}
                </span>
              </span>
            </span>
            <span className="mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right justify-center">
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {plan.price}
              </span>
              {plan.price !== "Free!" && (
                <span className="ml-1 text-gray-500 dark:text-gray-300 sm:ml-0">
                  /mo
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-600"
            />
          </Radio>
        ))}
      </RadioGroup>
    </fieldset>
  );
};
