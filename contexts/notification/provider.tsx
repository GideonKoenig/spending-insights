"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type {
    WarningNotification,
    ErrorNotification,
    DebugNotification,
} from "@/contexts/notification/types";
import {
    createWarning,
    createError,
    createDebug,
} from "@/contexts/notification/utils";

export interface NotificationContextType {
    warnings: WarningNotification[];
    errors: ErrorNotification[];
    debugs: DebugNotification[];

    addWarning: (origin: string, message: string | string[]) => void;
    addError: (origin: string, message: string | string[]) => void;
    addDebug: (origin: string, message: string | string[]) => void;

    clearWarnings: () => void;
    clearErrors: () => void;
    clearDebugs: () => void;

    markWarningsAsRead: (id?: number) => void;
    markErrorsAsRead: (id?: number) => void;
    markDebugsAsRead: (id?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
}

export function NotificationProvider(props: { children: ReactNode }) {
    const [warnings, setWarnings] = useState<WarningNotification[]>([]);
    const [errors, setErrors] = useState<ErrorNotification[]>([]);
    const [debugs, setDebugs] = useState<DebugNotification[]>([]);

    function addWarning(origin: string, message: string | string[]) {
        if (Array.isArray(message)) {
            message.forEach((m) => {
                const warning = createWarning(origin, m);
                setWarnings((prev) => [...prev, warning]);
            });
        } else {
            const warning = createWarning(origin, message);
            setWarnings((prev) => [...prev, warning]);
        }
    }

    function addError(origin: string, message: string | string[]) {
        console.log("addError", origin, message);
        if (Array.isArray(message)) {
            message.forEach((m) => {
                const error = createError(origin, m);
                setErrors((prev) => [...prev, error]);
            });
        } else {
            const error = createError(origin, message);
            setErrors((prev) => [...prev, error]);
        }
    }

    function addDebug(origin: string, message: string | string[]) {
        if (Array.isArray(message)) {
            message.forEach((m) => {
                const debug = createDebug(origin, m);
                setDebugs((prev) => [...prev, debug]);
            });
        } else {
            const debug = createDebug(origin, message);
            setDebugs((prev) => [...prev, debug]);
        }
    }

    function clearWarnings() {
        setWarnings([]);
    }

    function clearErrors() {
        setErrors([]);
    }

    function clearDebugs() {
        setDebugs([]);
    }

    function markWarningsAsRead(id?: number) {
        if (id) {
            setWarnings((prev) =>
                prev.map((warning) =>
                    warning.id === id ? { ...warning, seen: true } : warning
                )
            );
        } else {
            setWarnings((prev) =>
                prev.map((warning) => ({ ...warning, seen: true }))
            );
        }
    }

    function markErrorsAsRead(id?: number) {
        if (id) {
            setErrors((prev) =>
                prev.map((error) =>
                    error.id === id ? { ...error, seen: true } : error
                )
            );
        } else {
            setErrors((prev) =>
                prev.map((error) => ({ ...error, seen: true }))
            );
        }
    }

    function markDebugsAsRead(id?: number) {
        if (id) {
            setDebugs((prev) =>
                prev.map((debug) =>
                    debug.id === id ? { ...debug, seen: true } : debug
                )
            );
        } else {
            setDebugs((prev) =>
                prev.map((debug) => ({ ...debug, seen: true }))
            );
        }
    }

    const value: NotificationContextType = {
        warnings,
        errors,
        debugs,
        addWarning,
        addError,
        addDebug,
        clearWarnings,
        clearErrors,
        clearDebugs,
        markWarningsAsRead,
        markErrorsAsRead,
        markDebugsAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {props.children}
        </NotificationContext.Provider>
    );
}
