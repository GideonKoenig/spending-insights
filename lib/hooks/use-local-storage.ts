import { useState, useEffect } from "react";
import { getLocal, storeLocal } from "@/lib/utils";
import { handleResult } from "@/contexts/notification/utils";
import { useNotifications } from "@/contexts/notification/provider";

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(defaultValue);
    const [isLoading, setIsLoading] = useState(true);
    const notificationContext = useNotifications();

    useEffect(() => {
        const result = getLocal<T>(key);
        const loadedValue = handleResult(
            result,
            `Loading ${key} from localStorage`,
            notificationContext,
            defaultValue,
            ["No value found for key"]
        );
        setValue(loadedValue);
        setIsLoading(false);
    }, [key]);

    const updateValue = (newValue: T) => {
        setValue(newValue);
        storeLocal(key, newValue);
    };

    return { value, updateValue, isLoading };
}
