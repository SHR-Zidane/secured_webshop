const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/ProfileController');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/',      auth, controller.get);
router.post('/',     auth, controller.update);
router.post('/photo', auth, upload.single('photo'), controller.uploadPhoto);

module.exports = router;
