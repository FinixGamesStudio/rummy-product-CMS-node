export interface DailyWheelBonusType {
    _id: string;
    title: string;
    description: string;
    type: number;
    dailyWheelBonusIcon: string;
    dailyWheelBonusIconKey: String;
}

export interface createDailyWheelBonusType {
    type?: number;
    title?: string;
    description?: string;
    dailyWheelBonusIcon?: string;
    dailyWheelBonusIconKey?: String;
}