(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
    const postId = new URLSearchParams(window.location.search).get('id');
    const list = document.getElementById('commentList');
    if (!list || !postId) return;

    const form = document.getElementById('commentForm');
    const content = document.getElementById('commentContent');
    const submit = document.getElementById('submitComment');
    const status = document.getElementById('commentStatus');
    const count = document.getElementById('commentCount');
    const counter = document.getElementById('commentCounter');
    const loginHint = document.getElementById('commentLoginHint');
    const replyContext = document.getElementById('replyContext');
    const replyContextText = document.getElementById('replyContextText');
    const previous = document.getElementById('previousComments');
    const next = document.getElementById('nextComments');
    const pageSummary = document.getElementById('commentPageSummary');
    const state = { page: 1, totalPages: 0, total: 0, parentId: null, requestId: 0, limit: 20 };

    const session = window.CampusTalkSession;
    const signedIn = Boolean(session?.getToken());
    content.disabled = !signedIn;
    submit.disabled = !signedIn;
    loginHint.textContent = signedIn ? 'Your comment will be visible to everyone.' : 'Sign in to add a comment or reply.';

    function showStatus(text, type = 'info') {
      status.textContent = text;
      status.className = `alert alert-${type}`;
    }

    function clearStatus() {
      status.textContent = '';
      status.className = 'alert alert-light border d-none';
    }

    function updateCounter() {
      counter.textContent = `${content.value.length} / 2000`;
    }

    function formatDate(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'Date unavailable';
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    }

    function cancelReply() {
      state.parentId = null;
      replyContext.classList.add('d-none');
      replyContextText.textContent = '';
      content.placeholder = 'Share a helpful answer or thought…';
    }

    function makeCommentCard(comment, isReply = false) {
      const card = document.createElement('article');
      card.className = `comment-card${isReply ? ' reply-card' : ''}`;

      const header = document.createElement('div');
      header.className = 'd-flex justify-content-between align-items-start gap-2';
      const identity = document.createElement('div');
      identity.className = 'd-flex align-items-center gap-2';
      const avatar = document.createElement('span');
      avatar.className = 'comment-author-avatar';
      avatar.textContent = (comment.author?.name || 'S').trim().charAt(0).toUpperCase();
      const authorInfo = document.createElement('div');
      const author = document.createElement('div');
      author.className = 'small fw-semibold';
      author.textContent = comment.author?.name || 'Former student';
      const date = document.createElement('div');
      date.className = 'comment-meta';
      date.textContent = formatDate(comment.createdAt);
      authorInfo.append(author, date);
      identity.append(avatar, authorInfo);
      header.append(identity);

      const body = document.createElement('p');
      body.className = 'comment-body mt-3 mb-2';
      body.textContent = comment.content || '';

      const actionBar = document.createElement('div');
      actionBar.className = 'comment-actions';
      const currentUser = session?.getUser();
      const ownsComment = Boolean(currentUser?.id && comment.author?.id && String(currentUser.id) === String(comment.author.id));

      if (signedIn && !isReply) {
        const replyButton = document.createElement('button');
        replyButton.type = 'button';
        replyButton.className = 'btn btn-link btn-sm text-decoration-none p-0 me-2';
        replyButton.textContent = 'Reply';
        replyButton.addEventListener('click', () => {
          state.parentId = comment.id;
          replyContextText.textContent = `Replying to ${comment.author?.name || 'this student'}`;
          replyContext.classList.remove('d-none');
          content.placeholder = 'Write your reply…';
          content.focus();
        });
        actionBar.append(replyButton);
      }

      if (ownsComment) {
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-link btn-sm text-decoration-none p-0 me-2';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => openEditForm(card, comment));
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-link btn-sm text-danger text-decoration-none p-0';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => removeComment(comment));
        actionBar.append(editButton, deleteButton);
      }

      card.append(header, body, actionBar);
      return card;
    }

    function openEditForm(card, comment) {
      if (card.querySelector('.comment-edit-form')) return;
      const editForm = document.createElement('form');
      editForm.className = 'comment-edit-form';
      const textarea = document.createElement('textarea');
      textarea.className = 'form-control';
      textarea.rows = 3;
      textarea.minLength = 2;
      textarea.maxLength = 2000;
      textarea.required = true;
      textarea.value = comment.content;
      const controls = document.createElement('div');
      controls.className = 'd-flex gap-2 mt-2';
      const save = document.createElement('button');
      save.type = 'submit';
      save.className = 'btn btn-primary btn-sm';
      save.textContent = 'Save';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'btn btn-outline-secondary btn-sm';
      cancel.textContent = 'Cancel';
      cancel.addEventListener('click', () => editForm.remove());
      controls.append(save, cancel);
      editForm.append(textarea, controls);
      card.append(editForm);

      editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!editForm.reportValidity()) return;
        save.disabled = true;
        try {
          const response = await fetch(`${apiBase}/posts/${postId}/comments/${comment.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.getToken()}`
            },
            body: JSON.stringify({ content: textarea.value.trim() })
          });
          const result = await response.json();
          if (response.status === 401) {
            session.clear();
            window.location.replace('login.html');
            return;
          }
          if (!response.ok || !result.success) throw new Error(result.message || 'Comment update failed.');
          await loadComments();
          showStatus('Your comment has been updated.', 'success');
        } catch (error) {
          showStatus(error.message, 'danger');
          save.disabled = false;
        }
      });
    }

    async function removeComment(comment) {
      if (!window.confirm('Delete this comment?')) return;
      try {
        const response = await fetch(`${apiBase}/posts/${postId}/comments/${comment.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session.getToken()}` }
        });
        const result = await response.json();
        if (response.status === 401) {
          session.clear();
          window.location.replace('login.html');
          return;
        }
        if (!response.ok || !result.success) throw new Error(result.message || 'Comment deletion failed.');
        await loadComments();
        showStatus('Your comment has been deleted.', 'success');
      } catch (error) {
        showStatus(error.message, 'danger');
      }
    }

    function renderComments(comments) {
      list.replaceChildren();
      if (!comments.length) {
        const empty = document.createElement('div');
        empty.className = 'comment-empty small';
        empty.textContent = 'No comments yet. Start the conversation with a helpful response.';
        list.append(empty);
        return;
      }
      const roots = comments.filter((comment) => !comment.parentId);
      const repliesByParent = new Map();
      comments.filter((comment) => comment.parentId).forEach((reply) => {
        if (!repliesByParent.has(reply.parentId)) repliesByParent.set(reply.parentId, []);
        repliesByParent.get(reply.parentId).push(reply);
      });
      const renderedReplyIds = new Set();
      roots.forEach((rootComment) => {
        list.append(makeCommentCard(rootComment));
        (repliesByParent.get(rootComment.id) || []).forEach((reply) => {
          list.append(makeCommentCard(reply, true));
          renderedReplyIds.add(reply.id);
        });
      });
      // Keep a reply visible even when its parent falls on a different page.
      comments.filter((comment) => comment.parentId && !renderedReplyIds.has(comment.id))
        .forEach((reply) => list.append(makeCommentCard(reply, true)));
    }

    async function loadComments() {
      const requestId = ++state.requestId;
      list.innerHTML = '<div class="text-secondary small">Loading comments…</div>';
      try {
        const params = new URLSearchParams({ page: String(state.page), limit: String(state.limit) });
        const response = await fetch(`${apiBase}/posts/${postId}/comments?${params}`);
        const result = await response.json();
        if (requestId !== state.requestId) return;
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || 'Comments could not be loaded.');
        const data = result.data;
        state.total = data.pagination.total;
        state.totalPages = data.pagination.totalPages;
        count.textContent = `(${state.total})`;
        renderComments(data.comments || []);
        pageSummary.textContent = state.totalPages ? `Page ${state.page} of ${state.totalPages}` : 'Page 1';
        previous.disabled = !data.pagination.hasPreviousPage;
        next.disabled = !data.pagination.hasNextPage;
      } catch (error) {
        if (requestId !== state.requestId) return;
        list.replaceChildren();
        showStatus(error.message, 'warning');
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearStatus();
      if (!signedIn) {
        showStatus('Please sign in before posting a comment.', 'warning');
        return;
      }
      if (!form.reportValidity()) return;
      submit.disabled = true;
      submit.textContent = state.parentId ? 'Posting reply…' : 'Posting…';
      try {
        const response = await fetch(`${apiBase}/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.getToken()}`
          },
          body: JSON.stringify({ content: content.value.trim(), parentId: state.parentId })
        });
        const result = await response.json();
        if (response.status === 401) {
          session.clear();
          window.location.replace('login.html');
          return;
        }
        if (!response.ok || !result.success) throw new Error(result.message || 'Your comment could not be posted.');
        content.value = '';
        updateCounter();
        cancelReply();
        state.page = 1;
        await loadComments();
        showStatus(result.message || 'Your comment has been posted.', 'success');
      } catch (error) {
        showStatus(error.message, 'danger');
      } finally {
        submit.disabled = !signedIn;
        submit.textContent = 'Post comment';
      }
    });

    content.addEventListener('input', updateCounter);
    document.getElementById('cancelReply').addEventListener('click', cancelReply);
    previous.addEventListener('click', () => {
      if (state.page > 1) {
        state.page -= 1;
        loadComments();
      }
    });
    next.addEventListener('click', () => {
      if (state.page < state.totalPages) {
        state.page += 1;
        loadComments();
      }
    });

    updateCounter();
    loadComments();
  });
})();
