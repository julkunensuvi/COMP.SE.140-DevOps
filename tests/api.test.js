const axios = require('axios');
const fs = require('fs');
const BASE_URL = 'http://localhost:8197'; 
const BASE_URL_SERVICE1 = 'http://localhost:8198'; 

const AUTH_CREDENTIALS = {
    username: 'test',
    password: 'Kahvikuppi',
};

describe('GET /state', () => {
    it('should return the initial state as INIT', async () => {
        const res = await axios.get(`${BASE_URL}/state`, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        expect(res.status).toBe(200);
        expect(res.data).toBe('INIT');
    });

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
});