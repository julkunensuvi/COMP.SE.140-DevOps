const fs = require('fs');

const parseNginxLog = (logFilePath) => {
    try {
        const logData = fs.readFileSync(logFilePath, 'utf8');
        const logEntries = logData.split('\n').filter(line => line.trim() !== '');

        for (const line of logEntries) {
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

                    return { success: true, timestamp: formattedTimestamp };
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
