"use client";

import React, { useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";

import {
  ChatBubbleBottomCenterIcon,
  DocumentDuplicateIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import {
  isServer,
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { StatsigProvider } from "@statsig/react-bindings";
import { StatsigClient } from "@statsig/js-client";
import { runStatsigSessionReplay } from "@statsig/session-replay";
import { runStatsigAutoCapture } from "@statsig/web-analytics";
import { Building2, Gauge, LayoutDashboard, Shield } from "lucide-react";
import { Manrope } from "next/font/google";

import { Tenant, UserTenantRole } from "@jptr/braille-prisma";

import { useLastUsedWorkspace } from "@/app/_helpers/hooks/useUserPreferences";

import { Toaster } from "@/components/sonner";
import { Link } from "@/components/link";
import { ProgressProvider } from "@/components/client";
import { useTheme } from "@/components/theme";
import { Hamburger } from "@/components/hamburger";
import { ProfileLinkAvatar } from "@/components/avatar";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

const ConnectionsIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.3723 8.47913C10.5364 8.44957 10.7028 8.43473 10.8696 8.43478C11.2202 8.43478 11.5557 8.49965 11.8647 8.618L13.0943 6.86957L13.1412 6.89617C12.6854 6.38682 12.4338 5.72702 12.4348 5.04348C12.4348 3.5067 13.6806 2.26087 15.2174 2.26087C16.7542 2.26087 18 3.5067 18 5.04348C18 6.58026 16.7542 7.82609 15.2174 7.82609C14.8981 7.82609 14.5913 7.77226 14.3057 7.6733L13.0613 9.5027C13.445 9.99179 13.6532 10.5957 13.6522 11.2174C13.6522 12.7542 12.4063 14 10.8696 14C9.33278 14 8.08696 12.7542 8.08696 11.2174C8.08696 10.3681 8.46748 9.60765 9.0673 9.09722L7.26174 5.50765C7.07549 5.54605 6.88581 5.56534 6.69565 5.56522C6.45619 5.56539 6.2177 5.5347 5.98609 5.47391L4.70643 7.7287C5.23565 8.23522 5.56522 8.9487 5.56522 9.73913C5.56522 11.2759 4.31939 12.5217 2.78261 12.5217C1.24583 12.5217 0 11.2759 0 9.73913C0 8.20235 1.24583 6.95652 2.78261 6.95652C3.01348 6.95652 3.23774 6.98461 3.45217 7.03757L4.73991 4.76191C4.22939 4.25765 3.91304 3.55713 3.91304 2.78261C3.91304 1.24583 5.15887 0 6.69565 0C8.23243 0 9.47826 1.24583 9.47826 2.78261C9.47826 3.61417 9.11348 4.36052 8.5353 4.87043L10.3723 8.47913ZM15.2174 6.43478C15.9858 6.43478 16.6087 5.81191 16.6087 5.04348C16.6087 4.27504 15.9858 3.65217 15.2174 3.65217C14.449 3.65217 13.8261 4.27504 13.8261 5.04348C13.8261 5.81191 14.449 6.43478 15.2174 6.43478ZM2.78261 11.1304C3.55104 11.1304 4.17391 10.5076 4.17391 9.73913C4.17391 8.9707 3.55104 8.34783 2.78261 8.34783C2.01417 8.34783 1.3913 8.9707 1.3913 9.73913C1.3913 10.5076 2.01417 11.1304 2.78261 11.1304ZM6.69565 4.17391C7.46409 4.17391 8.08696 3.55104 8.08696 2.78261C8.08696 2.01417 7.46409 1.3913 6.69565 1.3913C5.92722 1.3913 5.30435 2.01417 5.30435 2.78261C5.30435 3.55104 5.92722 4.17391 6.69565 4.17391ZM10.8696 12.6087C11.638 12.6087 12.2609 11.9858 12.2609 11.2174C12.2609 10.449 11.638 9.82609 10.8696 9.82609C10.1011 9.82609 9.47826 10.449 9.47826 11.2174C9.47826 11.9858 10.1011 12.6087 10.8696 12.6087Z"
        fill="currentColor"
      />
    </svg>
  );
};

const NavigationMenu = ({
  isAdmin,
  isSuperAdmin,
  isSystemAdmin,
}: {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSystemAdmin: boolean;
}) => {
  const { lastUsedWorkspaceId } = useLastUsedWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = useMemo(
    () =>
      [
        {
          name: "Dashboard",
          href: "/workspaces",
          icon: LayoutDashboard,
          active: (pathname: string) => /^\/workspaces/.test(pathname),
          role: null,
        },
        // {
        //   name: "Spaces",
        //   href: lastUsedWorkspaceId
        //     ? `/workspaces/${lastUsedWorkspaceId}`
        //     : "/workspaces",
        //   icon: LayoutDashboard,
        //   active: (pathname: string) => /^\/workspaces/.test(pathname),
        //   role: null,
        // },
        {
          name: "Organisation Settings",
          href: "/settings/organisation",
          icon: Building2,
          active: (pathname: string) => /^\/workspaces/.test(pathname),
          role: "ADMIN",
        },
        {
          name: "Apps",
          href: "/settings/apps/",
          icon: ConnectionsIcon,
          active: (pathname: string) => /^\/settings\/apps/.test(pathname),
          role: "ADMIN",
        },
        {
          name: "Admin",
          href: "/admin/",
          icon: Shield,
          active: (pathname: string) => /^\/admin/.test(pathname),
          role: "SUPERADMIN",
        },
        // {
        //   name: "Feedback",
        //   href: "/feedback",
        //   icon: ChatBubbleBottomCenterIcon,
        //   active: (pathname: string) => /^\/feedback/.test(pathname),
        //   role: null,
        // },
      ].filter((item) => {
        if (!item.role) {
          return true;
        }

        if (item.role === "ADMIN") {
          return isAdmin;
        }

        if (item.role === "SYSTEMADMIN") {
          return isSystemAdmin;
        }

        return isSuperAdmin;
      }),
    [isAdmin, isSuperAdmin, isSystemAdmin],
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Hamburger
          isOpen={isOpen}
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={18} align="start" className="w-64 p-2">
        <DropdownMenuGroup>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem className="p-0 rounded-lg" key={item.name}>
                <Link
                  href={item.href}
                  className="py-4 px-4 flex gap-5 text-sm w-full items-center"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type ApplicationShellProps = {
  user: {
    id: string;
    email: string;
    avatar: string | null;
    tenants: Tenant[];
    userTenantRoles: UserTenantRole[];
  };
  statsigKey?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSystemAdmin: boolean;
  children: React.ReactNode;
};

const manrope = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const ApplicationShell = ({
  user,
  isAdmin,
  isSuperAdmin,
  isSystemAdmin,
  statsigKey,
  children,
}: ApplicationShellProps) => {
  const queryClient = getQueryClient();
  const { theme } = useTheme();

  const content = (
    <html
      lang="en"
      className={cn(
        manrope.className,
        "h-full dark:bg-charcoal-900 dark:text-gray-200 scroll-smooth",
        {
          dark: theme === "dark",
        },
      )}
    >
      <body className="h-full dark:bg-charcoal-900">
        <QueryClientProvider client={queryClient}>
          <ProgressProvider>
            <div className="h-full flex flex-col">
              <header className="flex justify-between w-full px-6 min-h-20 items-center">
                <div className="flex items-center gap-5 w-1/3 -translate-x-1 shrink-0">
                  <NavigationMenu
                    isAdmin={isAdmin}
                    isSuperAdmin={isSuperAdmin}
                    isSystemAdmin={isSystemAdmin}
                  />
                  <span className="dark:text-white opacity-75 text-sm font-semibold">
                    {user.tenants[0]?.name}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/workspaces">
                    <Logo className="text-midnight-900 dark:text-white w-14" />
                  </Link>
                </div>
                <div className="w-1/3 flex items-center gap-5 justify-end shrink-0">
                  <Link
                    className="dark:text-white opacity-50 hover:opacity-100 text-sm font-semibold"
                    href="/feedback"
                  >
                    Feedback
                  </Link>
                  <ProfileLinkAvatar user={user} />
                </div>
              </header>
              <div className="grow h-full">{children}</div>
            </div>
          </ProgressProvider>
          <Toaster position="bottom-right" richColors />
        </QueryClientProvider>
      </body>
    </html>
  );

  const client = useMemo(() => {
    if (statsigKey) {
      const client = new StatsigClient(statsigKey, {
        userID: user.id,
        email: user.email,
      });
      runStatsigSessionReplay(client);
      runStatsigAutoCapture(client);
      client.initializeSync();
      return client;
    }
  }, [statsigKey, user.email, user.id]);

  if (client) {
    return (
      <StatsigProvider client={client} loadingComponent={null}>
        {content}
      </StatsigProvider>
    );
  }

  return content;
};
