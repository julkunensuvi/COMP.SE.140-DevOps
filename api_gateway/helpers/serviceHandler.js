const fs = require('fs');
const BASE_URL_NGINX = 'http://localhost:8198'; 

const resetSystem = async (req, res, accessLogPath) => {
    try {
        fs.writeFileSync(accessLogPath, '', 'utf8');
        console.log("Logging user out")

    } catch (error) {
        console.error('Error resetting system:', error.message);
        res.status(500).send({ success: false, message: 'Failed to reset system' });
    }
};

async function shutdown() {
    try {
        
        
        return { success: false, timestamp: '' };

    } catch (error) {
        console.error('Error in shutdown:', error.message);
        return { success: false, timestamp: '' };
    }
};



module.exports = { resetSystem, shutdown };
