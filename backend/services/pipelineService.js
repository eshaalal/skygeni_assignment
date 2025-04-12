// Pipeline service for business logic
const pipelineData = require('../data/pipelineData');

exports.processDataForFrontend = () => {
    const suspectData = pipelineData.find(item => item.label === "Suspect");
    const wonData = pipelineData.find(item => item.label === "Won");
    
    // Enhanced data with additional calculated fields
    return pipelineData.map(stage => {
        // Calculate percentages for visualization
        const stageToSuspectRatio = {
            count: stage.count / suspectData.count,
            acv: stage.acv / suspectData.acv
        };
        
        // Calculate Won to current stage ratio
        const wonToStageRatio = {
            count: wonData.count / stage.count,
            acv: wonData.acv / stage.acv
        };
        
        // Format percentages for display
        const percentages = {
            // Percentage of the current stage compared to Suspect stage
            stageToSuspect: {
                count: Math.round(stageToSuspectRatio.count * 100),
                acv: Math.round(stageToSuspectRatio.acv * 100)
            },
            // Percentage of the Won stage compared to current stage
            wonToStage: {
                count: Math.round(wonToStageRatio.count * 100),
                acv: Math.round(wonToStageRatio.acv * 100)
            }
        };

        // Format currency values
        const formattedACV = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(stage.acv);

        return {
            ...stage,
            percentages,
            formattedACV
        };
    });
};