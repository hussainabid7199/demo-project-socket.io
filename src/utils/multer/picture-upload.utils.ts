/* eslint-disable @typescript-eslint/no-explicit-any */
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const pictureStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    let destinationFolder = 'public/uploads';

    if (file.fieldname === 'profilePicture') {
      destinationFolder += '/profile-picture';
    }

    cb(null, destinationFolder);
  },
  filename: (req: any, file: any, cb: any) => {
    const originalname = file.originalname;
    const extname = path.extname(originalname);
    const basename = path.basename(originalname, extname);

    let destinationFolder = 'public/uploads';

    if (file.fieldname === 'profilePicture') {
      destinationFolder += '/profile-picture';
    }

    // Function to generate a unique filename
    const generateUniqueFilename = (basename: string, extname: string, index: number) => {
      const newIndex = index > 0 ? `-${index}` : '';
      return `${basename}${newIndex}${extname}`;
    };

    let index = 0;
    let newFilename = originalname;

    // Loop to check for filename uniqueness
    while (fs.existsSync(path.join(destinationFolder, newFilename))) {
      index++;
      newFilename = generateUniqueFilename(basename, extname, index);
    }

    cb(null, newFilename);
  },
});

const pictureUpload = multer({
  storage: pictureStorage,
  fileFilter(req: any, file: any, callback: any) {
    if (!file.mimetype.startsWith('image/')) {
      callback(null, false);
      return callback(new Error('Only image file is allowed'));
    } else {
      if (file.fieldname === 'profilePicture') {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    }
  },
  limits: {
    fileSize: 1 * 1012 * 1024, //1 mb
  },
}).any();

export default pictureUpload;
