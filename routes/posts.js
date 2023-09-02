const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const upload = require("../middleware/muter")
const { v2: cloudinary } = require("cloudinary");
const getDataUri = require("../utils/dataUri");


cloudinary.config({ 
  cloud_name: 'du1sivwqb', 
  api_key: '195941781746291', 
  api_secret: 'guQ1GyduHXQJtuXpZ9ca3OFptzM' 
});

//create a post



router.post("/",upload , async (req, res) => {
  try {
    const { userId, desc } = req.body;
    const file = req.file;
    const dataUri = getDataUri(file)
    if (!userId || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload the image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(dataUri.content);
    console.log(cloudinaryResult);

    // Create a new post
    const newPost = new Post({
      userId,
      desc,
      img: cloudinaryResult.secure_url,
    });
    console.log(newPost);

    // Save the post to the database
    const savedPost = await newPost.save();

    return res.status(201).json(savedPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "An error occurred" });
  }
});
//update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike a post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts

router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's all posts

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;