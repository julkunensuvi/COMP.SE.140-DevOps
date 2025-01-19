const axios = require('axios');

const BASE_URL = 'http://localhost:8198/api';


describe('Service1 tests', () => {
    test('GET /api/ should return combined service info', async () => {
        const response = await axios.get(`${BASE_URL}/`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('service1');
        expect(response.data).toHaveProperty('service2');
    });


});

