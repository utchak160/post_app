const express = require('express');
const multer = require('multer');
const Post = require('../models/post');

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

router.post('/api/posts', multer({storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    imagePath: url + "/images/" + req.file.filename
  });
  post.save().then((createdPost) => {
    res.status(201).send({
      message: 'Post Added Successfully',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  });
});

router.get('/api/posts', async (req, res, next) => {
  const posts = await Post.find();
  res.send({
    message: 'Post fetched Successfully',
    posts: posts
  });
});

router.get('/api/posts/:id', async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.send(post);
  }
});

router.put('/api/posts/:id', multer({storage: storage}).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  console.log(post);
  Post.updateOne({ _id: req.params.id }, post).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
});

router.delete('/api/posts/:id', async (req, res, next) => {
  await Post.deleteOne({_id: req.params.id});
  res.send({message: 'Removed Successfully'});
});

module.exports = router;