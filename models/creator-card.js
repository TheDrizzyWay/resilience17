/* eslint-disable no-param-reassign */
const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');
const timestamps = require('./plugins/timestamps');

const modelName = 'creator_cards';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} title
 * @property {String} description
 * @property {String} slug
 * @property {String} creator_reference
 * @property {Array} links
 * @property {Array} service_rates
 * @property {String} status
 * @property {String} access_type
 * @property {String} access_code
 * @property {Number} created
 * @property {Number} updated
 * @property {Number} deleted
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID },
  title: { type: SchemaTypes.String },
  description: { type: SchemaTypes.String },
  slug: { type: SchemaTypes.String, unique: true, index: true },
  creator_reference: { type: SchemaTypes.String, index: true },
  links: {
    type: SchemaTypes.Array,
    default: [],
    of: { title: { type: SchemaTypes.String }, url: { type: SchemaTypes.String } },
  },
  service_rates: {
    type: SchemaTypes.Array,
    default: [],
    of: {
      currency: { type: SchemaTypes.String },
      rates: {
        type: SchemaTypes.Array,
        default: [],
        of: {
          name: { type: SchemaTypes.String },
          amount: { type: SchemaTypes.Number },
          description: { type: SchemaTypes.String },
        },
      },
    },
  },
  status: { type: SchemaTypes.String },
  access_type: { type: SchemaTypes.String, default: 'public' },
  access_code: { type: SchemaTypes.String },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

modelSchema.plugin(timestamps);

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema, { paranoid: true });
