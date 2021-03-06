'use strict';
const auth = require('./auth');
const models = require('./models');
const modelsChangelog = require('./models/changelog');
const ping = require('./ping');
const twiglets = require('./twiglets');
const twigletsChangelog = require('./twiglets/changelog');
const twigletsModel = require('./twiglets/model');
const twigletsViews = require('./twiglets/views');

module.exports = {
  auth,
  models,
  modelsChangelog,
  ping,
  twiglets,
  twigletsChangelog,
  twigletsModel,
  twigletsViews,
};
