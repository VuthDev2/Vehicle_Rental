const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // uploads/ is gitignored, so it won't exist on a fresh clone or deploy
    fs.mkdir(UPLOAD_DIR, { recursive: true }, (err) => cb(err, UPLOAD_DIR));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
});

const resizeAndSave = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const outputPath = file.path.replace(/(\.\w+)$/, '_resized$1');
        await sharp(file.path)
          .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(outputPath);
        fs.unlinkSync(file.path);
        fs.renameSync(outputPath, file.path);
      })
    );
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = upload;
module.exports.resizeAndSave = resizeAndSave;
