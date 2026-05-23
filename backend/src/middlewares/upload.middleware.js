import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/notes folder exists
const notesPath = 'uploads/notes';

if (!fs.existsSync(notesPath)) {
  fs.mkdirSync(notesPath, { recursive: true });
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, notesPath);

  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

const upload = multer({
  storage
});

export default upload;