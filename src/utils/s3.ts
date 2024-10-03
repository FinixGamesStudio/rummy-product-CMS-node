// import * as AWS from "aws-sdk";
// v2
// const AWS = require('aws-sdk');
// const s3 = new AWS.S3();

// v3
import * as AWS from "@aws-sdk/client-s3";
import path from "path";
import * as fs from "fs";
import { UploadToS3WithPrefixData, uploadToS3WithCustomNameData } from '../interface/common.interface';

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY || '';
const SECRET_SECRET = process.env.AWS_SECRET_KEY || '';
const REGION = process.env.AWS_BUCKET_REGION || '';

const s3bucket = new AWS.S3({
  region: REGION, // replace with your AWS region
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_SECRET,
  },
})

// V2
// const s3bucket = new AWS.S3({
//   accessKeyId: ACCESS_KEY,
//   secretAccessKey: SECRET_SECRET
// });

export function uploadToS3(file: any, folderName: string, isLocalFile?: boolean): Promise<any> {
  const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);

  let bodyData = file.buffer;

  if (isLocalFile) {
    bodyData = fs.readFileSync(file.path);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: "ludo-cms/" + folderName + "/" + fileName,
    Body: bodyData,
    acl: 'public-read',
    contentType: file.mimetype
  };

  const uploadCommand = new AWS.PutObjectCommand(params);

  return new Promise((resolve, reject) => {
    // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
    // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
    s3bucket.send(uploadCommand)
      .then((response : any) => {
        console.log('Upload successful!');
         // Construct the URL

        const bucketUrl = `https://${params.Bucket}.s3.${REGION}.amazonaws.com`;
        const objectUrl = `${bucketUrl}/${params.Key}`;
        response.Location = objectUrl;
        console.log('response :: =>', JSON.stringify(response));
        // Additional response information is available in the 'response' object
        resolve(response);
      })
      .catch((error) => {
        console.error('Error uploading object:', error);
        reject(error);
      });
  });
}

export function uploadToS3InPng(file: any, folderName: string, isLocalFile?: boolean): Promise<any> {
  const fileName = file.fieldname + '-' + Date.now() + '.png'

  let bodyData = file.buffer;

  if (isLocalFile) {
    bodyData = fs.readFileSync(file.path);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: "ludo-cms/" + folderName + "/" + fileName,
    Body: bodyData,
    acl: 'public-read'
  };

  return new Promise((resolve, reject) => {
    // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
    // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
    const uploadCommand = new AWS.PutObjectCommand(params);
    s3bucket.send(uploadCommand, function (err: any, data: any) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

export function uploadLogFileToS3(filePath: any, fileName: any, folderName: string, isLocalFile?: boolean): Promise<any> {

  let bodyData = fs.readFileSync(filePath)

  const params = {
    Bucket: BUCKET_NAME,
    Key: "ludo-cms/" + folderName + "/" + fileName,
    Body: bodyData,
    acl: 'public-read'
  };

  return new Promise((resolve, reject) => {
    // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
    // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
    const uploadCommand = new AWS.PutObjectCommand(params);
    s3bucket.send(uploadCommand, function (err: any, data: any) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

export function uploadFileToS3(file: any, folderName: string, fileName: string): Promise<any> {

  const params = {
    Bucket: BUCKET_NAME,
    Key: "ludo-cms/" + folderName + "/" + fileName,
    Body: file,
    acl: 'public-read'
  };

  return new Promise((resolve, reject) => {
    // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
    // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
    const uploadCommand = new AWS.PutObjectCommand(params);
    s3bucket.send(uploadCommand, function (err: any, data: any) {
      if (err) {
        console.log('err :>> ', err);
        return reject(err);
      }

      return resolve(data);
    });
  });
}

export function getFileFromS3(key: string): Promise<any> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  const downloadCommand = new AWS.GetObjectCommand(params);
  return new Promise((resolve, reject) => {
    s3bucket.send(downloadCommand, function (err: any, data: any) {
      if (err) {
        reject(err);
      } else {
        console.log("Successfully dowloaded data from  bucket");
        resolve(data);
      }
    });
  });
}

export function deleteFromS3(key: string): Promise<any> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  const deleteCommand = new AWS.DeleteObjectCommand(params);

  return new Promise((resolve, reject) => {
    s3bucket.send(deleteCommand, function (err: any, data: any) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

export function uploadToS3WithPrefix(data: UploadToS3WithPrefixData): Promise<any> {
  const file = data.file;
  const folderName = data.folderName;
  const isLocalFile = data.isLocalFile;
  const fileNamePrefix = data.fileNamePrefix;

  const fileName = fileNamePrefix + '-' + Date.now() + path.extname(file.originalname);

  let bodyData = file.buffer;

  if (isLocalFile) {
    bodyData = fs.readFileSync(file.path);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: "ludo-cms" + folderName + "/" + fileName,
    Body: bodyData,
    acl: 'public-read'
  };

  return new Promise((resolve, reject) => {
    // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
    // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
    const uploadCommand = new AWS.PutObjectCommand(params);
    s3bucket.send(uploadCommand, function (err: any, data: any) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

export function uploadToS3WithCustomName(data: uploadToS3WithCustomNameData): Promise<any> {
  const file = data.file;
  const folderName = data.folderName;
  const isLocalFile = data.isLocalFile;
  const customFileName = data.customFileName;

  const fileName = customFileName + path.extname(file.originalname);

  let bodyData = file.buffer;

  console.log('file : ', file);

  if (isLocalFile) {
    bodyData = fs.createReadStream(file.path);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: "ludo-cms/" + folderName + "/" + fileName,
    Body: bodyData,
    acl: 'public-read',
    Metadata: { "Content-Type": file.mimetype },
  };

  console.log('params : ', params);

  return new Promise((resolve, reject) => {
    // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
    // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
    const uploadCommand = new AWS.PutObjectCommand(params);
    s3bucket.send(uploadCommand, function (err: any, data: any) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}