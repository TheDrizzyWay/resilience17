// eslint-disable-next-line no-unused-vars
function commentBlockLineProcessor(line) {
  return {
    lineMatched: true,
    isCommentNode: true,
  };
}
module.exports = commentBlockLineProcessor;
