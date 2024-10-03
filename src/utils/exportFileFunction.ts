import { Request, Response, NextFunction } from 'express';
import csvFileDownload from './csvFileDownload';
import excelFileDownload from './excelFile';
import { successMiddleware } from '../middleware/responseAPI.middleware';
import { SUCCESS_MESSAGES } from '../constant';
import { removeFile } from '.';

const exportFileFunction = async (
  csvDownload: boolean,
  preFileName: string,
  data: any,
  response: Response,
  request: Request,
  next: NextFunction
) => {
  let tempFile = '';
  const TEMP_FILE_LIFETIME = 300000; // 5 minutes

  if (csvDownload) {
    tempFile = await csvFileDownload(preFileName, data, response);
  } else {
    tempFile = await excelFileDownload(preFileName, data, response);
  }

  const allSegments = tempFile.split("/");
  const fileName = allSegments[allSegments.length - 1];
  const folderName = allSegments[allSegments.length - 2];
  const filePath = `export/${folderName}/${fileName}`;

  // delete file created temporary
  setTimeout(() => {
    removeFile(tempFile)
  }, TEMP_FILE_LIFETIME);

  return successMiddleware(
    {
      message: SUCCESS_MESSAGES.COMMON.DOWNLOAD_SUCCESS.replace(':attribute', 'File'),
      data: { filePath: filePath }
    },
    request,
    response,
    next
  );
};

const exportObject = {
  exportFileFunction
};

export = exportObject;
