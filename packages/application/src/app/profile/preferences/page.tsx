import { Label } from "@/components/label";
import { ThemeSwitcher } from "./client";

export default async function Page() {
  return (
    <div className="my-12 px-12 max-w-3xl mx-auto w-full">
      <Label name="theme" className="mb-2">
        Dark Theme
      </Label>
      <ThemeSwitcher />
    </div>
  );
}
