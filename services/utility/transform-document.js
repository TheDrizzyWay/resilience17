/* eslint-disable no-param-reassign */
function transformDocument(document) {
  if (!document) {
    return null;
  }

  document.id = document._id;
  delete document.__v;
  delete document._id;
  return document;
}

module.exports = transformDocument;
