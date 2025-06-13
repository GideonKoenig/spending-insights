export type PlausibleEvents = {
    "get-started": never;
    "learn-more": never;
    "notify-developer": never;
    "import-accounts": { count?: number };
    "export-accounts": { count?: number };
    "import-tag-rules": { count?: number };
    "export-tag-rules": { count?: number };
    "create-tag-rule": never;
    "update-tag-rule": never;
    "add-account": never;
    "merge-account": never;
    "do-nothing": never;
};
