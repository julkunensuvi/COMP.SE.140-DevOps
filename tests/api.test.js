const axios = require('axios');
const fs = require('fs');
const BASE_URL = 'http://localhost:8197'; 
const BASE_URL_SERVICE1 = 'http://localhost:8198'; 

const AUTH_CREDENTIALS = {
    username: 'test',
    password: 'Kahvikuppi',
};

beforeEach(async () => {
    try {
        const res = await axios.put(`${BASE_URL}/state`, 'INIT', {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
        console.log('State reset to INIT:', res.status); // Log for debugging
    } catch (error) {
        console.error('Error resetting state to INIT:', error.response?.data || error.message);
    }
});

describe('GET /state', () => {
    it('should return the initial state as INIT', async () => {

        const res = await axios.put(`${BASE_URL}/state`,'INIT', {
            headers: {
                'Content-Type': 'text/plain',
            },
        });

        const res2 = await axios.get(`${BASE_URL}/state`, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        expect(res2.status).toBe(200);
        expect(res2.data).toBe('INIT');

    });
});

describe('State transitions', () => {

    it('should update state to RUNNING after processing a valid log entry with Basic Auth', async () => {
        // First request processes the log and updates the state
        const res1 = await axios.get(`${BASE_URL_SERVICE1}/api/`, {
            headers: {
                'Accept': 'text/plain',
            },
            auth: AUTH_CREDENTIALS,
        });
        const res2 = await axios.get(`${BASE_URL}/state`, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        expect(res2.status).toBe(200);
        expect(res2.data).toBe('RUNNING');
    });

    it('should update state using PUT /state', async () => {
        // ensure user is authenicated > state is RUNNING
        const res1 = await axios.get(`${BASE_URL_SERVICE1}/api/`, {
            headers: {
                'Accept': 'application/json',
            },
            auth: AUTH_CREDENTIALS,
        });
        // Transition to PAUSED
        let res = await axios.put(`${BASE_URL}/state`,'PAUSED', {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
        expect(res.status).toBe(200);

        res = await axios.get(`${BASE_URL}/state`, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        expect(res.status).toBe(200);
        expect(res.data).toBe('PAUSED');

        // Transition to RUNNING
        res = await axios.put(`${BASE_URL}/state`,'RUNNING', {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
        expect(res.status).toBe(200);

        res = await axios.get(`${BASE_URL}/state`, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        expect(res.status).toBe(200);
        expect(res.data).toBe('RUNNING'); 
    });
});