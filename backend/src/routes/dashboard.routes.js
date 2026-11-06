const express = require('express');

const router = express.Router();

// This endpoint provides a stable dashboard contract.
// Counts remain zero until post and user modules are introduced.
router.get('/overview', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      totalDiscussions: 0,
      activeStudents: 0,
      totalComments: 0,
      categories: [
        { name: 'Programming', discussionCount: 0 },
        { name: 'Academics', discussionCount: 0 },
        { name: 'Projects', discussionCount: 0 },
        { name: 'Campus Life', discussionCount: 0 }
      ],
      recentDiscussions: [],
      message: 'Your dashboard is ready. Discussions will appear here as the forum grows.'
    }
  });
});

module.exports = router;
