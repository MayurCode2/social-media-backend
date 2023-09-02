// Import required modules and models
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const upload = require("../middleware/muter");
const getDataUri = require("../utils/dataUri");
// Update user details

// Configure multer


// Configure Cloudinary




router.put("/:id", async (req, res) => {
    // Check if the request user is authorized to update the account
    if (req.body.userId === req.params.id || req.user.isAdmin) {
        // If a new password is provided, hash and update it
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                return res.status(500).json(error);
            }
        }
        try {
            // Update the user's account details
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("You can update only your account");
    }
});

// Delete user account
router.delete("/:id", async (req, res) => {
    // Check if the request user is authorized to delete the account
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            // Delete the user's account
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can delete only your account!");
    }
});

// Get user details
router.get("/:id", async (req, res) => {
    try {
        // Fetch user details excluding sensitive information
        const user = await User.findById(req.params.id);
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (error) {
        console.log(error);
    }
});

// Get user's friends list
router.get("/friends/:userId", async (req, res) => {
    try {
        // Fetch user and their friends' details
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map((friend) => {
            const { _id, username, profilePicture } = friend;
            friendList.push({ _id, username, profilePicture });
        });
        res.status(200).json(friendList);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Follow a user
router.put("/:id/follow", async (req, res) => {
    // Check if the request user is trying to follow themselves
    if (req.body.userId !== req.params.id) {
        try {
            // Check if the user is already following the target user
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                // Update user and current user's follow data
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can't follow yourself");
    }
});

// Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    // Check if the request user is trying to unfollow themselves
    if (req.body.userId !== req.params.id) {
        try {
            // Check if the user is following the target user
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                // Update user and current user's follow data
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You don't follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can't unfollow yourself");
    }
});

// Route to update profile picture
router.put("/:id/update-profile-picture", upload, async (req, res) => {
    try {   
        // Check if the request user is authorized to update the account
            // Check if a file was uploaded
            const file = req.file;

            const dataUri = getDataUri(file);
            
            if (!file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            
            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(dataUri.content, {
                folder: 'profile-images', // Optional: Cloudinary folder to organize images
            });

            // Update user's profilePicture field with the Cloudinary URL
            await User.findByIdAndUpdate(req.params.id, { profilePicture: result.secure_url });

            res.status(200).json("Profile picture has been updated");
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});


router.put("/:id/cover-picture", upload, async (req, res) => {
    try {   
        // Check if the request user is authorized to update the account
            // Check if a file was uploaded
            const file = req.file;

            const dataUri = getDataUri(file);
            
            if (!file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            
            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(dataUri.content, {
                folder: 'profile-images', // Optional: Cloudinary folder to organize images
            });

            // Update user's profilePicture field with the Cloudinary URL
            await User.findByIdAndUpdate(req.params.id, { coverPicture: result.secure_url });

            res.status(200).json("cover Picture has been updated");
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});




// Export the router
module.exports = router;
