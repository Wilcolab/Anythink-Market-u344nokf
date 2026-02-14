var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var auth = require('../auth');

// Preload user profile on routes with ':username'
router.param('username', async (req, res, next, username) => {
  try {
    const user = await User.findOne({username: username});
    if (!user) {
      return res.sendStatus(404);
    }

    req.profile = user;
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/:username', auth.optional, async (req, res, next) => {
  try {
    if (req.payload) {
      const user = await User.findById(req.payload.id);
      if (!user) {
        return res.json({profile: req.profile.toProfileJSONFor(false)});
      }

      return res.json({profile: req.profile.toProfileJSONFor(user)});
    } else {
      return res.json({profile: req.profile.toProfileJSONFor(false)});
    }
  } catch (err) {
    next(err);
  }
});

router.post('/:username/follow', auth.required, async (req, res, next) => {
  try {
    const profileId = req.profile._id;

    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    await user.follow(profileId);
    return res.json({profile: req.profile.toProfileJSONFor(user)});
  } catch (err) {
    next(err);
  }
});

router.delete('/:username/follow', auth.required, async (req, res, next) => {
  try {
    const profileId = req.profile._id;

    const user = await User.findById(req.payload.id);
    if (!user) {
      return res.sendStatus(401);
    }

    await user.unfollow(profileId);
    return res.json({profile: req.profile.toProfileJSONFor(user)});
  } catch (err) {
    next(err);
  }
});

module.exports = router;
