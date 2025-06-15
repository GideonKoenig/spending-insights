import { Transaction } from "@/lib/types";
import { z } from "zod";

export type HeaderMapping = Record<
    keyof Omit<Transaction, "tag" | "id">,
    string
>;
export type DataInjestFormat<T extends z.ZodObject<z.ZodRawShape>> = {
    name: string;
    displayName: string;
    schema: T;
    map: (elements: z.infer<T>[]) => Omit<Transaction, "hash">[];
    getBankName: (elements: z.infer<T>[]) => string;
    note?: string;
};

export type PreparedFile = {
    file: File;
    name: string;
    fileName: string;
    format: DataInjestFormat<z.ZodObject<z.ZodRawShape>> | null;
    error: string | null;
    headers: string[];
    action: "add" | "merge" | "notify-developer" | "do-nothing";
    mergeAccount?: string;
    bankName?: string;
};
