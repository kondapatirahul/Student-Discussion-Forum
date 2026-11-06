document.addEventListener('DOMContentLoaded', async () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const status = document.getElementById('dashboardStatus');
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  };

  try {
    const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiBase}/dashboard/overview`);
    const result = await response.json();

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Dashboard data could not be loaded.');
    }

    const overview = result.data;
    setText('discussionCount', overview.totalDiscussions ?? 0);
    setText('studentCount', overview.activeStudents ?? 0);
    setText('commentCount', overview.totalComments ?? 0);

    const categoryList = document.getElementById('categoryList');
    if (categoryList && Array.isArray(overview.categories)) {
      categoryList.replaceChildren();
      overview.categories.forEach((category) => {
        const row = document.createElement('div');
        row.className = 'category-row';

        const name = document.createElement('span');
        name.textContent = category.name;

        const count = document.createElement('span');
        count.className = 'category-count';
        count.textContent = String(category.discussionCount ?? 0);

        row.append(name, count);
        categoryList.append(row);
      });
    }

    const recent = document.getElementById('recentDiscussions');
    if (recent && Array.isArray(overview.recentDiscussions) && overview.recentDiscussions.length > 0) {
      recent.replaceChildren();
      overview.recentDiscussions.forEach((discussion) => {
        const item = document.createElement('article');
        item.className = 'recent-discussion-item';

        const title = document.createElement('h3');
        title.className = 'h6 fw-semibold mb-1';
        title.textContent = discussion.title || 'Untitled discussion';

        const summary = document.createElement('p');
        summary.className = 'small text-secondary mb-0';
        summary.textContent = discussion.category || 'General';

        item.append(title, summary);
        recent.append(item);
      });
    }

    if (status) status.textContent = overview.message || 'Dashboard overview loaded successfully.';
  } catch (error) {
    if (status) status.textContent = `Dashboard could not connect to the API: ${error.message}`;
    setText('discussionCount', 0);
    setText('studentCount', 0);
    setText('commentCount', 0);
  }
});
