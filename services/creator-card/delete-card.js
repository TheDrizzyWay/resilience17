const validator = require('@app-core/validator');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const transformDocument = require('@app/services/utility/transform-document');

const spec = `root {
  slug string<trim|lowercase|lengthBetween:5,50>
  creator_reference string<trim|length:20>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    const { slug, creator_reference: creatorReference } = data;

    const card = await CreatorCard.findOne({
      query: { slug, creator_reference: creatorReference },
      options: { session: options.session },
    });

    if (!card) {
      throw throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
    }

    await CreatorCard.deleteOne({
      query: { _id: card._id },
      options: { session: options.session },
    });

    result = transformDocument(card);
  } catch (error) {
    appLogger.errorX(error, 'delete-card-error');
    throw error;
  }

  return { ...result, deleted: new Date().getTime() };
}

module.exports = deleteCard;
