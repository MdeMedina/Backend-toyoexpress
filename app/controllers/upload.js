const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

function getFileByFilename(filename) {
const filePath = path.join("/tmp", "uploads", filename);
  try {
    const file = fs.readFileSync(filePath);
    return file;
  } catch (error) {
    return null;
  }
}

exports.getFileByFilename = (filename) => {
const filePath = path.join("/tmp", "uploads", filename);
  try {
    const file = fs.readFileSync(filePath);
    return file;
  } catch (error) {
    return null;
  }
};

exports.upload = upload.single("myFile");

exports.uploadFile = (req, res) => {
  res.send({ data: req.file.filename });
};
