export type GraphDatapoint = {
    date: string;
    balance: number;
    fullDate: Date;
};

export type Month = {
    id: number;
    name: string;
    short: string;
};

export const MONTHS: Month[] = [
    { id: 0, name: "January", short: "Jan" },
    { id: 1, name: "February", short: "Feb" },
    { id: 2, name: "March", short: "Mar" },
    { id: 3, name: "April", short: "Apr" },
    { id: 4, name: "May", short: "May" },
    { id: 5, name: "June", short: "Jun" },
    { id: 6, name: "July", short: "Jul" },
    { id: 7, name: "August", short: "Aug" },
    { id: 8, name: "September", short: "Sep" },
    { id: 9, name: "October", short: "Oct" },
    { id: 10, name: "November", short: "Nov" },
    { id: 11, name: "December", short: "Dec" },
];
