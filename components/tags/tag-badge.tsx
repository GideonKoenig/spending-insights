import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tag } from "@/lib/tag-rule-engine/types";
import { generateCategoryColor } from "@/lib/tag-rule-engine/utils";

export function TagBadge(props: { tag: Tag }) {
    const backgroundColor = generateCategoryColor(props.tag.category);

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
                        {props.tag.category}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-semibold mb-1">{props.tag.category}</p>

                    <div className="bg-card/30 p-2 pb-2 mb-1 rounded-md text-xs flex flex-col gap-1">
                        {props.tag.subCategory && (
                            <p>Subcategory: {props.tag.subCategory}</p>
                        )}
                        <p>Rule: {props.tag.ruleName}</p>
                        <p>ID: {props.tag.ruleId}</p>
                        {props.tag.spreadOverMonths && (
                            <p>
                                Spread over {props.tag.spreadOverMonths} month
                                {props.tag.spreadOverMonths !== 1 ? "s" : ""}
                            </p>
                        )}
                        {props.tag.ignore && <p>Ignored</p>}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
