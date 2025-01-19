const express = require('express');
const app = express();
const { parseNginxLog } = require('./helpers/logParser');

const PORT = 8197;
let state = 'INIT';
let stateLog = []; // [{ state, timestamp }]
const logFilePath = '/var/log/nginx/access.log'; 

function updateStateInit() {
    try {
        const result = parseNginxLog(logFilePath);

        if (result.success) {
            const formattedTimestamp = result.timestamp;

            if (state === 'INIT') {
                stateLog.push({
                    state,
                    newState: 'RUNNING',
                    timestamp: formattedTimestamp,
                });
                state = 'RUNNING';
            }
        }
    } catch (error) {
        console.error('Error updating state:', error.message);
    }
}

app.get('/state', async (req, res) => {
    if (state === 'INIT') {
        updateStateInit(); // Parse logs if state is INIT
    }
    res.type('text/plain').send(state);
});

// Endpoint to handle a request
app.get('/request', (req, res) => {
    res.type('text/plain').send('TODO');
});

app.get('/run-log', (req, res) => {
    res.type('text/plain').send("TODO");
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});