// Import the pipelineService module which contains business logic for processing pipeline data
const pipelineService = require('../services/pipelineService');

// Controller function to handle GET request for pipeline data
exports.getPipelineData = (req, res) => {
    try {
        // Call the service method to process the raw pipeline data for frontend use
        const processedData = pipelineService.processDataForFrontend();

        // Send a successful JSON response with the processed data
        res.json({
            status: 'success',
            data: processedData
        });
    } catch (error) {
        // Handle any errors by sending a 500 Internal Server Error response with the error message
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
