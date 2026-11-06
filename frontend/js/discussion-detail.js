document.addEventListener('DOMContentLoaded', async () => {
  const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
  const status = document.getElementById('detailStatus');
  const article = document.getElementById('discussionDetail');
  const actions = document.getElementById('detailActions');
  const authorActions = document.getElementById('authorActions');
  const editPanel = document.getElementById('editPostPanel');
  const editForm = document.getElementById('editPostForm');
  const editMessage = document.getElementById('editPostMessage');
  const saveButton = document.getElementById('savePostButton');
  const deleteButton = document.getElementById('deletePostButton');
  const editContent = document.getElementById('editContent');
  const editCounter = document.getElementById('editContentCounter');
  const postId = new URLSearchParams(window.location.search).get('id');
  let loadedPost = null;

  document.getElementById('year').textContent = new Date().getFullYear();

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(date);
  }

  function showFailure(message) {
    status.textContent = message;
    status.classList.remove('alert-light');
    status.classList.add('alert-warning');
    actions.classList.remove('d-none');
  }

  function showEditMessage(text, type) {
    editMessage.textContent = text;
    editMessage.className = `alert alert-${type}`;
  }

  function hideEditMessage() {
    editMessage.textContent = '';
    editMessage.className = 'alert d-none';
  }

  function updateContentCounter() {
    editCounter.textContent = `${editContent.value.length} / 10000`;
  }

  function renderPost(post) {
    loadedPost = post;
    document.title = `${post.title || 'Discussion'} — CampusTalk`;
    document.getElementById('postCategory').textContent = post.category || 'General';
    document.getElementById('postDate').dateTime = post.createdAt || '';
    document.getElementById('postDate').textContent = `Published ${formatDate(post.createdAt)}`;
    document.getElementById('postTitle').textContent = post.title || 'Untitled discussion';
    document.getElementById('authorName').textContent = post.author?.name || 'Former student';
    document.getElementById('authorInitial').textContent = (post.author?.name || 'S').trim().charAt(0).toUpperCase();
    document.getElementById('postContent').textContent = post.content || '';
    const likeButton = document.getElementById('postLikeButton');
    const likeHint = document.getElementById('postLikeHint');
    likeButton.classList.toggle('is-liked', Boolean(post.isLiked));
    likeButton.setAttribute('aria-pressed', String(Boolean(post.isLiked)));
    likeButton.textContent = `♥ ${post.reactionCount || 0} ${(post.reactionCount || 0) === 1 ? 'like' : 'likes'}`;
    likeHint.textContent = window.CampusTalkSession?.getToken() ? 'Show appreciation for this discussion.' : 'Sign in to like this discussion.';
    document.getElementById('updatedDate').textContent =
      post.updatedAt && post.updatedAt !== post.createdAt ? `Updated ${formatDate(post.updatedAt)}` : 'Original post';

    const currentUser = window.CampusTalkSession?.getUser();
    const ownsPost = Boolean(currentUser?.id && post.author?.id && String(currentUser.id) === String(post.author.id));
    authorActions.classList.toggle('d-none', !ownsPost);
    status.classList.add('d-none');
    article.classList.remove('d-none');
  }

  async function loadPost() {
    const token = window.CampusTalkSession?.getToken();
    const response = await fetch(`${apiBase}/posts/${encodeURIComponent(postId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const result = await response.json();
    if (!response.ok || !result.success || !result.data?.post) {
      throw new Error(result.message || 'This discussion could not be loaded.');
    }
    renderPost(result.data.post);
  }

  if (!postId || !/^[a-fA-F0-9]{24}$/.test(postId)) {
    showFailure('This discussion link is missing a valid discussion ID.');
    return;
  }

  try {
    await loadPost();
  } catch (error) {
    showFailure(`${error.message} Check your connection and try again.`);
    return;
  }

  document.getElementById('postLikeButton').addEventListener('click', async () => {
    const token = window.CampusTalkSession?.getToken();
    if (!token) { window.location.href = 'login.html'; return; }
    const button = document.getElementById('postLikeButton');
    button.disabled = true;
    try {
      const response = await fetch(`${apiBase}/posts/${encodeURIComponent(postId)}/reaction`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.status === 401) { window.CampusTalkSession.clear(); window.location.replace('login.html'); return; }
      if (!response.ok || !result.success) throw new Error(result.message || 'Could not update your like.');
      button.classList.toggle('is-liked', result.data.liked);
      button.setAttribute('aria-pressed', String(result.data.liked));
      button.textContent = `♥ ${result.data.reactionCount} ${result.data.reactionCount === 1 ? 'like' : 'likes'}`;
    } catch (error) {
      document.getElementById('postLikeHint').textContent = error.message;
    } finally { button.disabled = false; }
  });

  document.getElementById('editPostButton').addEventListener('click', () => {
    if (!loadedPost) return;
    editForm.elements.title.value = loadedPost.title || '';
    editForm.elements.category.value = loadedPost.category || 'General';
    editContent.value = loadedPost.content || '';
    updateContentCounter();
    hideEditMessage();
    editPanel.classList.remove('d-none');
    editPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('cancelEditButton').addEventListener('click', () => {
    editPanel.classList.add('d-none');
    editForm.classList.remove('was-validated');
    hideEditMessage();
  });

  editContent.addEventListener('input', updateContentCounter);

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideEditMessage();
    if (!editForm.checkValidity()) {
      editForm.classList.add('was-validated');
      showEditMessage('Please correct the highlighted fields before saving.', 'warning');
      return;
    }

    const token = window.CampusTalkSession?.getToken();
    if (!token) {
      showEditMessage('Please log in again to edit your discussion.', 'warning');
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Saving…';
    try {
      const response = await fetch(`${apiBase}/posts/${encodeURIComponent(postId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editForm.elements.title.value.trim(),
          category: editForm.elements.category.value,
          content: editContent.value.trim()
        })
      });
      const result = await response.json();
      if (response.status === 401) {
        window.CampusTalkSession.clear();
        window.location.replace('login.html');
        return;
      }
      if (!response.ok || !result.success || !result.data?.post) {
        const extra = Array.isArray(result.errors) ? ` ${result.errors.join(' ')}` : '';
        throw new Error((result.message || 'Your discussion could not be updated.') + extra);
      }
      renderPost(result.data.post);
      editPanel.classList.add('d-none');
      editForm.classList.remove('was-validated');
      showEditMessage('Your discussion has been updated.', 'success');
      editPanel.classList.remove('d-none');
    } catch (error) {
      showEditMessage(error.message, 'danger');
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Save changes';
    }
  });

  deleteButton.addEventListener('click', async () => {
    if (!window.confirm('Delete this discussion permanently? This action cannot be undone.')) return;
    const token = window.CampusTalkSession?.getToken();
    if (!token) {
      window.location.replace('login.html');
      return;
    }

    deleteButton.disabled = true;
    deleteButton.textContent = 'Deleting…';
    try {
      const response = await fetch(`${apiBase}/posts/${encodeURIComponent(postId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.status === 401) {
        window.CampusTalkSession.clear();
        window.location.replace('login.html');
        return;
      }
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Your discussion could not be deleted.');
      }
      window.location.replace('discussions.html?deleted=1');
    } catch (error) {
      showEditMessage(error.message, 'danger');
      editPanel.classList.remove('d-none');
      deleteButton.disabled = false;
      deleteButton.textContent = 'Delete discussion';
    }
  });
});
