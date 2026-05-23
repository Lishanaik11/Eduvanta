import multer from "multer";
import path from "path";
import fs from "fs";

const assignmentPath = "uploads/assignments";

if (!fs.existsSync(assignmentPath)) {
  fs.mkdirSync(assignmentPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assignmentPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const uploadAssignment = multer({ storage });

export default uploadAssignment;