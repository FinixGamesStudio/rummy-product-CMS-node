import * as fs from 'fs';
import { writeToPath } from '@fast-csv/format';
import { Response } from 'express';
import { uploadFileToS3 } from './s3';
import { removeFile } from '.';

const CSV_DOWNLOAD_DIR = './src/download/csv/';
const TEMP_FILE_LIFETIME = 300000; // 5 minutes

const csvFileDownload = async (
  fileName: string,
  csvArray: any[],
  response: Response
): Promise<string> => {


  return new Promise<string>((resolve) => {
    try {
      fs.mkdirSync('./src/download/csv/', { recursive: true });
      const time = new Date().getTime();
      const file = `./src/download/csv/${fileName}-${time}.csv`;
      writeToPath(file, csvArray, { headers: true })
        .on('error', (err) => console.error(err))
        .on('finish', () => {
          resolve(file);
        });
    } catch (error) {
      console.error(error);
    }
  });
};

export default csvFileDownload;



// const timestamp = Date.now();
//   const uploadFileName = `${fileName}-${timestamp}.csv`;
//   const file = `${CSV_DOWNLOAD_DIR}${uploadFileName}`;

//   try {
//     fs.mkdirSync(CSV_DOWNLOAD_DIR, { recursive: true });
//     await writeToPath(file, csvArray, { headers: true });

//     const uploadResult = await uploadFileToS3(fs.createReadStream(file), "LogFile/csv", uploadFileName);

//     setTimeout(() => {
//       removeFile(file);
//     }, TEMP_FILE_LIFETIME);

//     console.log("uploadResult", uploadResult)
//     return uploadResult.Location;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }