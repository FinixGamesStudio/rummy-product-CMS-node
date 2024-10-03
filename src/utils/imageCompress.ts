import path from 'path';
import Jimp from "jimp";
import { NextFunction, Response, Request } from 'express';
import Logger from '../logger/index';
import RequestWithComressImage from '../interface/requestwithComressImagePath.interface'
import {
    AVATAR_CONSTANT,
} from '../constant';


const fileSize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req as RequestWithComressImage;
        const file: any = req.file
        console.log('file :>> ', file);
        if (file) {
            let filename: any = file.fieldname + new Date().getTime() + Math.random() * 9000 + 1000 + "." + file.mimetype.split('/')[file.mimetype.split('/').length - 1]
            let compressImagePath = path.join(__dirname, '../../uploads/comressImage', filename)
            const image = await Jimp.read(file.path);
            image.resize(AVATAR_CONSTANT.AVATAR_IMAGE_FILE_COMRESS.resize, Jimp.AUTO);
            image.quality(AVATAR_CONSTANT.AVATAR_IMAGE_FILE_COMRESS.quality);
            image.write(compressImagePath); // writeAsync
            request.compressImagePath = compressImagePath;
        }
        next()
    } catch (error) {
        console.log('Compress Image Error======', error);
        Logger.error(`There was an issue into compressing file .: ${error}`);
    }
}

export default fileSize