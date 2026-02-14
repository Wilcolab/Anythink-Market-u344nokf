var router = require("express").Router();
var mongoose = require("mongoose");
var Item = mongoose.model("Item");
var Comment = mongoose.model("Comment");
var User = mongoose.model("User");
var auth = require("../auth");
const { sendEvent } = require("../../lib/event");

// Preload item objects on routes with ':item'
router.param("item", async (req, res, next, slug) => {
  try {
    const item = await Item.findOne({ slug: slug }).populate("seller");
    if (!item) {
      return res.sendStatus(404);
    }
    req.item = item;
    next();
  } catch (err) {
    next(err);
  }
});

router.param("comment", async (req, res, next, id) => {
  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.sendStatus(404);
    }
    req.comment = comment;
    next();
  } catch (err) {
    next(err);
  }
});

router.get("/", auth.optional, async (req, res, next) => {
  try {
    var query = {};
    var limit = 100;
    var offset = 0;

    if (typeof req.query.limit !== "undefined") {
      limit = req.query.limit;
    }

    if (typeof req.query.offset !== "undefined") {
      offset = req.query.offset;
    }

    if (typeof req.query.tag !== "undefined") {
      query.tagList = { $in: [req.query.tag] };
    }

    const [seller, favoriter] = await Promise.all([
      req.query.seller ? User.findOne({ username: req.query.seller }) : null,
      req.query.favorited ? User.findOne({ username: req.query.favorited }) : null
    ]);

    if (seller) {
      query.seller = seller._id;
    }

    if (favoriter) {
      query._id = { $in: favoriter.favorites };
    } else if (req.query.favorited) {
      query._id = { $in: [] };
    }

    const [items, itemsCount, user] = await Promise.all([
      Item.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({ createdAt: "desc" })
        .exec(),
      Item.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null
    ]);

    const itemsWithSellers = await Promise.all(
      items.map(async (item) => {
        item.seller = await User.findById(item.seller);
        return item.toJSONFor(user);
      })
    );

    return res.json({
      items: itemsWithSellers,
      itemsCount: itemsCount
    });
  } catch (err) {
    next(err);
  }
});

router.get("/feed", auth.required, async (req, res, next) => {
  try {
    var limit = 20;
    var offset = 0;

    if (typeof req.query.limit !== "undefined") {
      limit = req.query.limit;
    }

    if (typeof req.query.offset !== "undefined") {
      offset = req.query.offset;
    }

    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    const [items, itemsCount] = await Promise.all([
      Item.find({ seller: { $in: user.following } })
        .limit(Number(limit))
        .skip(Number(offset))
        .populate("seller")
        .exec(),
      Item.count({ seller: { $in: user.following } })
    ]);

    return res.json({
      items: items.map((item) => item.toJSONFor(user)),
      itemsCount: itemsCount
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", auth.required, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    var item = new Item(req.body.item);
    item.seller = user;

    await item.save();
    sendEvent('item_created', { item: req.body.item });
    return res.json({ item: item.toJSONFor(user) });
  } catch (err) {
    next(err);
  }
});

// return a item
router.get("/:item", auth.optional, async (req, res, next) => {
  try {
    const [user] = await Promise.all([
      req.payload ? User.findById(req.payload.id) : null,
      req.item.populate("seller").execPopulate()
    ]);

    return res.json({ item: req.item.toJSONFor(user) });
  } catch (err) {
    next(err);
  }
});

// update item
router.put("/:item", auth.required, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id);
    
    if (req.item.seller._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.item.title !== "undefined") {
        req.item.title = req.body.item.title;
      }

      if (typeof req.body.item.description !== "undefined") {
        req.item.description = req.body.item.description;
      }

      if (typeof req.body.item.image !== "undefined") {
        req.item.image = req.body.item.image;
      }

      if (typeof req.body.item.tagList !== "undefined") {
        req.item.tagList = req.body.item.tagList;
      }

      const item = await req.item.save();
      return res.json({ item: item.toJSONFor(user) });
    } else {
      return res.sendStatus(403);
    }
  } catch (err) {
    next(err);
  }
});

// delete item
router.delete("/:item", auth.required, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    if (req.item.seller._id.toString() === req.payload.id.toString()) {
      await req.item.remove();
      return res.sendStatus(204);
    } else {
      return res.sendStatus(403);
    }
  } catch (err) {
    next(err);
  }
});

// Favorite an item
router.post("/:item/favorite", auth.required, async (req, res, next) => {
  try {
    const itemId = req.item._id;

    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    await user.favorite(itemId);
    const item = await req.item.updateFavoriteCount();
    return res.json({ item: item.toJSONFor(user) });
  } catch (err) {
    next(err);
  }
});

// Unfavorite an item
router.delete("/:item/favorite", auth.required, async (req, res, next) => {
  try {
    const itemId = req.item._id;

    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    await user.unfavorite(itemId);
    const item = await req.item.updateFavoriteCount();
    return res.json({ item: item.toJSONFor(user) });
  } catch (err) {
    next(err);
  }
});

// return an item's comments
router.get("/:item/comments", auth.optional, async (req, res, next) => {
  try {
    const user = req.payload ? await User.findById(req.payload.id) : null;

    await req.item.populate({
      path: "comments",
      populate: {
        path: "seller"
      },
      options: {
        sort: {
          createdAt: "desc"
        }
      }
    }).execPopulate();

    return res.json({
      comments: req.item.comments.map((comment) => comment.toJSONFor(user))
    });
  } catch (err) {
    next(err);
  }
});

// create a new comment
router.post("/:item/comments", auth.required, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    var comment = new Comment(req.body.comment);
    comment.item = req.item;
    comment.seller = user;

    await comment.save();
    req.item.comments = req.item.comments.concat([comment]);

    await req.item.save();
    return res.json({ comment: comment.toJSONFor(user) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:item/comments/:comment", auth.required, async (req, res, next) => {
  try {
    req.item.comments.remove(req.comment._id);
    await req.item.save();
    await Comment.find({ _id: req.comment._id }).remove().exec();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
