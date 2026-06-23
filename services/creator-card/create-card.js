/* eslint-disable no-restricted-syntax */
const validator = require('@app-core/validator');
const { ulid } = require('@app-core/randomness');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const transformDocument = require('@app/services/utility/transform-document');
const CreatorCard = require('@app/repository/creator-card');

const isLetter = (code) => (code >= 65 && code <= 90) || (code >= 97 && code <= 122); // a-z A-Z
const isNumber = (code) => code >= 48 && code <= 57; // 0-9
const isHyphen = (ch) => ch === '-';
const isUnderscore = (ch) => ch === '_';

function isValidSlug(value) {
  for (const ch of value) {
    const code = ch.charCodeAt(0);

    if (!isLetter(code) && !isNumber(code) && !isHyphen(ch) && !isUnderscore(ch)) {
      return false;
    }
  }

  return true;
}

function generateSlug(input) {
  const chars = String(input).toLowerCase();

  let slug = '';
  let previousWasHyphen = false;

  for (const ch of chars) {
    const code = ch.charCodeAt(0);
    const isWhitespace =
      ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v';

    if (isLetter(code) || isNumber(code) || isUnderscore(ch)) {
      slug += ch;
      previousWasHyphen = false;
    } else if (isHyphen(ch)) {
      if (!previousWasHyphen) {
        slug += '-';
        previousWasHyphen = true;
      }
    } else if (isWhitespace) {
      if (!previousWasHyphen) {
        slug += '-';
        previousWasHyphen = true;
      }
    }
  }

  // Trim leading/trailing hyphens
  while (slug.startsWith('-')) {
    slug = slug.slice(1);
  }

  while (slug.endsWith('-')) {
    slug = slug.slice(0, -1);
  }

  // Generate random alphanumeric suffix
  function randomSuffix(length) {
    const validChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';

    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * validChars.length);
      result += validChars[index];
    }

    return result;
  }

  // Ensure minimum length of 5
  if (slug.length < 5) {
    slug += `-${randomSuffix(6)}`;
  }

  // Ensure maximum length of 50
  if (slug.length > 50) {
    slug = slug.slice(0, 50);

    // Avoid ending with a hyphen after truncation
    while (slug.endsWith('-')) {
      slug = slug.slice(0, -1);
    }
  }

  return slug;
}

const spec = `root {
  title string<trim|lengthBetween:3,100>
  description? string<trim|maxLength:500>
  slug? string<trim|lowercase|lengthBetween:5,50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|lengthBetween:1,100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|lengthBetween:3,100>
      description string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|length:6>
}`;

const parsedSpec = validator.parse(spec);

async function createCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    // Validate card links if any
    if (data.links && data.links.length > 0) {
      data.links.forEach((link) => {
        if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
          throwAppError(CreatorCardMessages.INVALID_CARD_LINK_URL, ERROR_CODE.VALIDATIONERR);
        }
      });
    }

    // Validate service rate amounts if any
    if (data.service_rates) {
      data.service_rates.rates.forEach((rate) => {
        if (
          typeof rate.amount === 'number' &&
          !Number.isInteger(rate.amount) &&
          Number.isFinite(rate.amount)
        ) {
          throwAppError(CreatorCardMessages.INVALID_SERVICE_RATE_AMOUNT, ERROR_CODE.VALIDATIONERR);
        }
      });
    }

    // Validate access type and access code for private cards
    if (data.access_type) {
      if (data.access_type.toLowerCase() === 'private' && !data.access_code) {
        throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED_FOR_PRIVATE, ERROR_CODE.ACO1);
      }

      if (data.access_type.toLowerCase() === 'public' && data.access_code) {
        throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED_FOR_PUBLIC, ERROR_CODE.ACO5);
      }
    }

    // handle slug
    if (data.slug) {
      if (!isValidSlug(data.slug)) {
        throwAppError(CreatorCardMessages.INVALID_SLUG_FORMAT, ERROR_CODE.VALIDATIONERR);
      }
    } else {
      data.slug = generateSlug(data.title);
    }

    // Check for duplicate slug
    const existingCard = await CreatorCard.findOne({
      query: { slug: data.slug },
      options: { session: options.session },
    });
    if (existingCard) {
      throwAppError(CreatorCardMessages.SLUG_EXISTS, ERROR_CODE.SL02);
    }

    const newCardData = await CreatorCard.create({
      ...data,
      _id: ulid(),
      status: data.status || 'draft',
    });

    result = transformDocument(newCardData);
  } catch (error) {
    appLogger.errorX(error, 'create-card-error');
    throw error;
  }

  return result;
}

module.exports = createCard;
