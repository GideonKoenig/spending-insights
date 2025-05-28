export type TryCatchResult<T> =
    | { success: true; data: T }
    | { success: false; error: Error };

export type Error = {
    message: string;
};

export async function tryCatch<T>(
    fn: () => Promise<T> | T
): Promise<TryCatchResult<T>> {
    try {
        const data = await fn();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error as Error };
    }
}

export function tryCatchSync<T>(fn: () => T): TryCatchResult<T> {
    try {
        return { success: true, data: fn() };
    } catch (error) {
        return {
            success: false,
            error: {
                message:
                    error instanceof globalThis.Error
                        ? error.message
                        : String(error),
            },
        };
    }
}
