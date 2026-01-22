

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

const db = require('./database.js');
app.use(express.json());

const inferDeviceType = (port) => {
    const p = Number(port);
    if (p === 8888) return 'windows11';
    if (p === 8081) return 'android';
    return 'unknown';
};

const normalizePath = (pathname, search, hash) => {
    const pathPart = pathname || '';
    const searchPart = search || '';
    const hashPart = hash || '';
    return `${pathPart}${searchPart}${hashPart}` || '/';
};

const buildCachedUrl = (device) => {
    if (device.last_url) return device.last_url;
    if (device.ip && device.port) {
        const path = device.path || '';
        const normalizedPath = path.startsWith('/') || path === '' ? path : `/${path}`;
        return `http://${device.ip}:${device.port}${normalizedPath}`;
    }
    return null;
};

const updateDeviceNetworkInfo = (deviceName, info) => new Promise((resolve, reject) => {
    const { ip, port, path, finalUrl, deviceType } = info;
    db.run(
        `UPDATE devices SET ip = ?, port = ?, path = ?, last_url = ?, device_type = ? WHERE name = ?`,
        [ip, port, path, finalUrl, deviceType, deviceName],
        (err) => {
            if (err) return reject(err);
            resolve();
        }
    );
});

const resolveViaNetwork = async (deviceName) => {
    const publicUrl = `http://qr.studiobox.vn:9096/qr/ITT/${deviceName}`;
    const response = await axios.get(publicUrl, { maxRedirects: 0, validateStatus: null });
    if (response.status >= 300 && response.status < 400 && response.headers.location) {
        const finalUrl = response.headers.location;
        const parsed = new URL(finalUrl);
        const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
        const path = normalizePath(parsed.pathname, parsed.search, parsed.hash);
        const deviceType = inferDeviceType(port);
        await updateDeviceNetworkInfo(deviceName, {
            ip: parsed.hostname,
            port,
            path,
            finalUrl,
            deviceType,
        });
        console.log(`Resolved (ID: ${deviceName}) -> ${finalUrl}`);
        return { url: finalUrl, deviceId: deviceName, type: deviceType };
    }
    console.warn(`Could not get redirect for (ID: ${deviceName}). Status: ${response.status}`);
    return null;
};

const resolveFromCache = async (device) => {
    const cachedUrl = buildCachedUrl(device);
    if (!cachedUrl) return null;
    try {
        await axios.get(cachedUrl, { timeout: 2000, validateStatus: () => true });
        const type = device.device_type || inferDeviceType(device.port);
        console.log(`Using cached URL for (ID: ${device.name}) -> ${cachedUrl}`);
        return { url: cachedUrl, deviceId: device.name, type };
    } catch (err) {
        console.warn(`Cached URL offline for (ID: ${device.name}): ${err.message}`);
        return null;
    }
};

app.get('/api/devices', (req, res) => {
    db.all("SELECT * FROM devices", [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/devices', (req, res) => {
    const { name } = req.body;
    // Check for duplicate
    db.get(`SELECT id FROM devices WHERE name = ?`, [name], (err, row) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        if (row) {
            res.status(409).json({ "error": `Phòng "${name}" đã tồn tại. Vui lòng chọn tên khác.` });
            return;
        }
        db.run(`INSERT INTO devices (name) VALUES (?)`, [name], function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": { id: this.lastID, name }
            });
        });
    });
});

app.put('/api/devices/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    // Check for duplicate (excluding current device)
    db.get(`SELECT id FROM devices WHERE name = ? AND id != ?`, [name, id], (err, row) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        if (row) {
            res.status(409).json({ "error": `Phòng "${name}" đã tồn tại. Vui lòng chọn tên khác.` });
            return;
        }
        db.run(`UPDATE devices SET name = ? WHERE id = ?`, [name, id], function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ message: "success", data: { id, name } });
        });
    });
});

app.delete('/api/devices/:id', (req, res) => {
    db.run(`DELETE FROM devices WHERE id = ?`, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "deleted", changes: this.changes });
    });
});

// Cache-first scan: try local cached URLs, fall back to network resolver when missing/offline
app.get('/scan/local', async (req, res) => {
    console.log('Received request to /scan/local');
    try {
        db.all("SELECT * FROM devices", [], async (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const results = await Promise.all(rows.map(async (device) => {
                const cached = await resolveFromCache(device);
                if (cached) return cached;
                return { deviceId: device.name, url: null, type: device.device_type || inferDeviceType(device.port), status: 'offline', reason: 'cached_url_unavailable' };
            }));
            const resolvedDevices = results.filter((r) => r && r.url);
            console.log('Local-only scan complete. Cached hits:', resolvedDevices.length, 'total devices:', results.length);
            res.json(results);
        });
    } catch (error) {
        console.error('Error during local-first scan:', error);
        res.status(500).json({ error: 'Failed to scan devices (local-first)' });
    }
});

// Network-only scan: always hit resolver and refresh cache
app.get('/scan/network', async (req, res) => {
    console.log('Received request to /scan/network');
    try {
        db.all("SELECT * FROM devices", [], async (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            const resolvedDevices = (
                await Promise.all(
                    rows.map((device) => resolveViaNetwork(device?.name).catch((e) => {
                        console.error(`Network resolve failed for ${device?.name}:`, e.message);
                        return null;
                    }))
                )
            ).filter(Boolean);
            console.log('Network-only scan complete. Devices:', resolvedDevices.length);
            res.json(resolvedDevices);
        });
    } catch (error) {
        console.error('Error during network-only scan:', error);
        res.status(500).json({ error: 'Failed to scan devices (network-only)' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
