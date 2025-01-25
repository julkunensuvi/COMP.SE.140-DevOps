const express = require('express');
const app = express();

const { parseNginxLog} = require('./helpers/logParser');
const { resetSystem, shutdown, toggleNginxAccess, restartSystem, pauseSystem} = require('./helpers/serviceHandler');

const PORT = 8197;
let state = 'INIT';
let stateLog = []; // [{ state, timestamp }]
let requireReLogin = false;
const logFilePath = '/var/log/nginx/access.log'; 

app.use(express.text());

const validStates = ['INIT', 'PAUSED', 'RUNNING', 'SHUTDOWN'];

function updateStateLog(newState, timestamp = '123456'){
    console.log(`Updating ${state} to: ${newState}`);
    stateLog.push({
        state,
        newState,
        timestamp,
    });
    state = newState;
    console.log(`Updated state: ${state}`);
}

function checkStateInit() {
    try {
        const result = parseNginxLog(logFilePath);

        if (result.success) {
            const formattedTimestamp = result.timestamp;

            if (state === 'INIT') {
                updateStateLog('RUNNING', formattedTimestamp)
            }
        }
    } catch (error) {
        console.error('Error updating state:', error.message);
    }
}

async function updateState(req, res) {
    const receivedState = req.body

    if (!receivedState) {
        return res.status(400).send('State is required');
    }
    if (!validStates.includes(receivedState)) {
        return res.status(400).send(`Invalid state: ${receivedState}`);
    }

    checkStateInit()

    if (state === 'INIT' || state === receivedState) {
        return res.status(200).send(state);
    }

    switch (receivedState) {
        case 'SHUTDOWN':
            if(state === 'PAUSED') {
                await toggleNginxAccess(req, res, 'allow');
            }
            console.log('System is shutting down');
            state = 'SHUTDOWN';
            shutdown()
            break;

        case 'INIT':
            console.log('Resetting system to INIT');
            requireReLogin = true
            if(state === 'PAUSED') {
                await toggleNginxAccess(req, res, 'allow');
            }
            resetSystem(req, res, logFilePath);
            break;
        case 'PAUSED':
            await toggleNginxAccess(req, res, 'deny');
            break;
        case 'RUNNING':
            await toggleNginxAccess(req, res, 'allow');
            break;

        default:
            return res.status(400).send('Invalid state');
    }
    console.log(`Updating to: ${receivedState}`);
    updateStateLog(receivedState, '123456-dummy'); 
    return res.status(200).send(state);
}

app.get('/state',  (req, res) => {
    if (state === 'INIT') {
        console.log('State: INIT, Check if user has logged in...')
        checkStateInit(); 
    }
    res.type('text/plain').send(state);
});

// Endpoint to handle a request
app.get('/request', (req, res) => {
    res.type('text/plain').send('TODO');
});

// Endpoint to verify state
app.get('/auth', (req, res) => {
    console.log(`Verifying state... `);
    if ( !requireReLogin || state !== "INIT"){
        console.log(`First login or user has logged in`);
        res.status(200).send({ success: true, message: `State ${state}`, state });
    }
    else {
        requireReLogin = false
        res.status(401).send({ success: false, message: `State ${state}`, state });
    }
});

app.put('/state', (req, res) => {
    updateState(req, res)
});

app.get('/run-log', (req, res) => {
    res.type('text/plain').send("TODO");
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});