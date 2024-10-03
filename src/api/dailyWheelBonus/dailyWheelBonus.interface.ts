export interface DailyWheelBonus {
    _id: string;
    day: number;
    spinTitle: string;
    spinDescription?: string;
    realMoneyType: string;
    realMoneyAmount: number;
    bonusCashUpto: number;
    referralBooster: number;
}

export interface UpdateDailyWheelBonus {
    spinTitle?: string;
    spinDescription?: string;
    bonusType?: Array<Object>;
}