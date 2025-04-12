const pipelineService = require('../services/pipelineService');

exports.getPipelineData = (req, res) => {
    try {
        const processedData = pipelineService.processDataForFrontend();
        res.json({
            status: 'success',
            data: processedData
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};