const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 8199;

function getInfo() {
    return {
        ip_address: 'Dummy',
        processes: 'Dummy',
        disk_space: 'Dummy',
        uptime: 'Dummy'
    };
}

app.use(cors());

app.get('/info', async (req, res) => {
    const service1Info = getInfo();
    
    try {
        const service2Info = await axios.get('http://devops-service2-1:8300/info');
        res.json({
            service1: service1Info,
            service2: service2Info.data
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to Service2' });
    }
});

app.listen(PORT, () => {
    console.log(`Service1 is running on port ${PORT}`);
});
