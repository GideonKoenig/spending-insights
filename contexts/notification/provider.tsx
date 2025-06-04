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

interface NotificationContextType {
    warnings: WarningNotification[];
    errors: ErrorNotification[];
    debugs: DebugNotification[];

    addWarning: (origin: string, message: string) => void;
    addError: (origin: string, message: string) => void;
    addDebug: (origin: string, message: string) => void;

    clearWarnings: () => void;
    clearErrors: () => void;
    clearDebugs: () => void;

    markWarningsAsRead: () => void;
    markErrorsAsRead: () => void;
    markDebugsAsRead: () => void;
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

    function addWarning(origin: string, message: string) {
        const warning = createWarning(origin, message);
        setWarnings((prev) => [...prev, warning]);
    }

    function addError(origin: string, message: string) {
        const error = createError(origin, message);
        setErrors((prev) => [...prev, error]);
    }

    function addDebug(origin: string, message: string) {
        const debug = createDebug(origin, message);
        setDebugs((prev) => [...prev, debug]);
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

    function markWarningsAsRead() {
        setWarnings((prev) =>
            prev.map((warning) => ({ ...warning, seen: true }))
        );
    }

    function markErrorsAsRead() {
        setErrors((prev) => prev.map((error) => ({ ...error, seen: true })));
    }

    function markDebugsAsRead() {
        setDebugs((prev) => prev.map((debug) => ({ ...debug, seen: true })));
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
