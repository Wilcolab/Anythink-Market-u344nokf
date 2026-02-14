const router = require("express").Router();
/**
 * Mongoose library for MongoDB object modeling
 * Provides schema validation, middleware, and query building capabilities
 * @module mongoose
 * @external mongoose
 * @see {@link https://mongoosejs.com/}
 */
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