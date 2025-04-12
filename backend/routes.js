const express = require('express');
const router = express.Router();
const pipelineController = require('./controllers/pipelineController');

// Pipeline data endpoints
router.get('/pipeline-data', pipelineController.getPipelineData);

module.exports = router;