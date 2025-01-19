const fs = require('fs');

const parseNginxLog = (logFilePath) => {
    try {
        const logData = fs.readFileSync(logFilePath, 'utf8');
        const logEntries = logData.split('\n').filter(line => line.trim() !== '');

        for (const line of logEntries) {
            console.log('Line:', line);

            const match = line.match(
                /(\S+) - \[(\d+\/\w+\/\d+:\d+:\d+:\d+ \+\d+)\] "GET (\/[^\s]*) HTTP\/1\.1" (\d+)/
            );

            if (match) {
                const username = match[1]; // E.g., 'test' or '-'
                const rawTimestamp = match[2]; // E.g., '19/Jan/2025:10:47:42 +0000'
                const path = match[3]; // E.g., '/' or '/api/'
                const statusCode = match[4]; // E.g., '200'

                if (statusCode === '200') {
                    const formattedTimestamp = rawTimestamp.replace(
                        /(\d+)\/(\w+)\/(\d+):(\d+:\d+:\d+) (\+\d+)/,
                        '$3-$2-$1T$4$5'
                    );

                    console.log('Formatted Timestamp:', formattedTimestamp);
                    console.log(
                        `Authenticated user: ${username}, Path: ${path}, Time: ${formattedTimestamp}, Status: ${statusCode}`
                    );

                    return { success: true, timestamp: formattedTimestamp, path };
                }
            } else {
                console.warn('Unmatched line:', line);
            }
        }

        fs.writeFileSync(logFilePath, '', 'utf8');
        return { success: false, timestamp: '' };

    } catch (error) {
        console.error('Error parsing log:', error.message);
        return { success: false, timestamp: '' };
    }
};

module.exports = { parseNginxLog };
