const { createHandler } = require('@app-core/server');
const createCardService = require('@app/services/creator-card/create-card');
const CreatorCardMessages = require('@app/messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  async handler(rc, helpers) {
    const payload = rc.body;

    const responseData = await createCardService(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_CREATED_SUCCESSFULLY,
      data: responseData,
    };
  },
});
