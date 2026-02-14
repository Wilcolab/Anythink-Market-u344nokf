/**
 * Express router for managing comments on posts
 * @type {Express.Router}
 */

/**
 * Retrieves all comments for a specific post
 * @route GET /:postId
 * @param {string} req.params.postId - The ID of the post to fetch comments for
 * @returns {object[]} Array of comment objects sorted by creation date (newest first)
 * @throws {Error} Returns 500 status with error message on server error
 */

/**
 * Creates a new comment on a post
 * @route POST /:postId
 * @param {string} req.params.postId - The ID of the post to comment on
 * @param {object} req.body - Request body
 * @param {string} req.body.content - The content/text of the comment
 * @param {string} req.body.author - The author/username of the comment
 * @returns {object} The newly created comment object with generated ID and timestamps
 * @throws {Error} Returns 500 status with error message on server error
 */

/**
 * Deletes a specific comment from a post
 * @route DELETE /:postId/:commentId
 * @param {string} req.params.postId - The ID of the post (route parameter)
 * @param {string} req.params.commentId - The ID of the comment to delete
 * @returns {object} Success message upon deletion
 * @returns {Error} 404 status if comment not found
 * @throws {Error} Returns 500 status with error message on server error
 */
const router = require("express").Router();
const mongoose = require("mongoose");
const Comment = mongoose.model("Comment");

module.exports = router;
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:postId", async (req, res) => {
  try {
    const { content, author } = req.body;
    const newComment = new Comment({
      content,
      author,
      postId: req.params.postId,
    });
    const savedComment = await newComment.save();
    res.json(savedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// add another endpoint for deleting a comment
router.delete("/:postId/:commentId", async (req, res) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.commentId);
        if (!deletedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});