'use strict';
const PouchDb = require('pouchdb');
const Boom = require('boom');
const Joi = require('joi');
const config = require('../../../config');
const logger = require('../../../log')('CHANGELOG');

// probably want to return raw array rather than object (been flipping on this)
// but that would now be a breaking change
// thinking was object because that is extensible to include paging metadata
// but now maybe it's better to use Link headers (this is what GitHub does)
const getChangelogResponse = Joi.object({
  changelog: Joi.array().required().items(Joi.object({
    message: Joi.string().required(),
    user: Joi.string().required(),
    timestamp: Joi.date().iso(),
  }))
});

const addCommitMessage = ({ _id, commitMessage }, user, timestamp = new Date().toISOString()) => {
  const db = new PouchDb(config.getTenantDatabaseString(_id), { skip_setup: true });
  return db.info()
    .then(() => db.get('changelog')
      .catch((error) => {
        if (error.status !== 404) {
          throw error;
        }
        return { _id: 'changelog', data: [] };
      }))
    .then((doc) => {
      const commit = {
        message: commitMessage,
        user,
        timestamp,
      };
      doc.data.unshift(commit);
      return db.put(doc);
    });
};

const getChangelogHandler = (request, reply) => {
  const db = new PouchDb(config.getTenantDatabaseString(request.params.id), { skip_setup: true });
  return db.info()
    .then(() => db.get('changelog')
      .then((doc) => reply({ changelog: doc.data }))
      .catch((error) => {
        if (error.status !== 404) {
          throw error;
        }
        return reply({ changelog: [] });
      }))
    .catch((error) => {
      logger.error(JSON.stringify(error));
      return reply(Boom.create(error.status || 500, error.message, error));
    });
};

const routes = [
  {
    method: ['GET'],
    path: '/twiglets/{id}/changelog',
    handler: getChangelogHandler,
    config: {
      auth: { mode: 'optional' },
      response: { schema: getChangelogResponse },
      tags: ['api'],
    }
  },
];

module.exports = { routes, addCommitMessage };
