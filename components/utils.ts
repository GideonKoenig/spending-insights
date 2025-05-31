import { Transaction } from "@/lib/types";

export function getKey(transaction: Transaction) {
    return [
        transaction.bookingDate.getTime(),
        transaction.amount,
        transaction.purpose,
    ].join("-");
}
