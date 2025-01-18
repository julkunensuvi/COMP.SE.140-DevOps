const express = require('express');
const app = express();
const fs = require('fs');

const PORT = 8197;
let state = 'INIT';
let stateLog = []; // [{ state, timestamp }]
const logFilePath = '/var/log/nginx/access.log'; 

function parseNginxLog(logFilePath) {
    try {
        const logData = fs.readFileSync(logFilePath, 'utf8');
        const logEntries = logData.split('\n').filter(line => line.trim() !== '');

        logEntries.forEach(line => {
            console.log('Line:', line);

            const match = line.match(
                /(\S+) - \[(\d+\/\w+\/\d+:\d+:\d+:\d+ \+\d+)\] "GET \/ HTTP\/1\.1" (\d+)/
            );

            if (match) {
                const username = match[1];
                const rawTimestamp = match[2];
                const statusCode = match[3];

                if (statusCode === '200') {
                    const formattedTimestamp = rawTimestamp.replace(
                        /(\d+)\/(\w+)\/(\d+):(\d+:\d+:\d+) (\+\d+)/,
                        '$3-$2-$1T$4$5'
                    );

                    console.log('Formatted Timestamp:', formattedTimestamp);

                    console.log(
                        `Authenticated user: ${username}, Time: ${formattedTimestamp}, Status: ${statusCode}`
                    );

                    if (state === 'INIT') {
                        stateLog.push({
                            state,
                            newState: 'RUNNING',
                            timestamp: formattedTimestamp,
                        });
                        state = 'RUNNING';
                    }
                }
            } else {
                console.warn('Unmatched line:', line);
            }
        });

        fs.writeFileSync(logFilePath, '', 'utf8');

        return { success: true, message: 'Log parsed successfully' };
    } catch (error) {
        console.error('Error parsing log:', error.message);
        return { success: false, message: error.message };
    }
}


app.get('/state', async (req, res) => {
    if (state === 'INIT') {
        await parseNginxLog(logFilePath); // Parse logs if state is INIT
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