import moment from 'moment';
import validate from '../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, STATUS_CODE } from '../constant';
import imageSize from 'image-size';
import path from 'path';


const isValidDate = async (value: string): Promise<boolean> => {
  const valueDate = moment(value);
  return valueDate.isValid();
};

const isValidExtenstion = async (mimetype: string, allowedExtension: string[]): Promise<boolean> => {
  if (allowedExtension.includes(mimetype)) {
    return true;
  } else {
    return false;
  }
};

const isValidFileSize = async (fileSize: number, maxSize: number): Promise<boolean> => {
  if (fileSize <= maxSize) {
    return true;
  } else {
    return false;
  }
};

const isValidDimensions = async (file: any, validWidth: number, validHeight: number): Promise<boolean> => {
  const dimensions = imageSize(file.buffer);
  if (dimensions.width == validWidth && dimensions.height == validHeight) {
    return true;
  } else {
    return false;
  }
};

const checkAllFilesExists = async (files: any, fileNamesArray: string[]): Promise<any> => {
  const responseData: any = {};

  for (let item = 0; item < fileNamesArray.length; item++) {
    const fileName = fileNamesArray[item];
    if (files[fileName]) {
      responseData[fileName] = files[fileName][0];
    }
  }

  return responseData;
};

const validateFile = async (
  responseObj: any,
  file: any,
  fieldName: string,
  allowedExtension: string[],
  errorFieldName: string,
  maxSizeInMb?: number,
) => {
  let errorMessage = '';
  let isValidFile = true;
  responseObj.statusCode = STATUS_CODE.BAD_REQUEST

  // console.log("file :::", file);

  if (!file) {
    isValidFile = false;
    errorMessage = ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', errorFieldName);
  } else if (file.fieldname != fieldName) {
    isValidFile = false;
    errorMessage = ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', errorFieldName);
  } else {
    // Validate extension
    if (allowedExtension.length > 0) {
      const extension = path.extname(file.originalname).toLowerCase();
      const isValidExt = await isValidExtenstion(extension, allowedExtension);

      if (!isValidExt) {
        isValidFile = false;
        errorMessage = ERROR_MESSAGES.COMMON.FILE_TYPE.replace(':attribute', fieldName)
          .replace(':values', `${allowedExtension.join('/')}`);
      }
    }

    // validaate file size
    if (maxSizeInMb) {
      const isValidSize = await isValidFileSize(
        file.size,
        maxSizeInMb * 1024 * 1024
      );

      if (!isValidSize) {
        isValidFile = false;
        errorMessage = ERROR_MESSAGES.COMMON.MAX_FILE_SIZE.replace(':attribute', fieldName)
          .replace(':value', `${maxSizeInMb.toString()} MB`);
      }
    }
  }
  console.log("isValidFile :::", isValidFile);

  if (!isValidFile) {
    throw new Error(errorMessage);
  }
};

class CommonValidation {
  validateOptionalNumber = (fieldName: string) =>
    validate([
      body(fieldName)
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', fieldName)
        )
    ]);

  validateOptionalString = (fieldName: string) =>
    validate([body(fieldName).optional({ nullable: true })]);
}

export { isValidDate, CommonValidation, isValidExtenstion, isValidFileSize, isValidDimensions, validateFile, checkAllFilesExists };
