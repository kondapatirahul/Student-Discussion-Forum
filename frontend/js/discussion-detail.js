document.addEventListener('DOMContentLoaded', async () => {
  const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
  const status = document.getElementById('detailStatus');
  const article = document.getElementById('discussionDetail');
  const actions = document.getElementById('detailActions');
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

  const postId = new URLSearchParams(window.location.search).get('id');
  if (!postId || !/^[a-fA-F0-9]{24}$/.test(postId)) {
    showFailure('This discussion link is missing a valid discussion ID.');
    return;
  }

  try {
    const response = await fetch(`${apiBase}/posts/${encodeURIComponent(postId)}`);
    const result = await response.json();
    if (!response.ok || !result.success || !result.data?.post) {
      throw new Error(result.message || 'This discussion could not be loaded.');
    }

    const post = result.data.post;
    document.title = `${post.title || 'Discussion'} — CampusTalk`;
    document.getElementById('postCategory').textContent = post.category || 'General';
    document.getElementById('postDate').dateTime = post.createdAt || '';
    document.getElementById('postDate').textContent = `Published ${formatDate(post.createdAt)}`;
    document.getElementById('postTitle').textContent = post.title || 'Untitled discussion';
    document.getElementById('authorName').textContent = post.author?.name || 'Former student';
    document.getElementById('authorInitial').textContent = (post.author?.name || 'S').trim().charAt(0).toUpperCase();
    document.getElementById('postContent').textContent = post.content || '';
    document.getElementById('updatedDate').textContent =
      post.updatedAt && post.updatedAt !== post.createdAt ? `Updated ${formatDate(post.updatedAt)}` : 'Original post';

    status.classList.add('d-none');
    article.classList.remove('d-none');
  } catch (error) {
    showFailure(`${error.message} Check your connection and try again.`);
  }
});
