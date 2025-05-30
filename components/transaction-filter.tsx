import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterX } from "lucide-react";
import { FilterPanel } from "@/components/filter-panel";
import type { Transaction } from "@/lib/types";
import type { FilterCondition } from "@/lib/filtering/types";
import type { DateRangeFilter } from "@/lib/filtering/types";

interface TransactionFilterProps {
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    dateRange: DateRangeFilter;
    setDateRange: (range: DateRangeFilter) => void;
    filterConditions: FilterCondition<Transaction>[];
    addFilterCondition: (condition: FilterCondition<Transaction>) => void;
    removeFilterCondition: (id: string) => void;
    clearFilters: () => void;
    totalCount: number;
    filteredCount: number;
}

export function TransactionFilter(props: TransactionFilterProps) {
    const {
        showFilters,
        setShowFilters,
        dateRange,
        setDateRange,
        filterConditions,
        addFilterCondition,
        removeFilterCondition,
        clearFilters,
        totalCount,
        filteredCount,
    } = props;

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">
                        Showing {filteredCount} of {totalCount} transactions
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    {filterConditions.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                        >
                            <FilterX className="mr-2 h-4 w-4" />
                            Clear Filters ({filterConditions.length})
                        </Button>
                    )}
                    <Button
                        variant={showFilters ? "default" : "outline"}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? "Hide" : "Show"} Filters
                    </Button>
                </div>
            </div>

            {showFilters && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterPanel
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            filterConditions={filterConditions}
                            addFilterCondition={addFilterCondition}
                            removeFilterCondition={removeFilterCondition}
                        />
                    </CardContent>
                </Card>
            )}
        </>
    );
}
