import { useEffect, useState } from "react";

export const Currency = ({
  value,
  currency,
}: {
  value: number;
  currency: string;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
  }).format(value);
};
