import { Badge } from "@/components/ui/badge";
import { Tag } from "@/lib/tag-rule-engine/types";
import { generateCategoryColor } from "@/lib/tag-rule-engine/utils";

export function TagBadge(props: { tag: Tag; showSubCategory?: boolean }) {
    const backgroundColor = generateCategoryColor(props.tag.category);

    return (
        <Badge
            variant="secondary"
            style={{
                backgroundColor,
            }}
            className="text-xs font-medium text-foreground"
        >
            {props.tag.category}
            {props.showSubCategory && (
                <span>{`(${props.tag.subCategory})`}</span>
            )}
        </Badge>
    );
}
