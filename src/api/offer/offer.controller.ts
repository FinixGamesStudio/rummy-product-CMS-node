import { Router, Request, Response, NextFunction, response } from 'express';
import { MongoService, Pagination } from '../../utils';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import Controller from '../../interface/controller.interface';
import {
    ROUTES,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    STATUS_CODE,
    PERMISSION,
    USER_CONSTANT,
    OFFER_CONSTANT,
    IN_APP_STORE_CONSTANT,
} from '../../constant';
import OfferModel from './offer.model';
import OfferValidation from './offer.validation';
import { UpdateOffer } from './offer.interface';
import RequestWithComressImage from '../../interface/requestwithComressImagePath.interface';
import multer from 'multer';
import { uploadToS3 } from '../../utils/s3';
import { validateFile } from '../../utils/validationFunctions';
const upload = multer({ storage: multer.memoryStorage() });

class offerController implements Controller {
    public path = `/${ROUTES.OFFER}`;
    public router = Router();
    private Offer = OfferModel;
    private validation = new OfferValidation();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_EDITOR),
            upload.single('offerBannerImage'),
            this.validation.addOfferValidation(),
            this.createOffer
        );

        this.router.post(
            `${this.path}/getOffer`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_VIEWER),
            this.validation.getOfferValidation(),
            this.getOffer
        );

        this.router.put(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_EDITOR),
            upload.single('offerBannerImage'),
            this.validation.updateOfferValidation(),
            this.updateOffer
        );

        this.router.delete(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_EDITOR),
            this.validation.deleteOfferValidation(),
            this.deleteOffer
        );
    }

    private createOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const request = req as RequestWithComressImage;
            const file = request.file;

            const maxSize = IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_FILE_SIZE;

            const {
                offerName,
                offerDescription,
                startDate,
                endDate,
                offerPrice,
                offerChips,
                packageId
            } = req.body;


            let offer = await MongoService.findOne(this.Offer, {
                query: {
                    offerName: { $regex: new RegExp(`^${offerName}$`), $options: 'i' },
                },
                select: 'offerName'
            })

            if (offer) {
                response.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'offerName')
                );
            }

            // validate inAppStoreImage file
            await validateFile(
                request,
                file,
                'offerBannerImage',
                IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_EXT_ARRAY,
                'offerBannerImage',
                maxSize
            );

            const uploadResult = await uploadToS3(
                file,
                'offerBannerImage',
            );

            if (uploadResult) {

                offer = await MongoService.create(this.Offer, {
                    insert: {
                        offerName: offerName,
                        offerDescription: offerDescription,
                        startDate: startDate,
                        endDate: endDate,
                        offerPrice,
                        offerChips,
                        packageId,
                        offerBannerImage: uploadResult.Location
                    }
                })

                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Offer'),
                        data: offer
                    },
                    req,
                    res,
                    next
                );

            } else {
                response.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    'There was an issue into updating an offer Banner on s3 server.'
                );
            }

        } catch (error) {
            Logger.error(`There was an issue in create offer.: ${error}`);
            return next(error);
        }
    };

    private getOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { start, limit } = req.body
            const pageStart = start ? start : 0;
            const pageLimit = limit ? limit : 10;

            const offer = await Pagination(this.Offer, {
                // offset: pageStart,
                // limit: pageLimit
            })
console.log("====offer===",offer)
            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Offers"
                    ),
                    data: offer
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in fetch offers.: ${error}`);
            return next(error);
        }
    };

    private updateOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const {
                offerId,
                isImageUpdated,
                offerName,
                offerDescription,
                startDate,
                endDate,
                offerPrice,
                offerChips,
                packageId
            } = req.body;

            let updateData: UpdateOffer = {};
            const isImageUpdatedBoolean = Boolean(JSON.parse(isImageUpdated));

            const isOfferExits = await MongoService.findOne(this.Offer, {
                query: { _id: offerId }, select: '_id'
            })

            if (!isOfferExits) {
                response.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'offer'));
            } else {
                if (isImageUpdatedBoolean) {
                    const file = req.file;
                    const maxSize = IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_FILE_SIZE;

                    // validate inAppStoreImage file
                    await validateFile(
                        req,
                        file,
                        'offerBannerImage',
                        IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_EXT_ARRAY,
                        'offerBannerImage',
                        maxSize
                    );

                    const uploadResult = await uploadToS3(
                        file,
                        'offerBannerImage'
                    );

                    if (uploadResult) {
                        updateData.offerBannerImage = uploadResult.Location;
                    } else {
                        response.statusCode = STATUS_CODE.BAD_REQUEST;
                        throw new Error(
                            'There was an issue into updating an offer Banner on s3 server.'
                        );
                    }
                }
                
                updateData.offerName = offerName;
                updateData.offerDescription = offerDescription;
                updateData.startDate = startDate;
                updateData.endDate = endDate;
                updateData.offerPrice = offerPrice;
                updateData.offerChips = offerChips;
                updateData.packageId = packageId;

                const offer = await MongoService.findOneAndUpdate(this.Offer, {
                    query: { _id: offerId },
                    updateData: {
                        $set: updateData
                    }
                })
                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Offer'),
                        data: offer
                    },
                    req,
                    res,
                    next
                );
            }

        } catch (error) {
            Logger.error(`There was an issue into updating an offer.: ${error}`);
            return next(error);
        }
    };

    private deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { offerId } = req.body;
            const isOfferExits = await MongoService.findOne(this.Offer, {
                query: { _id: offerId }
            })

            if (!isOfferExits) {
                response.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'offer'));
            } else {
                const deleteResult = await MongoService.deleteOne(this.Offer, {
                    query: { _id: offerId }
                });
                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
                            ':attribute',
                            'Offer'
                        ),
                        data: isOfferExits
                    },
                    req,
                    res,
                    next
                );
            }
        } catch (error) {
            Logger.error(`There was an issue into deleting an offer.: ${error}`);
            return next(error);
        }
    };

}

export default offerController
