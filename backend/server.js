

const express = require('express');
const ping = require('ping');
const cors = require('cors');
const axios = require('axios');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const port = 3001;

// Load OpenAPI spec
const openApiPath = path.join(__dirname, 'openapi.yaml');
const openApiSpec = YAML.load(openApiPath);
// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(cors());

const lastOctets = [
    101, 102, 111, 112, 113, 114, 115, 116, 117, 121, 122, 123, 124, 125, 126, 127,
    131, 132, 133, 134, 135, 136, 137, 141, 142, 143, 144, 145, 146, 147, 151, 152,
    153, 154, 155, 156, 157, 161, 162, 163, 171, 172, 173, 174, 175, 176, 177
];

const hosts = lastOctets.map(octet => `192.168.8.${octet}`);

function calculateDeviceId(octet) {
    const prefix = Math.floor(octet / 10) % 10;
    const suffix = octet % 10;
    const id_num = prefix * 100 + suffix;
    return id_num.toString().padStart(3, '0');
}

app.get('/scan', async (req, res) => {
    console.log('Received request to /scan');
    
    try {
        const pingPromises = hosts.map(host => ping.promise.probe(host, { timeout: 1 }));
        const pingResults = await Promise.all(pingPromises);
        const onlineHosts = pingResults.filter(result => result.alive);
        console.log(`Found ${onlineHosts.length} devices online. Resolving final URLs...`);

        const resolvePromises = onlineHosts.map(async (result) => {
            const lastOctet = parseInt(result.host.split('.')[3], 10);
            const deviceId = calculateDeviceId(lastOctet);
            const publicUrl = `http://qr.studiobox.vn:9096/qr/IPXL/${deviceId}`;

            try {
                const response = await axios.get(publicUrl, { maxRedirects: 0, validateStatus: null });
                if (response.status >= 300 && response.status < 400 && response.headers.location) {
                    const finalUrl = response.headers.location;
                    console.log(`Resolved ${result.host} (ID: ${deviceId}) -> ${finalUrl}`);
                    // Now returning the deviceId along with the ip and url
                    return { ip: result.host, url: finalUrl, deviceId: deviceId };
                } else {
                    console.warn(`Could not get redirect for ${result.host} (ID: ${deviceId}). Status: ${response.status}`);
                    return null;
                }
            } catch (error) {
                console.error(`Error resolving for ${result.host} (ID: ${deviceId}):`, error.message);
                return null;
            }
        });

        const resolvedDevices = (await Promise.all(resolvePromises)).filter(Boolean);
        console.log('Scan complete. Devices with resolved URLs:', resolvedDevices.length);
        res.json(resolvedDevices);

    } catch (error) {
        console.error('Error during the process:', error);
        res.status(500).json({ error: 'Failed to scan and resolve network devices' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
