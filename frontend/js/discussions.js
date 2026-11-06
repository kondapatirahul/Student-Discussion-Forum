document.addEventListener('DOMContentLoaded', () => {
  const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
  const list = document.getElementById('discussionList');
  const message = document.getElementById('feedMessage');
  const summary = document.getElementById('resultSummary');
  const pageSummary = document.getElementById('pageSummary');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  const previousButton = document.getElementById('previousPage');
  const nextButton = document.getElementById('nextPage');
  const state = { page: 1, totalPages: 0, requestId: 0, limit: 8 };

  document.getElementById('year').textContent = new Date().getFullYear();

  function showMessage(text) {
    message.textContent = text;
    message.classList.remove('d-none');
  }

  function hideMessage() {
    message.textContent = '';
    message.classList.add('d-none');
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function makeDiscussionCard(post) {
    const article = document.createElement('article');
    article.className = 'discussion-card';

    const top = document.createElement('div');
    top.className = 'd-flex justify-content-between align-items-center flex-wrap gap-2 mb-3';
    const category = document.createElement('span');
    category.className = 'badge rounded-pill discussion-category';
    category.textContent = post.category || 'General';
    const date = document.createElement('time');
    date.className = 'discussion-meta';
    date.dateTime = post.createdAt || '';
    date.textContent = formatDate(post.createdAt);
    top.append(category, date);

    const title = document.createElement('h2');
    title.className = 'fw-bold mb-2';
    const titleLink = document.createElement('a');
    titleLink.className = 'discussion-title-link text-decoration-none';
    titleLink.href = `discussion.html?id=${encodeURIComponent(post.id)}`;
    titleLink.textContent = post.title || 'Untitled discussion';
    title.append(titleLink);

    const excerpt = document.createElement('p');
    excerpt.className = 'text-secondary mb-3';
    excerpt.textContent = post.excerpt || post.content || '';

    const footer = document.createElement('div');
    footer.className = 'discussion-meta d-flex align-items-center gap-2';
    const avatar = document.createElement('span');
    avatar.className = 'feed-author-avatar';
    avatar.textContent = (post.author?.name || 'S').trim().charAt(0).toUpperCase();
    const author = document.createElement('span');
    author.textContent = `Posted by ${post.author?.name || 'Former student'}`;
    footer.append(avatar, author);

    const readLink = document.createElement('a');
    readLink.className = 'small fw-semibold text-decoration-none';
    readLink.href = `discussion.html?id=${encodeURIComponent(post.id)}`;
    readLink.textContent = 'Read full discussion →';

    article.append(top, title, excerpt, footer, readLink);
    return article;
  }

  function renderPosts(posts) {
    list.replaceChildren();
    if (!posts.length) {
      const empty = document.createElement('div');
      empty.className = 'feed-empty';
      const heading = document.createElement('h2');
      heading.className = 'h5 fw-bold';
      heading.textContent = 'No discussions found';
      const copy = document.createElement('p');
      copy.className = 'mb-3';
      copy.textContent = 'Try another search or category, or start a new conversation.';
      const link = document.createElement('a');
      link.className = 'btn btn-primary btn-sm';
      link.href = 'create-post.html';
      link.textContent = 'Create a discussion';
      empty.append(heading, copy, link);
      list.append(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    posts.forEach((post) => fragment.append(makeDiscussionCard(post)));
    list.append(fragment);
  }

  async function loadPosts() {
    const requestId = ++state.requestId;
    list.innerHTML = '<div class="feed-loading"><span class="spinner-border spinner-border-sm text-primary" aria-hidden="true"></span> Loading student discussions…</div>';
    hideMessage();
    const params = new URLSearchParams({
      page: String(state.page),
      limit: String(state.limit),
      sort: sortFilter.value
    });
    if (categoryFilter.value) params.set('category', categoryFilter.value);
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());

    try {
      const response = await fetch(`${apiBase}/posts?${params.toString()}`);
      const result = await response.json();
      if (requestId !== state.requestId) return;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || 'The discussion feed could not be loaded.');
      }

      const { posts, pagination } = result.data;
      renderPosts(Array.isArray(posts) ? posts : []);
      state.totalPages = pagination.totalPages || 0;
      summary.textContent = `${pagination.total} ${pagination.total === 1 ? 'discussion' : 'discussions'} found`;
      pageSummary.textContent = state.totalPages ? `Page ${pagination.page} of ${state.totalPages}` : 'Page 1';
      previousButton.disabled = !pagination.hasPreviousPage;
      nextButton.disabled = !pagination.hasNextPage;
    } catch (error) {
      if (requestId !== state.requestId) return;
      list.replaceChildren();
      showMessage(`${error.message} Check that the backend and MongoDB connection are running.`);
      summary.textContent = 'Unable to load discussions';
      pageSummary.textContent = `Page ${state.page}`;
      previousButton.disabled = state.page <= 1;
      nextButton.disabled = true;
    }
  }

  document.getElementById('filterForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.page = 1;
    loadPosts();
  });

  document.getElementById('clearFilters').addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = '';
    sortFilter.value = 'latest';
    state.page = 1;
    loadPosts();
  });

  previousButton.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      loadPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextButton.addEventListener('click', () => {
    if (state.page < state.totalPages) {
      state.page += 1;
      loadPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  loadPosts();
});
