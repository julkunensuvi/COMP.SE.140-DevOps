const fs = require('fs');
const axios = require('axios');
const exec = require('child_process').exec;

      

const reloadNginx = async (res) => {
    try {
        exec("docker exec nginx nginx -s reload", (error, stdout) => {
            if (error) {
                console.error('Error reloading nginx:', error.message);
                res.status(500).send({ success: false, message: 'Failed to reload nginx', error: error.message });
                return;
            }
        });
    } catch (error) {
        console.error('Error reloading nginx:', error.message);
        res.status(500).send({ success: false, message: 'Failed to reload nginx', error: error.message });
    }
};

const resetSystem = async (req, res, accessLogPath) => {
    try {
        fs.writeFileSync(accessLogPath, '', 'utf8');

    } catch (error) {
        console.error('Error resetting system:', error.message);
        res.status(500).send({ success: false, message: 'Failed to reset system' });
    }
};

const toggleNginxAccess = async (req, res, mode) => {
    try {
    
        const value = mode === 'deny' ? 1 : 0;

        const configPath = '/etc/nginx/nginx.conf';
        const config = fs.readFileSync(configPath, 'utf8');
        //const updatedConfig = config.replace(/= [01]\) \{/, `= ${value}) {`);
        const updatedConfig = config.replace(/set \$deny_access [0-1];/, `set $deny_access ${value};`);
        fs.writeFileSync(configPath, updatedConfig, 'utf8');
        await reloadNginx(res)
        // Always set back to initial so initial config is not lost
        const initConfig = config.replace(/set \$deny_access [0-1];/, `set $deny_access 0;`);
        fs.writeFileSync(configPath, initConfig, 'utf8');    
    } catch (error) {
        console.error('Error toggling nginx access:', error.message);
        res.status(500).send({ success: false, message: 'Failed to toggle nginx access' });
    }
};

const pauseSystem = async (req, res) => {
    try {
        await axios.post('http://localhost/containers/nginx/stop', {}, {
            socketPath: '/var/run/docker.sock'
        });
    } catch (error) {
        console.error('Error pausing nginx container:', error.message);
        res.status(500).send({ success: false, message: 'Failed to pause nginx container' });
    }
};

const restartSystem = async (req, res) => {
    try {
        await axios.post('http://localhost/containers/nginx/start', {}, {
            socketPath: '/var/run/docker.sock'
        });
    } catch (error) {
        console.error('Error starting nginx container:', error.message);
        res.status(500).send({ success: false, message: 'Failed to start nginx container' });
    }
};

async function shutdown(res) {

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
    
        } catch (error) {
            console.error(`Error during shutdown: ${error.message}`);
            res.status(500).send('Failed to completely shut down the system.');
        }
};



module.exports = { resetSystem, shutdown, toggleNginxAccess, pauseSystem, restartSystem };
