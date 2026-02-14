var router = require('express').Router();
var mongoose = require('mongoose');
var Item = mongoose.model('Item');

// return a list of tags
router.get('/', async (req, res, next) => {
  try {
    const tags = await Item.find().distinct('tagList');
    return res.json({tags: tags});
  } catch (err) {
    next(err);
  }
});

module.exports = router;
