// Error handlers for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('FATAL: Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const express = require('express');
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

// Import database - it will auto-initialize
const db = require('./database.js');
app.use(express.json());

// Error handling middleware for invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err);
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
});

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
        
        // Health check: verify final URL is accessible
        try {
            await axios.get(finalUrl, { timeout: 3000, validateStatus: () => true });
            await updateDeviceNetworkInfo(deviceName, {
                ip: parsed.hostname,
                port,
                path,
                finalUrl,
                deviceType,
            });
            console.log(`Resolved (ID: ${deviceName}) -> ${finalUrl}`);
            return { url: finalUrl, deviceId: deviceName, type: deviceType };
        } catch (healthErr) {
            console.warn(`Device (ID: ${deviceName}) URL unreachable: ${finalUrl} - ${healthErr.message}`);
            return null;
        }
    }
    console.warn(`Could not get redirect for (ID: ${deviceName}). Status: ${response.status}`);
    return null;
};

app.get('/api/devices', (req, res) => {
    const { branch } = req.query;
    let query = "SELECT * FROM devices";
    let params = [];
    
    if (branch) {
        query += " WHERE branch = ?";
        params.push(branch);
    }
    
    db.all(query, params, (err, rows) => {
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
    const { name, branch } = req.body;
    
    if (!branch) {
        res.status(400).json({ "error": "Branch là bắt buộc." });
        return;
    }
    
    // Check for duplicate within the same branch
    db.get(`SELECT id FROM devices WHERE name = ? AND branch = ?`, [name, branch], (err, row) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        if (row) {
            res.status(409).json({ "error": `Phòng "${name}" đã tồn tại trong chi nhánh này. Vui lòng chọn tên khác.` });
            return;
        }
        db.run(`INSERT INTO devices (name, branch) VALUES (?, ?)`, [name, branch], function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": { id: this.lastID, name, branch }
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

// Scan devices: always hit network resolver
app.get('/scan/network', async (req, res) => {
    console.log('Received request to /scan/network');
    const { branch } = req.query;
    
    if (!branch) {
        return res.status(400).json({ error: 'Branch parameter is required' });
    }
    
    try {
        db.all("SELECT * FROM devices WHERE branch = ?", [branch], async (err, rows) => {
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

// Global error handler - must be last
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// Start server immediately (database is initialized in database.js)
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
