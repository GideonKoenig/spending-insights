import { FilterOption } from "@/lib/transaction-filter/types";

export const FILTER_OPTIONS: FilterOption[] = [
    {
        attribute: "purpose",
        label: "Purpose",
        inputType: "text",
    },
    {
        attribute: "paymentParticipant",
        label: "Participant",
        inputType: "text",
    },
    {
        attribute: "bookingDate",
        label: "Date",
        inputType: "date",
    },
    {
        attribute: "amount",
        label: "Amount",
        inputType: "currency",
    },
    {
        attribute: "transactionType",
        label: "Transaction Type",
        inputType: "list",
    },
] as const;
