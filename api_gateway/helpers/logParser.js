const fs = require('fs');

const parseNginxLog = (logFilePath) => {
    try {
        const logData = fs.readFileSync(logFilePath, 'utf8');
        const logEntries = logData.split('\n').filter(line => line.trim() !== '');

        for (const line of logEntries) {

            const match = line.match(
                /(\S+) - \[(\d+\/\w+\/\d+:\d+:\d+:\d+ \+\d+)\] "GET (\/[^\s]*) HTTP\/1\.1" (\d+)/
            );

            if (match) {
                const rawTimestamp = match[2]; // E.g., '19/Jan/2025:10:47:42 +0000'
                const path = match[3]; // E.g., '/' or '/api/'
                const statusCode = match[4]; // E.g., '200'

                if (statusCode === '200') {
                    const formattedTimestamp = rawTimestamp.replace(
                        /(\d+)\/(\w+)\/(\d+):(\d+:\d+:\d+) (\+\d+)/,
                        '$3-$2-$1T$4$5'
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

const formatStateLog = (log) => {
    return log
        .map(({ state, newState, timestamp }) => {
            // Format timestamp to desired format
            return `${timestamp}: ${state}->${newState}`;
        })
        .join('\n'); // Join all log entries with a newline
};

const formatServiceInfo = (jsonData) => {
    const services = Object.entries(jsonData)
        .map(([service, details]) => {
            const processes = details.processes
                .map(proc => `    - pid: ${proc.pid}, tty: ${proc.tty}, stat: ${proc.stat}, time: ${proc.time}, cmd: ${proc.cmd}`)
                .join('\n');
            return `
                ${service}:
                ip_address: ${details.ip_address}
                uptime: ${details.uptime}
                disk_space: ${details.disk_space}
                processes:
                ${processes}
                            `;
                        })
                        .join('\n');
    return services
};

module.exports = { parseNginxLog, formatStateLog, formatServiceInfo };
