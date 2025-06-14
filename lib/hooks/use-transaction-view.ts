import { useLocalStorage } from "@/lib/hooks/use-local-storage";

export type TransactionViewType = "standard" | "slim";

const TRANSACTION_VIEW_KEY = "bank-history-transaction-view";

export function useTransactionView() {
    const storage = useLocalStorage<TransactionViewType>(
        TRANSACTION_VIEW_KEY,
        "standard"
    );

    return {
        viewType: storage.value,
        setViewType: storage.updateValue,
        isLoading: storage.isLoading,
        toggleView: () => {
            storage.updateValue(
                storage.value === "standard" ? "slim" : "standard"
            );
        },
    };
}
