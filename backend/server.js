

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

// Branch list with full information
const BRANCHES_DATA = [
    { code: 'PHI', name: 'ICOOL Phan Huy Ích', address: '455 Phan Huy Ích, Phường An Hội Tây, Quận Gò Vấp, TP.HCM' },
    { code: 'LVT', name: 'ICOOL Lê Văn Thọ', address: '142 Lê Văn Thọ, Phường Thông Tây Hội, Quận Gò Vấp, TP.HCM' },
    { code: 'LTH', name: 'ICOOL Lê Thị Hà', address: '269 Lê Thị Hà, Xã Hóc Môn, TP.HCM' },
    { code: 'SVH', name: 'ICOOL Sư Vạn Hạnh', address: '644 Sư Vạn Hạnh (hoặc 642-644), Phường 12/Hòa Hưng, Quận 10, TP.HCM' },
    { code: 'LVV', name: 'ICOOL Lê Văn Việt', address: '140 Lê Văn Việt, Phường Tăng Nhơn Phú, TP. Thủ Đức, TP.HCM' },
    { code: 'DL2', name: 'ICOOL Đại Lộ 2', address: '168 Đại Lộ 2, Phường Phước Long, TP. Thủ Đức, TP.HCM' },
    { code: 'HD', name: 'ICOOL Hoàng Diệu 2', address: '66G Hoàng Diệu 2, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM' },
    { code: 'HD65', name: 'ICOOL Hoàng Diệu 65', address: '65 Hoàng Diệu, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM' },
    { code: 'PXL', name: 'ICOOL Phan Xích Long', address: '266-268-270 Phan Xích Long, Phường 7/Cầu Kiệu, Phú Nhuận, TP.HCM' },
    { code: 'PCT', name: 'ICOOL Phan Chu Trinh', address: '39-41 Phan Chu Trinh, Phường 14, Bình Thạnh, TP.HCM' },
    { code: 'DD', name: 'ICOOL Đồng Đen', address: '124A Đồng Đen, Phường 14, Tân Bình, TP.HCM' },
    { code: 'NTP', name: 'ICOOL Nguyễn Tri Phương', address: '465 Nguyễn Tri Phương, Phường 8/Diên Hồng, Quận 10, TP.HCM' },
    { code: 'NTD', name: 'ICOOL Nhị Thiên Đường', address: '260 Quốc Lộ 50, Phường 6/Bình Đông, Quận 8, TP.HCM' },
    { code: 'CMTT', name: 'ICOOL Cách Mạng Tháng 8', address: '129A Cách Mạng Tháng 8, Phường Bàn Cờ, Quận 3, TP.HCM' },
    { code: 'TBT', name: 'ICOOL Trần Bình Trọng', address: '177 Trần Bình Trọng, Phường 3/Chợ Quán, Quận 5, TP.HCM' },
    { code: 'NT', name: 'ICOOL Nguyễn Trãi', address: '876-878 Nguyễn Trãi, Phường 14/Chợ Lớn, Quận 5, TP.HCM' },
    { code: 'TT', name: 'ICOOL Thành Thái', address: '120 Thành Thái, Phường Hòa Hưng, Quận 10, TP.HCM' },
    { code: 'CCY', name: 'ICOOL Cầu Chữ Y', address: '147 Dạ Nam, Phường Chánh Hưng, Quận 8, TP.HCM' },
    { code: 'MDC', name: 'ICOOL Mạc Đĩnh Chi', address: '90-92 Mạc Đĩnh Chi, Phường Tân Định, Quận 1, TP.HCM' },
    { code: 'NS', name: 'ICOOL Nguyễn Sơn', address: '38 Nguyễn Sơn, Phường Phú Thọ Hòa, Quận Tân Phú, TP.HCM' },
    { code: 'TN', name: 'ICOOL Trần Não', address: '18/9 Trần Não, Phường An Khánh, TP. Thủ Đức, TP.HCM' },
    { code: 'DBT', name: 'ICOOL Dương Bá Trạc', address: '456C1 Dương Bá Trạc, Phường Chánh Hưng, Quận 8, TP.HCM' },
    { code: 'UVK', name: 'ICOOL Ung Văn Khiêm', address: '122 Ung Văn Khiêm, Phường 25/Thạnh Mỹ Tây, Bình Thạnh, TP.HCM' },
    { code: 'TK', name: 'Tô Ký', address: 'B74 Bis Tô Ký, Phường Đông Hưng Thuận, Quận 12, TP.HCM' },
    { code: 'BP', name: 'Bình Phú', address: '31 Bình Phú, Phường 10/Bình Phú, Quận 6, TP.HCM' },
    { code: 'XVNT', name: 'Xô Viết Nghệ Tĩnh', address: '693 Xô Viết Nghệ Tĩnh, Phường 26, Bình Thạnh, TP.HCM' },
    { code: 'VT', name: 'ICOOL Vũng Tàu', address: '130 Hoàng Hoa Thám, Phường 2, TP. Vũng Tàu' },
];

const BRANCHES = BRANCHES_DATA.map(branch => ({ 
    code: branch.code, 
    prefixed: `I${branch.code}`,
    name: branch.name,
    address: branch.address
}));

app.get('/api/branches', (req, res) => {
    res.json({ message: 'success', data: BRANCHES });
});

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

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
