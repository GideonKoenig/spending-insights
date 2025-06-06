import { Transaction } from "@/lib/types";
import { z } from "zod";

export type HeaderMapping = Record<
    keyof Omit<Transaction, "tag" | "id">,
    string
>;
export type DataInjestFormat<T extends z.ZodObject<any>> = {
    name: string;
    displayName: string;
    schema: T;
    map: (element: z.infer<T>) => Omit<Transaction, "hash">;
};
