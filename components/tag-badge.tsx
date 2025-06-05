import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tag } from "@/lib/transaction-tags/types";
import { generateCategoryColor } from "@/lib/transaction-tags/utils";

export function TagBadge({ tag }: { tag: Tag }) {
    const backgroundColor = generateCategoryColor(tag.category);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="secondary"
                        style={{
                            backgroundColor,
                        }}
                        className="text-xs font-medium cursor-pointer text-foreground"
                    >
                        {tag.category}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <div className="font-semibold">{tag.category}</div>
                        <div className="text-sm opacity-80">
                            {tag.subCategory}
                        </div>
                        {tag.spreadOverMonths && (
                            <div className="text-xs opacity-70 border-t pt-1 mt-2">
                                Spread over {tag.spreadOverMonths} month
                                {tag.spreadOverMonths !== 1 ? "s" : ""}
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
