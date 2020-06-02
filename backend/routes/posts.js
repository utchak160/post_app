const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const postController = require('../controllers/post');

const router = express.Router();


const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post('/api/posts', checkAuth, multer({storage: storage}).single('image'), postController.createPost);

router.get('/api/posts', postController.getPosts);

router.get('/api/posts/:id', postController.getPost);

router.put('/api/posts/:id', checkAuth, multer({storage: storage}).single('image'), postController.updatePost);

router.delete('/api/posts/:id', checkAuth, postController.deletePost);

module.exports = router;
