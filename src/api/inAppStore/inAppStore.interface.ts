export interface InAppStore {
    packageId: string,
    name: string,
    items : string,
    deviceType : string,
    price: number,
    coins: number,
    inAppStoreImage: string,
}

export interface UpdateInAppStore {
    productId?: string,
    name?: string,
    items? : string,
    deviceType? : string,
    price?: number,
    coins?: number,
    inAppStoreImage?: string,
}