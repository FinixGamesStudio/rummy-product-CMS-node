import { Request } from 'express';

interface RequestWithComressImage extends Request {
    compressImagePath: string;
}

export default RequestWithComressImage;
