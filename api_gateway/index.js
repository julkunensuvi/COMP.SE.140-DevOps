const express = require('express');
const app = express();
const PORT = 8197;
let state = 'INIT';

function isAuthenticated(req) {
    const authHeader = req.headers['authorization'];
    return !!authHeader; // Return true if Authorization header is present
}

app.use((req, res, next) => {
    // If the system is in INIT state and the user is authenticated, transition to RUNNING
    if (state === 'INIT' && isAuthenticated(req)) {
        console.log('User authenticated. INIT to RUNNING.');
        state = 'RUNNING';
    }
    next();
});

app.get('/state', (req, res) => {
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