const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { execSync } = require('child_process');
const app = express();
const { exec } = require('child_process');
const PORT = 8199;

// Openai: Helper function to clean and format the processes list
function formatProcesses(rawProcesses) {
    const processLines = rawProcesses.trim().split('\n').slice(1); // Skip header
    const processList = processLines.map(line => {
        const [pid, tty, stat, time, ...cmd] = line.trim().split(/\s+/); // Split line by whitespace
        return {
            pid,
            tty,
            stat,
            time,
            cmd: cmd.join(' ') // Join command parts back together
        };
    });
    return processList;
}


function getInfo() {
    const ip_address = execSync('hostname -I').toString().trim();
    const processes = execSync('ps -ax --format pid,tty,stat,time,cmd').toString().trim();
    const disk_space = execSync('df -h / --output=size,used,avail,pcent').toString().trim();
    const uptime = execSync('uptime -p').toString().trim();

    return {
        ip_address,
        processes: formatProcesses(processes),  // Format the process list
        disk_space,
        uptime
    };
}

app.use(cors());

app.get('/',  async (req, res) => {
    const service1Info = getInfo();
    
    try {
        const service2Info = await axios.get('http://service2:8300/info');
        res.json({
            service1: service1Info,
             service2: service2Info.data
        });
        // Delay
        setTimeout(() => {
            console.log('Ready for a request');
          }, 2000);
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to Service2' });
    }
});

app.post('/shutdown', async (req, res) => {
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
});

app.listen(PORT, () => {
    console.log(`Service1 is running on port ${PORT}`);
});
