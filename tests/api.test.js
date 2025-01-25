const axios = require('axios');
const fs = require('fs');
const { isFloat32Array } = require('util/types');
const BASE_URL = 'http://localhost:8197'; 
const BASE_URL_SERVICE1 = 'http://localhost:8198'; 

const AUTH_CREDENTIALS = {
    username: 'test',
    password: 'Kahvikuppi',
};

async function authentication() {
    try {
        const res1 = await axios.get(`${BASE_URL_SERVICE1}/api/`, {
            headers: {
                'Accept': 'text/plain',
            },
            auth: AUTH_CREDENTIALS,
        });
        console.log('Authentication succeeded:', res1.status);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const res1 = await axios.get(`${BASE_URL_SERVICE1}/api/`, {
                headers: {
                    'Accept': 'text/plain',
                },
                auth: AUTH_CREDENTIALS,
            });
            return;

        }
        console.error('Unexpected error during authentication:', error.message);
        throw error; // Nosta virhe, jos se ei ole 401
    }
}

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
        await authentication()
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
        await authentication()
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

describe('GET /run-log', () => {
    it('should return run log containig state RUNNING', async () => {
        await authentication()

        const res = await axios.get(`${BASE_URL}/run-log`, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        expect(res.status).toBe(200);
        expect(res.data).toContain('RUNNING');

    });
});