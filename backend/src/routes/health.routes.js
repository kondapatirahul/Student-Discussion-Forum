const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (_req, res) => {
  const databaseState = mongoose.connection.readyState;
  const databaseConnected = databaseState === 1;

  res.status(200).json({
    success: true,
    service: 'student-discussion-forum-api',
    status: 'operational',
    database: databaseConnected ? 'connected' : 'not connected',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
