import { NotificationContextType } from "@/contexts/notification/provider";
import type {
    WarningNotification,
    ErrorNotification,
    DebugNotification,
} from "@/contexts/notification/types";
import { CustomSuccess, Result, tryCatch, tryCatchAsync } from "@/lib/utils";

let globalIndex = 0;

function getNextIndex(): number {
    return ++globalIndex;
}

export function createWarning(
    origin: string,
    message: string
): WarningNotification {
    return {
        type: "warning" as const,
        message,
        origin,
        seen: false,
        id: getNextIndex(),
    };
}

export function createError(
    origin: string,
    message: string
): ErrorNotification {
    return {
        type: "error" as const,
        message,
        origin,
        seen: false,
        id: getNextIndex(),
    };
}

export function createDebug(
    origin: string,
    message: string
): DebugNotification {
    return {
        type: "debug" as const,
        message,
        origin,
        seen: false,
        id: getNextIndex(),
    };
}

function formatParameter(param: unknown) {
    if (Array.isArray(param)) {
        if (param.length === 0) return "Array(0)";
        const firstType = typeof param[0];
        const allSameType = param.every((item) => typeof item === firstType);
        if (allSameType) {
            return `Array<${firstType}>(${param.length})`;
        } else {
            return `Array<mixed>(${param.length})`;
        }
    }
    if (typeof param === "function") {
        return `function ${param.name || "anonymous"}()`;
    }
    if (param === null) return "null";
    if (param === undefined) return "undefined";
    if (typeof param === "string") return `"${param}"`;
    if (typeof param === "object") return `{${Object.keys(param).length} keys}`;
    return String(param);
}

function formatDebugMessage(
    functionName: string,
    params: unknown[],
    result: string,
    duration: string
) {
    const paramLines =
        params.length > 0
            ? params
                  .map(
                      (param, index) =>
                          `    param${index + 1}: ${formatParameter(param)}`
                  )
                  .join("\n")
            : "    (no parameters)";

    return `functionName: ${functionName}\nparameters:\n${paramLines}\nresult: ${result}\nduration: ${duration}ms`;
}

/**
 * Profile function wrapper that times execution and logs debug information.
 *
 * Uses queueMicrotask() to defer debug logging because:
 * - React components must be "pure" during the render phase
 * - Calling addDebug() during render triggers a state update in NotificationProvider
 * - This causes React error: "Cannot update a component while rendering a different component"
 * - queueMicrotask() defers the state update until after the render cycle completes
 */
export function profileFunction<T extends (...args: unknown[]) => unknown>(
    fn: T,
    addDebug: (origin: string, message: string) => void,
    functionName?: string
): T {
    return ((...args: Parameters<T>) => {
        const name = functionName || fn.name || "anonymous";
        const startTime = performance.now();

        const result = tryCatch(() => fn(...args));

        if (!result.success) {
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            const message = formatDebugMessage(
                name,
                args,
                `thrown error: ${result.error}`,
                duration
            );
            queueMicrotask(() => addDebug("profiler", message));
            throw new Error(result.error);
        }

        if (result.value instanceof Promise) {
            return tryCatchAsync(async () => {
                const value = await result.value;
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(2);
                const message = formatDebugMessage(
                    name,
                    args,
                    "resolved",
                    duration
                );
                queueMicrotask(() => addDebug("profiler", message));
                return value;
            }).then((asyncResult) => {
                if (!asyncResult.success) {
                    const endTime = performance.now();
                    const duration = (endTime - startTime).toFixed(2);
                    const message = formatDebugMessage(
                        name,
                        args,
                        `rejected: ${asyncResult.error}`,
                        duration
                    );
                    queueMicrotask(() => addDebug("profiler", message));
                    throw new Error(asyncResult.error);
                }
                return asyncResult.value;
            });
        } else {
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            const message = formatDebugMessage(
                name,
                args,
                "completed",
                duration
            );
            queueMicrotask(() => addDebug("profiler", message));
            return result.value;
        }
    }) as T;
}

export function handleResult<T>(
    result: Result<T> | CustomSuccess<T>,
    origin: string,
    notificationContext: NotificationContextType,
    defaultValue: T,
    ignoredErrors?: string[]
) {
    if (!result.success) {
        const isIgnored = ignoredErrors
            ? ignoredErrors.some((error) =>
                  result.error.toLowerCase().includes(error.toLowerCase())
              )
            : false;
        if (!isIgnored) {
            queueMicrotask(() =>
                notificationContext.addError(origin, result.error)
            );
        }
        return defaultValue;
    }
    if (result.success && result.warnings) {
        queueMicrotask(() =>
            notificationContext.addWarning(origin, result.warnings!)
        );
    }
    return result.value;
}
