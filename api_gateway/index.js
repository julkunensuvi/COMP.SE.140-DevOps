const express = require('express');
const app = express();
const PORT = 8197;

app.get('/state', (req, res) => {
    res.type('text/plain').send("TODO");
});

// Endpoint to update the state
app.put('/state', (req, res) => {
    res.status(200).send(`TODO`);
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