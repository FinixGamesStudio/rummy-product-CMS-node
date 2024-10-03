import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService, Pagination } from '../../utils';
import roleMiddleware from '../../middleware/role.middleware';
import InAppStoreModel from './inAppStore.model';
import InAppStoreValidation from './inAppStore.validation';
import { UpdateInAppStore } from './inAppStore.interface';
import { validateFile } from '../../utils/validationFunctions';
import multer from 'multer';
import { uploadToS3 } from '../../utils/s3';
const upload = multer({ storage: multer.memoryStorage() });


import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODE,
  USER_CONSTANT,
  IN_APP_STORE_CONSTANT,
  PERMISSION,
} from '../../constant';
import fileSize from '../../utils/imageCompress';
import RequestWithComressImage from '../../interface/requestwithComressImagePath.interface';


class InAppStoreController implements Controller {
  public path = `/${ROUTES.IN_APP_STORE}`;
  public router = Router();
  private validation = new InAppStoreValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_EDITOR),
      upload.single('inAppStoreImage'),
      this.validation.addInAppStoreValidation(),
      this.addInAppStore
    );

    this.router.put(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_EDITOR),
      upload.single('inAppStoreImage'),
      this.validation.updateInAppStoreValidation(),
      this.updateInAppStore
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_EDITOR),
      this.validation.deleteInAppStoreValidation(),
      this.deleteInAppStore
    );

    this.router.post(
      `${this.path}/getInApp`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_VIEWER),
      this.validation.getInAppValidation(),
      this.getInApp
    );

    this.router.post(
      `${this.path}/getInAppStore`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.STORE_VIEWER),
      this.validation.getInAppStoreValidation(),
      this.getInAppStore
    );
  }

  private addInAppStore = async (
    req: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const request = req as RequestWithComressImage;
      const file = request.file;

      const maxSize = IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_FILE_SIZE;
      const { packageId, name, price, coins, deviceType } = request.body;
       let productId = packageId;
      // check In-app exists or not
      let inAppStore = await MongoService.findOne(InAppStoreModel, {
        query: { name: { $regex: new RegExp(`^${name}$`), $options: 'i' } },
        select: 'name'
      });

      if (inAppStore) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'In-app'));
      }

      // validate inAppStoreImage file
      await validateFile(
        request,
        file,
        'inAppStoreImage',
        IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_EXT_ARRAY,
        'inAppStoreImage',
        maxSize
      );

      const uploadResult = await uploadToS3(
        file,
        'InAppStore/inAppStoreImages',
      );
      console.log("uploadResult :: >> ", uploadResult);

      if (uploadResult) {
        inAppStore = await MongoService.create(InAppStoreModel, {
          insert: {
            productId,
            name,
            items: IN_APP_STORE_CONSTANT.IN_APP_STORE_ITEMS.coins,
            deviceType,
            price,
            coins,
            inAppStoreImage: uploadResult.Location,
          }
        });
        console.log("inAppStore :: >> ", inAppStore);

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
              ':attribute',
              `${name} In-app`
            ),
            data: inAppStore
          },
          request,
          response,
          next
        );
      } else {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error('There was an issue into creating an In-app store.');
      }
    } catch (error) {
      Logger.error(
        `There was an issue into creating an In-app store.: ${error}`
      );
      return next(error);
    }
  };

  private updateInAppStore = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const {
        inAppId,
        isImageUpdated,
        packageId,
        name,
        price,
        coins,
      } = request.body;
      let updateData: UpdateInAppStore = {};
      const isImageUpdatedBoolean = Boolean(JSON.parse(isImageUpdated));

      // check In-app exists or not
      const isInAppExists = await MongoService.findOne(InAppStoreModel, {
        query: { name: { $regex: new RegExp(`^${name}$`), $options: 'i' } },
        select: 'name'
      });

      if (!isInAppExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'In-app')
        );
      } else {
        if (isImageUpdatedBoolean) {
          const file = request.file;
          const maxSize = IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_FILE_SIZE;

          // validate inAppStoreImage file
          await validateFile(
            request,
            file,
            'inAppStoreImage',
            IN_APP_STORE_CONSTANT.IN_APP_STORE_IMAGE_EXT_ARRAY,
            'inAppStoreImage',
            maxSize
          );

          const uploadResult = await uploadToS3(
            file,
            'InAppStore/inAppStoreImages'
          );

          if (uploadResult) {
            updateData.inAppStoreImage = uploadResult.Location;
          } else {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              'There was an issue into updating an In-app store on s3 server.'
            );
          }
        }
      }

      updateData.productId = packageId,
      updateData.name = name,
      updateData.price = price,
      updateData.coins = coins;

      const inAppStore = await MongoService.findOneAndUpdate(InAppStoreModel, {
        query: { _id: inAppId },
        updateData: { $set: updateData }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
            ':attribute',
            `${name} In-app`
          ),
          data: inAppStore
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into updating an In-app store.: ${error}`
      );
      return next(error);
    }
  };

  private deleteInAppStore = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { inAppId } = request.body;

      // const maintenance = await MaintenanceModel.findOne();
      // console.log('maintenance', maintenance);

      // if (
      //   !maintenance ||
      //   (maintenance &&
      //     moment(maintenance.startDate).add({ hour: 5, minutes: 30 }) <
      //       moment().add({ hour: 5, minutes: 30 }))
      // ) {
      //   response.statusCode = STATUS_CODE.BAD_REQUEST;
      //   throw new Error(
      //     ERROR_MESSAGES.MAINTENANCE_REQUIRED.replace(
      //       ':attribute',
      //       'In APP Store'
      //     )
      //   );
      // }

      const inApp = await MongoService.deleteOne(InAppStoreModel, {
        query: { _id: inAppId }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
            ':attribute',
            'In-app'
          ),
          data: inAppId
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into deleting an In-app store.: ${error}`
      );
      return next(error);
    }
  };

  private getInApp = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { inAppId } = request.body;
      const inApp = await MongoService.findOne(InAppStoreModel, {
        query: { _id: inAppId }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'In-app'
          ),
          data: inApp
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into fetching an In-app store.: ${error}`
      );
      return next(error);
    }
  };

  private getInAppStore = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { start, limit } = request.body;

      const pageStart = start ? start : 0;
      const pageLimit = limit ? limit : 10;

      const inAppStore = await Pagination(InAppStoreModel, {
        query:{},
        offset: pageStart,
        limit: pageLimit
      });
      Logger.info(
        `------->> :: inAppStore :: <----------- ${JSON.stringify(inAppStore)}`
      );
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'In-app store'
          ),
          data: inAppStore
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into fetching an In-app store.: ${error}`
      );
      return next(error);
    }
  };

}

export default InAppStoreController;
