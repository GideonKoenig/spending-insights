import { differenceInDays, differenceInMonths, format } from "date-fns";

export function createLabelFormatter(aggregation: string) {
    return (value: any, payload: any) => {
        const formatStr =
            aggregation === "yearly"
                ? "yyyy"
                : aggregation === "monthly"
                ? "MMMM yyyy"
                : aggregation === "weekly"
                ? "'Week' w yyyy"
                : "dd MMM yyyy";
        return format(payload[0].payload.fullDate, formatStr);
    };
}

export function calculateYTicks(chartData: { balance: number }[]) {
    const maxBalance = Math.max(...chartData.map((d) => d.balance));
    const calculateStepSize = (maxValue: number) => {
        const stepOptions = [100, 500, 1000, 2000, 5000, 10000];
        const targetTicks = 10;

        const idealStepSize = maxValue / targetTicks;

        return stepOptions.reduce((prev, curr) =>
            Math.abs(curr - idealStepSize) < Math.abs(prev - idealStepSize)
                ? curr
                : prev
        );
    };

    const STEP_SIZE = calculateStepSize(maxBalance);
    const maxYTick = Math.ceil(maxBalance / STEP_SIZE) * STEP_SIZE + STEP_SIZE;

    const yTicks = Array.from(
        { length: maxYTick / STEP_SIZE },
        (_, i) => i * STEP_SIZE
    );

    return yTicks;
}

export function calculateRelativeYTicks(
    chartData: { relativeBalance: number }[]
) {
    const relativeBalances = chartData.map((d) => d.relativeBalance);
    const minRelative = Math.min(...relativeBalances);
    const maxRelative = Math.max(...relativeBalances);
    const maxAbsoluteChange = Math.max(
        Math.abs(minRelative),
        Math.abs(maxRelative)
    );

    const stepOptions = [100, 500, 1000, 2000, 5000, 10000];
    const targetTicks = 10;
    const idealStepSize = (maxAbsoluteChange * 2) / targetTicks;
    const stepSize = stepOptions.reduce((prev, curr) =>
        Math.abs(curr - idealStepSize) < Math.abs(prev - idealStepSize)
            ? curr
            : prev
    );

    const maxTick = Math.ceil(maxAbsoluteChange / stepSize) * stepSize;
    const minTick = -maxTick;

    const ticks = [];
    for (let i = minTick; i <= maxTick; i += stepSize) {
        ticks.push(i);
    }
    return ticks;
}

export function calculateIncomeExpenseYTicks(
    chartData: { income: number; expense: number }[]
) {
    const stepOptions = [100, 500, 1000, 2000, 5000, 10000];
    const targetTicks = 10;

    const maxIncome = Math.max(...chartData.map((d) => d.income));
    const maxExpense = Math.max(...chartData.map((d) => Math.abs(d.expense)));
    const maxValue = Math.max(maxIncome, maxExpense);

    const idealStepSize = (maxValue * 2) / targetTicks;

    const STEP_SIZE = stepOptions.reduce((prev, curr) =>
        Math.abs(curr - idealStepSize) < Math.abs(prev - idealStepSize)
            ? curr
            : prev
    );

    const maxTick = Math.ceil(maxValue / STEP_SIZE) * STEP_SIZE;
    const minTick = -maxTick;

    const ticks = [];
    for (let i = minTick; i <= maxTick; i += STEP_SIZE) {
        ticks.push(i);
    }
    return ticks;
}

export function calculateXTicks(chartData: { fullDate: Date }[]) {
    const targetTicks = 10;

    const startDate = chartData[0].fullDate;
    const endDate = chartData[chartData.length - 1].fullDate;

    const monthsDiff = differenceInMonths(endDate, startDate);
    const ticks = [];

    if (monthsDiff <= 3) {
        const dayIntervalOptions = [1, 2, 7, 14];
        const daysDiff = differenceInDays(endDate, startDate);

        const idealDayInterval = daysDiff / targetTicks;
        const selectedDayInterval = dayIntervalOptions.reduce((prev, curr) =>
            Math.abs(curr - idealDayInterval) <
            Math.abs(prev - idealDayInterval)
                ? curr
                : prev
        );

        const tickDate = new Date(startDate);
        while (tickDate <= endDate) {
            ticks.push({
                timestamp: tickDate.getTime(),
                label: format(tickDate, "dd.MM"),
            });
            tickDate.setDate(tickDate.getDate() + selectedDayInterval);
        }
    } else {
        const monthIntervalOptions = [1, 2, 4, 6, 12, 24];
        const idealMonthInterval = monthsDiff / targetTicks;
        const selectedMonthInterval = monthIntervalOptions.reduce(
            (prev, curr) =>
                Math.abs(curr - idealMonthInterval) <
                Math.abs(prev - idealMonthInterval)
                    ? curr
                    : prev
        );

        const tickDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            1
        );
        while (tickDate <= endDate) {
            ticks.push({
                timestamp: tickDate.getTime(),
                label: format(tickDate, "MMM yy"),
            });
            tickDate.setMonth(tickDate.getMonth() + selectedMonthInterval);
        }
    }

    return ticks;
}
