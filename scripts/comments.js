function loadCommentSection() {
  let notLoggedIn = true;
  if (getCookieValue('username')) {
    notLoggedIn = false;
  }

  console.log(notLoggedIn);

  $('#comments-container').comments({
    enableReplying: false,
    enableUpvoting: false,
    enableDeleting: false,
    enableAttachments: false,
    enableHashtags: false,
    enablePinging: false,
    enableDeletingCommentWithReplies: false,
    readOnly: notLoggedIn,


    getComments: async function(success, error) {
      $.ajax({
        type: 'get',
        url: '/comments/',
        data: {
          'pathname': `${window.location.pathname}`,
        },
        success: function(comments) {
          success(comments)
        },
        error: error
      });
    },

    putComment: function(commentJSON, success, error) {
      commentJSON.pathname = window.location.pathname;
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
      commentJSON.pathname = window.location.pathname;
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
}

window.addEventListener('load', loadCommentSection);
