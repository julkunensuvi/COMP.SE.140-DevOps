const axios = require('axios');

const BASE_URL = 'http://localhost:8197'; 

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
});