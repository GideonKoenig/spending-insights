"use client";

import { realRoles } from "@/lib/ledger/contracts";
import { useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useCommand } from "@/lib/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { euro, today, cn } from "@/lib/utils";
import {
  DatePicker,
  SelectItem,
  Button,
  Empty,
  ErrorMessage,
  Loading,
  PageHeader,
  Select,
} from "./ui/controls";

const chartNames = {
  spending: "Spending",
  wealth: "Net worth",
  cash: "Cash flow",
} as const;

export function Dashboard() {
  const [from, setFrom] = useState(`${today().slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today());
  const [granularity, setGranularity] = useState<"month" | "quarter" | "year">(
    "month",
  );
  const [chart, setChart] = useState<"spending" | "wealth" | "cash">(
    "spending",
  );
  const [compare, setCompare] = useState(false);
  const [compareFrom, setCompareFrom] = useState(
    `${Number(today().slice(0, 4)) - 1}-01-01`,
  );
  const [compareTo, setCompareTo] = useState(
    `${Number(today().slice(0, 4)) - 1}-12-31`,
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [categoryKind, setCategoryKind] = useState<"expense" | "income">(
    "expense",
  );
  const validRange = Boolean(from && to && from <= to);
  const validComparison = Boolean(
    compareFrom && compareTo && compareFrom <= compareTo,
  );
  const overview = useCommand("overview", {});
  const report = useCommand("reports", { from, to, granularity }, validRange);
  const comparison = useCommand(
    "reports",
    { from: compareFrom, to: compareTo, granularity },
    compare && validComparison,
  );
  const data = report.data;
  const previous =
    compare &&
    validComparison &&
    comparison.fetchStatus === "idle" &&
    !comparison.isPlaceholderData
      ? comparison.data?.totals
      : undefined;
  const categories =
    data?.categories.filter((category) => category.kind === categoryKind) ?? [];
  const largestCategory = Math.max(
    ...categories.map((category) => Math.abs(category.amount)),
    1,
  );
  const accounts =
    overview.data?.accounts.filter((account) => realRoles[account.role]) ?? [];
  return (
    <>
      <PageHeader title="Overview">
        <Button
          variant={compare ? "primary" : "secondary"}
          aria-pressed={compare}
          onClick={() => setCompare(!compare)}
        >
          Compare periods
        </Button>
      </PageHeader>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DatePicker
          className="w-auto"
          aria-label="From date"
          required

          value={from}
          onValueChange={(value) => setFrom(value)}
        />
        <span className="text-muted-foreground">to</span>
        <DatePicker
          className="w-auto"
          aria-label="To date"
          required

          value={to}
          onValueChange={(value) => setTo(value)}
        />
        <Select
          aria-label="Aggregation"
          className="w-auto"
          value={granularity}
          onValueChange={(value) => setGranularity(value as typeof granularity)}
        >
          <SelectItem value="month">Monthly</SelectItem>
          <SelectItem value="quarter">Quarterly</SelectItem>
          <SelectItem value="year">Yearly</SelectItem>
        </Select>
        <Button
          variant="ghost"
          onClick={() => {
            setFrom(
              overview.data?.firstBooking ?? `${today().slice(0, 4)}-01-01`,
            );
            setTo(today());
          }}
        >
          All time
        </Button>
      </div>
      {compare && (
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Compare with</span>
          <DatePicker
            aria-label="Comparison from"
            required
            className="w-auto"

            value={compareFrom}
            onValueChange={(value) => setCompareFrom(value)}
          />
          <span>to</span>
          <DatePicker
            aria-label="Comparison to"
            required
            className="w-auto"

            value={compareTo}
            onValueChange={(value) => setCompareTo(value)}
          />
          <span
            role="status"
            className={cn("text-xs", !validComparison && "text-danger")}
          >
            {!validComparison
              ? "Start date must be on or before end date."
              : comparison.isPaused
                ? "Waiting for connection…"
                : comparison.isFetching
                  ? "Updating comparison…"
                  : ""}
          </span>
        </div>
      )}
      <ErrorMessage
        error={
          report.error ?? overview.error ?? (compare ? comparison.error : null)
        }
      />
      {!validRange ? (
        <Empty>Choose a start date on or before the end date.</Empty>
      ) : report.error || overview.error ? null : !data || !overview.data ? (
        <Loading variant="dashboard" />
      ) : (
        <>
          {overview.data.pending > 0 && (
            <Link
              href="/transactions"
              className="mb-6 flex items-center justify-between rounded-lg border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-accent"
            >
              <span>
                {overview.data.pending} unbooked transaction
                {overview.data.pending !== 1 && "s"} excluded from these reports
              </span>
              <ArrowRight className="size-4" />
            </Link>
          )}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Net worth"
              value={data.totals.netWorth}
              note={
                report.isPaused
                  ? "Waiting for connection…"
                  : report.isFetching
                    ? "Updating…"
                    : `As of ${data.to}`
              }
            />
            <Metric
              label="Income"
              value={data.totals.income}
              previous={previous?.income}
              color="text-primary"
            />
            <Metric
              label="Spending"
              value={data.totals.expense}
              previous={previous?.expense}
              color="text-accent"
            />
            <Metric
              label="Income less spending"
              value={data.totals.income - data.totals.expense}
            />
          </div>
          <Tabs
            value={chart}
            onValueChange={(value) => setChart(value as typeof chart)}
            className="panel mb-6 gap-0 p-5 sm:p-6"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-medium">
                {chart === "wealth"
                  ? "Net worth over time"
                  : chart === "cash"
                    ? "Bank cash flow"
                    : "Income & spending"}
              </h2>

              <TabsList>
                {Object.entries(chartNames).map(([value, label]) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value={chart}>
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  {chart === "wealth" ? (
                    <AreaChart
                      data={data.periods}
                      margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fill: "var(--color-muted-foreground)",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => `${Number(value) / 100}`}
                        tick={{
                          fill: "var(--color-muted-foreground)",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          borderRadius: 10,
                        }}
                        formatter={(value) => euro(Number(value))}
                      />
                      <Area
                        isAnimationActive={false}
                        name="Net worth"
                        type="stepAfter"
                        dataKey="netWorth"
                        stroke="var(--color-primary)"
                        fill="var(--color-primary)"
                        fillOpacity={0.09}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={data.periods}
                      margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fill: "var(--color-muted-foreground)",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => `${Number(value) / 100}`}
                        tick={{
                          fill: "var(--color-muted-foreground)",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--color-muted)" }}
                        contentStyle={{
                          background: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          borderRadius: 10,
                        }}
                        formatter={(value) => euro(Number(value))}
                      />
                      <Bar
                        isAnimationActive={false}
                        name={chart === "cash" ? "Cash in" : "Income"}
                        dataKey={chart === "cash" ? "cashIn" : "income"}
                        fill="var(--color-primary)"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                      />
                      <Bar
                        isAnimationActive={false}
                        name={chart === "cash" ? "Cash out" : "Spending"}
                        dataKey={chart === "cash" ? "cashOut" : "expense"}
                        fill="var(--color-accent)"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
                {chart !== "wealth" && (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      {chart === "cash" ? "Cash in" : "Income"}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-accent" />
                      {chart === "cash" ? "Cash out" : "Spending"}
                    </span>
                  </>
                )}
                {chart === "wealth" && (
                  <span>
                    Investment balances reflect contributions and withdrawals.
                  </span>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <div className="panel p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-medium">Categories</h2>
                <Select
                  className="w-auto"
                  aria-label="Category type"
                  value={categoryKind}
                  onValueChange={(value) =>
                    setCategoryKind(value as typeof categoryKind)
                  }
                >
                  <SelectItem value="expense">Spending</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </Select>
              </div>
              {!categories.length ? (
                <Empty>
                  No booked {categoryKind === "expense" ? "spending" : "income"}{" "}
                  in this period.
                </Empty>
              ) : (
                <div className="space-y-5">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-expanded={expanded === category.id}
                        className="mb-2 flex w-full items-center justify-between gap-4 text-left text-sm"
                        onClick={() =>
                          setExpanded(
                            expanded === category.id ? null : category.id,
                          )
                        }
                      >
                        <span className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "size-3 text-muted-foreground transition-transform",
                              expanded === category.id && "rotate-180",
                            )}
                          />
                          {category.name}
                        </span>
                        <span className="number">{euro(category.amount)}</span>
                      </Button>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent/75"
                          style={{
                            width: `${(Math.abs(category.amount) / largestCategory) * 100}%`,
                          }}
                        />
                      </div>
                      {expanded === category.id && (
                        <div className="mt-3 space-y-2 pl-5">
                          {category.children.map((child) => (
                            <div
                              key={child.id}
                              className="flex justify-between text-xs text-muted-foreground"
                            >
                              <span>
                                {child.id === category.id
                                  ? "Direct bookings"
                                  : child.name}
                              </span>
                              <span className="number">
                                {euro(child.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="panel p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-medium">Accounts</h2>
                <Link href="/accounts" className="text-xs text-primary">
                  Manage <span aria-hidden>↗</span>
                </Link>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Current recorded balances
              </p>
              {!accounts.length ? (
                <Empty>
                  <Link href="/accounts" className="text-primary">
                    Add your first account
                  </Link>
                </Empty>
              ) : (
                <div className="divide-y divide-border">
                  {accounts.map((account) => (
                    <Link
                      href={`/bookings?account=${account.id}`}
                      key={account.id}
                      className="flex items-center justify-between gap-3 py-4"
                    >
                      <div>
                        <p className="text-sm">{account.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {account.bankName ??
                            (account.kind === "liability" ? "Debt" : "EUR")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "number text-sm",
                          account.kind === "liability"
                            ? "text-accent"
                            : "text-foreground",
                        )}
                      >
                        {euro(
                          account.kind === "liability"
                            ? -account.balance
                            : account.balance,
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Metric({
  label,
  value,
  note,
  previous,
  color,
}: {
  label: string;
  value: number;
  note?: string;
  previous?: number;
  color?: string;
}) {
  return (
    <div className="panel p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn("number mt-3 text-2xl font-medium tracking-tight", color)}
      >
        {euro(value)}
      </p>
      <p className="mt-2 min-h-4 text-[11px] text-muted-foreground">
        {previous !== undefined
          ? `${euro(previous)} in comparison period`
          : note}
      </p>
    </div>
  );
}
