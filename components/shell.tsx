"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  BookOpen,
  ChartNoAxesCombined,
  Landmark,
  LogOut,
  Menu,
  Settings2,
  Users,
  Workflow,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navigation = [
  { href: "/", label: "Overview", icon: ChartNoAxesCombined },
  { href: "/transactions", label: "Transactions", icon: ArrowDownToLine },
  { href: "/bookings", label: "Bookings", icon: BookOpen },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/people", label: "People", icon: Users },
  { href: "/rules", label: "Rules", icon: Workflow },
  { href: "/settings", label: "Agent access", icon: Settings2 },
];

export function Shell({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: true },
          mutations: { retry: false },
        },
      }),
  );
  const path = usePathname();
  const router = useRouter();
  async function signOut() {
    await authClient.signOut();
    client.clear();
    router.replace("/login");
    router.refresh();
  }
  return (
    <QueryClientProvider client={client}>
      <div className="flex h-dvh flex-col overflow-hidden lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="flex shrink-0 flex-col border-b border-border bg-sidebar lg:h-dvh lg:border-r lg:border-b-0">
          <div className="flex h-20 shrink-0 items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-3 font-semibold tracking-tight"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <ChartNoAxesCombined className="size-5" />
              </span>
              <span>
                Spending
                <br />
                <span className="font-normal text-muted-foreground">
                  Insights
                </span>
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {navigation.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      aria-current={path === item.href ? "page" : undefined}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ScrollArea className="hidden min-h-0 flex-1 lg:block">
            <nav aria-label="Main navigation" className="px-3 pt-6 pb-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={path === item.href ? "page" : undefined}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    path === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-[18px]" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="hidden shrink-0 border-t border-border p-5 lg:block">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm">{name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Personal · EUR
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={() => void signOut()}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </aside>
        <ScrollArea key={path} className="min-h-0 min-w-0 flex-1 lg:h-dvh">
          <main
            tabIndex={-1}
            className="min-w-0 px-4 py-7 sm:px-8 lg:px-10 lg:py-9"
          >
            <div className="mx-auto max-w-[1400px]">{children}</div>
          </main>
        </ScrollArea>
      </div>
    </QueryClientProvider>
  );
}
