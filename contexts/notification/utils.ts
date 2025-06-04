import type {
    WarningNotification,
    ErrorNotification,
    DebugNotification,
} from "@/contexts/notification/types";

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
