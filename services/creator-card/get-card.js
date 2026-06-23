const validator = require('@app-core/validator');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const CreatorCard = require('@app/repository/creator-card');
const { CreatorCardMessages } = require('@app/messages');
const transformDocument = require('@app/services/utility/transform-document');

const spec = `root {
  slug string<trim|lowercase|lengthBetween:5,50>
  access_code? string<trim|length:6>
}`;

const parsedSpec = validator.parse(spec);

async function getCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    const { slug, access_code: accessCode } = data;

    const card = await CreatorCard.findOne({
      query: { slug },
      options: { session: options.session },
    });

    if (!card) {
      throw throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF01);
    }

    if (card.status === 'draft') {
      throw throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.NF02);
    }

    if (card.access_type === 'private') {
      if (!accessCode) {
        throw throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED_FOR_PRIVATE, ERROR_CODE.AC03);
      }

      if (accessCode !== card.access_code) {
        throw throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.AC04);
      }
    }

    const { access_code: cardAccessCode, ...rest } = transformDocument(card);
    result = { ...rest };
  } catch (error) {
    appLogger.errorX(error, 'get-card-error');
    throw error;
  }

  return result;
}

module.exports = getCard;
