const fs = require('fs');
const axios = require('axios');
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
            console.log('Shutting down all containers...');
            const containers = await axios.get('http://localhost/containers/json', {
                socketPath: '/var/run/docker.sock'
            });
    
            // Stop all containers concurrently
            const stopPromises = containers.data.map(container => 
                axios.post(`http://localhost/containers/${container.Id}/stop`, {}, {
                    socketPath: '/var/run/docker.sock'
                })
            );
            await Promise.all(stopPromises); // This doesn't really work as containers have already been shut down at this point... 
            console.log('All containers have been stopped.');
    
        } catch (error) {
            console.error(`Error during shutdown: ${error.message}`);
            res.status(500).send('Failed to completely shut down the system.');
        }
};



module.exports = { resetSystem, shutdown };
