import { Button } from "@/components/button";

export default function NotFound() {
  return (
    <main className="grid w-full min-h-full place-items-center bg-white dark:bg-midnight-950 px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-base leading-7 text-gray-600 dark:text-slate-400">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-4 flex items-center justify-center gap-x-6">
          <Button as="link" href="/" variant="primary">
            Go back home
          </Button>
        </div>
      </div>
    </main>
  );
}
