"use client";

import { createContext, useContext, ReactNode } from "react";
import { GraphSettings } from "@/contexts/graph/types";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

interface GraphContextType {
    settings: GraphSettings;
    setSettings: (settings: GraphSettings) => void;
    isLoading: boolean;
}

const GraphContext = createContext<GraphContextType | null>(null);

export function useGraph() {
    const context = useContext(GraphContext);
    if (!context) {
        throw new Error("useGraph must be used within a GraphProvider");
    }
    return context;
}

export function GraphProvider(props: {
    storageKey: string;
    defaultSettings: GraphSettings;
    children?: ReactNode;
}) {
    const settingsStore = useLocalStorage(
        props.storageKey,
        props.defaultSettings
    );

    return (
        <GraphContext.Provider
            value={{
                settings: settingsStore.value,
                setSettings: settingsStore.updateValue,
                isLoading: settingsStore.isLoading,
            }}
        >
            {props.children}
        </GraphContext.Provider>
    );
}
