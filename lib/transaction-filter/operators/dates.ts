import type { FilterOperator } from "@/lib/transaction-filter/types";

export const dateEquals: FilterOperator<Date> = {
    name: "date-equals",
    label: "=",
    type: "date",
    compare: (userValue, valueToCompare) =>
        valueToCompare.getTime() === userValue.getTime(),
};

export const dateAfter: FilterOperator<Date> = {
    name: "date-after",
    label: "after",
    type: "date",
    compare: (userValue, valueToCompare) =>
        valueToCompare.getTime() > userValue.getTime(),
};

export const dateBefore: FilterOperator<Date> = {
    name: "date-before",
    label: "before",
    type: "date",
    compare: (userValue, valueToCompare) =>
        valueToCompare.getTime() < userValue.getTime(),
};
