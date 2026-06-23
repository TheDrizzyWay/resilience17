const { createHandler } = require('@app-core/server');
const deleteCardService = require('@app/services/creator-card/delete-card');
const CreatorCardMessages = require('@app/messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      creator_reference: rc.body.creator_reference,
    };

    const responseData = await deleteCardService(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_DELETED_SUCCESSFULLY,
      data: responseData,
    };
  },
});
