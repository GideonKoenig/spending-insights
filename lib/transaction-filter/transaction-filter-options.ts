import { TransactionFilter } from "@/lib/transaction-filter/types";

export const TRANSACTION_FILTER: TransactionFilter[] = [
    {
        attribute: "purpose",
        label: "Purpose",
        inputType: "text",
    },
    {
        attribute: "participantName",
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
    {
        attribute: "category",
        label: "Category",
        inputType: "list",
    },
] as const;
