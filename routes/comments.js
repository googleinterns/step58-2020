'use strict';

const auth = require('../modules/auth.js');
const datastore = require('../modules/datastore.js');

const COMMENT_KIND = 'Comment';

/**
 * Fetches a comment given the same comment id and pathname.
 * If none exist, null is returned instead.
 * Referer is used so that each page could have a separate comment thread.
 **/
async function getComment(commentObject) {
  const query = datastore
    .createQuery(COMMENT_KIND)
    .filter('id', '=', commentObject.id)
    .filter('pathname', '=', commentObject.pathname);

  const [comments] = await datastore.runQuery(query);

  if (comments.length == 0) {
    return null;
  } else {
    return comments[0];
  }
}

module.exports = function(app) {
  /**
   * Handles comment submission, including both new comments
   * and updates to old comments.
   **/
  app.post('/comments', async function(request, response) {
    const userObject = await auth.getUser(request.cookies.token);
    const comment = request.body;
    delete comment.created_by_current_user;

    // Gets all the important information server-side
    // to prevent users injecting fake dates, etc.
    comment.fullname = userObject.user.username;
    comment.created = new Date().toISOString();
    comment.modified = new Date().toISOString();
    comment.profile_picture_url = userObject.user.pictureURL;

    // Check if this is an update to an old comment.
    const oldComment = await getComment(comment);

    // If users try to fake comment id to update other's comments
    // return nothing and let the client-side hang.
    if (oldComment && oldComment.fullname != comment.fullname) {
      return;
    }

    // If we are updating an old comment, use the old comment's creation date.
    if (oldComment) {
      comment.created = oldComment.created;
      await datastore.store(oldComment[datastore.KEY], comment);
    } else {
      datastore.store(COMMENT_KIND, comment);
    }

    response.send(comment);
  });

  /**
   * Fetches all the comment for a given page.
   **/
  app.get('/comments', async function(request, response) {
    const userObject = await auth.getUser(request.cookies.token);
    const pathname = request.query.pathname;

    const query = datastore
      .createQuery(COMMENT_KIND)
      .filter('pathname', '=', pathname);

    const comments = (await datastore.runQuery(query))[0];

    if (userObject === null) {
      comments.forEach(comment => comment.created_by_current_user = false);
      response.send(comments);
    } else {
      for (const comment of comments) {
        comment.created_by_current_user = 
          (comment.fullname == userObject.user.username);
      }
      response.send(comments);
    }

    response.send(comments);
  });
}
