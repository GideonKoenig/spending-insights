import { Badge } from "@/components/ui/badge";
import { cn, generateCategoryColor } from "@/lib/utils";
import { Transaction } from "@/lib/types";
import { getTaggedTransactions } from "@/lib/transaction-tags/utils";
import { MAIN_CATEGORIES } from "@/lib/transaction-tags/types";
import { Fragment } from "react";

export function TagStatistics(props: {
    transactions: Transaction[];
    className?: string;
}) {
    const taggedTransactions = getTaggedTransactions(props.transactions);
    const untaggedCount = props.transactions.length - taggedTransactions.length;
    const categoryCounts = MAIN_CATEGORIES.map((category) => {
        const count = taggedTransactions.filter(
            (transaction) => transaction.tag?.category === category
        ).length;
        return { category, count };
    });
    const sortedCategories = categoryCounts.sort((a, b) => b.count - a.count);

    return (
        <div
            className={cn(
                "flx bg-card rounded-md border border-border shadow-sm p-6",
                props.className
            )}
        >
            <div className=" grid grid-cols-2 gap-x-4 gap-y-2  ">
                <h3 className="font-semibold text-lg mb-2 col-span-2">
                    Transaction Statistics
                </h3>

                <p>Total transactions:</p>
                <p className="font-medium">{props.transactions.length}</p>

                <p>Untagged transactions:</p>
                <p className="font-medium">{untaggedCount}</p>

                <p>Tagged transactions:</p>
                <p className="font-medium">{taggedTransactions.length}</p>

                <div className="col-span-2 border-t border-border mt-2" />

                {sortedCategories.map(({ category, count }) => (
                    <Fragment key={category}>
                        <div className="flex items-center gap-2">
                            <Badge
                                style={{
                                    backgroundColor:
                                        generateCategoryColor(category),
                                }}
                                className="text-xs font-medium text-foreground"
                            >
                                {category}
                            </Badge>
                        </div>
                        <p className="font-medium">{count}</p>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
