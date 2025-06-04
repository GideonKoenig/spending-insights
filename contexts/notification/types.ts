export type NotificationType = "warning" | "error" | "debug";

export interface BaseNotification {
    id: number;
    type: NotificationType;
    message: string;
    origin: string;
    seen: boolean;
}

export interface WarningNotification extends BaseNotification {
    type: "warning";
}

export interface ErrorNotification extends BaseNotification {
    type: "error";
}

export interface DebugNotification extends BaseNotification {
    type: "debug";
}

export type Notification =
    | WarningNotification
    | ErrorNotification
    | DebugNotification;
