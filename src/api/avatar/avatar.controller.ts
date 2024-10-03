import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import AvatarModel from './avatar.model';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService, Pagination } from '../../utils';
import roleMiddleware from '../../middleware/role.middleware';

import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODE,
  USER_CONSTANT,
  AVATAR_CONSTANT,
  PERMISSION,
  COMMON_CONSTANT
} from '../../constant';

import AvatarValidation from './avatar.validation';
import { validateFile } from '../../utils/validationFunctions';
import { GetAllAvatar } from './avatar.interface';
import multer from 'multer';
import { uploadToS3, getFileFromS3, deleteFromS3 } from '../../utils/s3';
import fileSize from '../../utils/imageCompress';
import path from 'path';
import fs from 'fs';
import { UpdateAvatar } from './avatar.interface';
import UserModel from '../user/user.model';
import RequestWithComressImage from '../../interface/requestwithComressImagePath.interface';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(
      null,
      file.fieldname +
        '-' +
        datetimestamp +
        Math.random() * 9000 +
        1000 +
        '.' +
        file.mimetype.split('/')[file.mimetype.split('/').length - 1]
    );
  }
});

const upload = multer({ storage: storage });

class AvatarController implements Controller {
  public path = `/${ROUTES.AVATAR}`;
  public router = Router();
  private Avatar = AvatarModel;
  private validation = new AvatarValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.AVATARS_EDITOR),
      upload.single('avatarImage'),
      fileSize,
      this.validation.createAvatarValidation(),
      this.createAvatar
    );

    this.router.post(
      `${this.path}/getAvatars`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.user],
        PERMISSION.AVATARS_VIEWER
      ),
      this.validation.getAvatarValidation(),
      this.getAllAvatar
    );

    this.router.put(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.AVATARS_EDITOR),
      upload.single('avatarImage'),
      fileSize,
      this.validation.updateAvatarValidation(),
      this.updateAvatar
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.AVATARS_EDITOR),
      this.validation.deleteAvatarValidation(),
      this.deleteAvatar
    );

  }

  private createAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const file: any = req.file;
    const request = req as RequestWithComressImage;
    const compressImagePath = request.compressImagePath;
    try {
      const maxSize = AVATAR_CONSTANT.AVATAR_IMAGE_FILE_SIZE;

      // validate avatarImage file
      await validateFile(
        req,
        file,
        'avatarImage',
        AVATAR_CONSTANT.AVATAR_IMAGE_EXT_ARRAY,
        'avatarImage',
        maxSize
      );

      const { avatarName,gender, isFree, coins } = req.body;

      // Check is avatar already exists or not
      const isAvatarExists = await MongoService.findOne(this.Avatar, {
        query: {
          avatarName: { $regex: new RegExp(`^${avatarName}$`), $options: 'i' }
        },
        select: 'avatarName'
      });

      if (isAvatarExists) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'avatar')
        );
      } else {
        
        const uploadResult = await uploadToS3(file, 'AvatarImages', true);
        if (uploadResult) {
          const avatar = await MongoService.create(this.Avatar, {
            insert: {
              avatarName: avatarName,
              gender:gender,
              avatarImage: uploadResult.Location,
              isFree,
              coins,
              imageKey: uploadResult.key
            }
          });

          // remove file from local storeg
          fs.unlink(compressImagePath, function (err: any) {
            if (err) throw err;
          });
          fs.unlink(file.path, function (err: any) {
            if (err) throw err;
          });

          return successMiddleware(
            {
              message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
                ':attribute',
                'Avatar'
              ),
              data: avatar
            },
            req,
            res,
            next
          );
        } else {
          res.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error('There was an issue into creating an avatar.');
        }
      }
    } catch (error) {
      console.log('error================>', error);
      // remove file from local storeg
      fs.unlink(compressImagePath, function (err: any) {
        if (err) throw err;
      });
      fs.unlink(file.path, function (err: any) {
        if (err) throw err;
      });
      Logger.error(`There was an issue into creating an avatar.: ${error}`);
      return next(error);
    }
  };

  private getAllAvatar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { searchText, start, limit } = request.body;
      const pageStart = start ? start : 0;
      const pageLimit = limit ? limit : 10;
      let query: GetAllAvatar = {};
      console.log('request.body :>> ', request.body);
      if (searchText) {
        const regex = { $regex: new RegExp('^' + searchText + '', 'i') };

        query = {
          ...query,
          $or: [
            {
              avatarName: regex
            }
          ]
        };
      }

      let avatars:any = await Pagination(this.Avatar, {
        query,
        offset: pageStart,
        limit
      });

      if(!avatars.docs.length){
         avatars = await Pagination(this.Avatar, {
          query,
          offset: pageStart - pageLimit,
          limit
        });

      }
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Avatars'
          ),
          data: avatars
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching all avatars.: ${error}`);
      return next(error);
    }
  };

  private updateAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const file: any = req.file;
    const request = req as RequestWithComressImage;
    const compressImagePath = request.compressImagePath;
    const isImageUpdatedBoolean = Boolean(JSON.parse(req.body.isImageUpdated));
    try {
      const { avatarId, isImageUpdated, avatarName,gender, isFree, coins} = req.body;
      let updateData: UpdateAvatar = {};

      // Check is avatar belongs to valid publisher or not
      const isAvatarExists = await MongoService.findOne(this.Avatar, {
        query: { _id: avatarId },
        select: 'avatarName imageKey'
      });

      if (!isAvatarExists) {
        res.statusCode = STATUS_CODE.NON_AUTHORITATIVE_INFORMATION;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'avatar')
        );
      } else {
        if (isImageUpdatedBoolean) {
       
          const maxSize = AVATAR_CONSTANT.AVATAR_IMAGE_FILE_SIZE;

          // validate avatarImage file
          await validateFile(
            req,
            file,
            'avatarImage',
            AVATAR_CONSTANT.AVATAR_IMAGE_EXT_ARRAY,
            'avatarImage',
            maxSize
          );

          // Note : User has not access to deletefile. And permission also not given beacuse risk of delete bucket.
          // const deleteImageResult = await deleteFromS3(isAvatarExists.imageKey);
          let fileObj = {
            path: compressImagePath,
            fieldname: 'avatarImage',
            originalname: file.originalname
          };
          const uploadResult = await uploadToS3(fileObj, 'AvatarImages', true);
          if (uploadResult) {
            updateData.avatarName = avatarName;
            updateData.avatarImage = uploadResult.Location;
          } else {
            res.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              'There was an issue into updating avatar image on s3 server.'
            );
          }
        }
      }

      updateData.avatarName = avatarName;
      updateData.isFree = isFree;
      updateData.coins = coins;
      updateData.gender=gender
      // check avatarName exists or not
      const isAvatarNameExists = await MongoService.countDocuments(
        this.Avatar,
        {
          query: {
            _id: { $ne: avatarId },
            avatarName: {
              $regex: new RegExp(`^${updateData.avatarName}$`),
              $options: 'i'
            }
          }
        }
      );

      if (isAvatarNameExists) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'avatar')
        );
      } else {
        const avatar = await MongoService.findOneAndUpdate(this.Avatar, {
          query: { _id: avatarId },
          updateData: { $set: updateData }
        });

        // remove file from local storeg
        if (isImageUpdatedBoolean) {
          fs.unlink(compressImagePath, function (err: any) {
            if (err) throw err;
          });
          fs.unlink(file.path, function (err: any) {
            if (err) throw err;
          });
        }

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
              ':attribute',
              'Avatar'
            ),
            data: avatar
          },
          req,
          res,
          next
        );
      }
    } catch (error) {
      // remove file from local storeg
      if (isImageUpdatedBoolean) {
        fs.unlink(compressImagePath, function (err: any) {
          if (err) throw err;
        });
        fs.unlink(file.path, function (err: any) {
          if (err) throw err;
        });
      }
      Logger.error(`There was an issue into updating an avatar.: ${error}`);
      return next(error);
    }
  };

  private deleteAvatar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { avatarId } = request.body;

      // Check is avatar available or not
      const avatar = await MongoService.findOne(this.Avatar, {
        query: { _id: avatarId },
        select: 'avatarName imageKey'
      });
      if (!avatar) {
        response.statusCode = STATUS_CODE.NOT_FOUND;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'avatar')
        );
      } else {
  
        const isAvatatUsed = await MongoService.find(UserModel, {
          query: { useAvatar: avatarId }
        })

        if (isAvatatUsed && isAvatatUsed.length > 0) {
          response.statusCode = STATUS_CODE.NOT_FOUND;
          throw new Error(ERROR_MESSAGES.COMMON.ALREADY_IN_USE.replace(':attribute', 'avatar'));
        }

        const deleteResult = await MongoService.deleteOne(this.Avatar, {
          query: { _id: avatarId }
        });

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
              ':attribute',
              'Avatar'
            ),
            data: avatar
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into deleting an avatar.: ${error}`);
      return next(error);
    }
  };

}

export default AvatarController;
