window.addEventListener('load', function() {
  $('#comments-container').comments({
    enableReplying: false,
    enableUpvoting: false,
    enableDeleting: false,
    enableAttachments: false,
    enableHashtags: false,
    enablePinging: false,
    enableDeletingCommentWithReplies: false,

    getComments: async function(success, error) {
      $.ajax({
        type: 'get',
        url: '/comments/',
        success: function(comments) {
          success(comments)
        },
        error: error
      });
    },

    putComment: function(commentJSON, success, error) {
      $.ajax({
        type: 'post',
        url: '/comments/',
        data: commentJSON,
        success: function(comment) {
          success(comment)
        },
        error: error
      });
    },

    postComment: function(commentJSON, success, error) {
      $.ajax({
        type: 'post',
        url: '/comments/',
        data: commentJSON,
        success: function(comment) {
          success(comment)
        },
        error: error
      });
    },
  });
});
