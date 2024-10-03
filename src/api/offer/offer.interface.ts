export interface Offer {
    _id: string;
    offerName: string;
    offerDescription?: string;
    startDate: Date;
    endDate: Date;
    offerPrice: number;
    offerChips: number;
    packageId: string;
    offerBannerImage: string;
}

export interface UpdateOffer {
    offerName?: string;
    offerDescription?: string;
    startDate?: Date;
    endDate?: Date;
    offerPrice?: number;
    offerChips?: number;
    packageId?: string;
    offerBannerImage?: string;
}
