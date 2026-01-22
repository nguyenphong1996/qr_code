import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Button,
    TextField,
    Box,
    Alert,
    Chip,
    Paper // Import Paper component
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AndroidIcon from '@mui/icons-material/Android';

const Win11Icon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
        aria-hidden="true"
        {...props}
    >
        <rect x="3" y="3" width="8" height="8" rx="1.5" ry="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" ry="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" ry="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" ry="1.5" />
    </svg>
);

function DeviceManagerPage() {
    const [devices, setDevices] = useState([]);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/devices');
            setDevices(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching devices:', error);
            setError('Không thể tải danh sách thiết bị.');
        }
    };

    const addDevice = async () => {
        if (!newDeviceName.trim()) return;
        
        // Check for duplicate
        const duplicate = devices.find(d => d.name.toLowerCase() === newDeviceName.trim().toLowerCase());
        if (duplicate) {
            setError(`Phòng "${newDeviceName}" đã tồn tại. Vui lòng chọn tên khác.`);
            return;
        }
        
        try {
            await axios.post('http://localhost:3001/api/devices', { name: newDeviceName });
            setNewDeviceName('');
            setError(null);
            fetchDevices();
        } catch (error) {
            console.error('Error adding device:', error);
            if (error.response?.status === 409) {
                setError(error.response.data.error);
            } else {
                setError('Không thể thêm thiết bị.');
            }
        }
    };

    const deleteDevice = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/devices/${id}`);
            fetchDevices();
        } catch (error) {
            console.error('Error deleting device:', error);
            setError('Không thể xóa thiết bị.');
        }
    };

    const startEditing = (device) => {
        setEditingId(device.id);
        setEditingName(device.name);
    };

    const handleUpdate = async (id) => {
        if (!editingName.trim()) return;
        
        // Check for duplicate (excluding current device)
        const duplicate = devices.find(d => d.id !== id && d.name.toLowerCase() === editingName.trim().toLowerCase());
        if (duplicate) {
            setError(`Phòng "${editingName}" đã tồn tại. Vui lòng chọn tên khác.`);
            return;
        }
        
        try {
            await axios.put(`http://localhost:3001/api/devices/${id}`, { name: editingName });
            setEditingId(null);
            setEditingName('');
            setError(null);
            fetchDevices();
        } catch (error) {
            console.error('Error updating device:', error);
            if (error.response?.status === 409) {
                setError(error.response.data.error);
            } else {
                setError('Không thể cập nhật thiết bị.');
            }
        }
    };

    const groupDevicesByFloor = (list) => {
        const grouped = list.reduce((acc, device) => {
            const num = parseInt(device.name, 10);
            const floor = Number.isNaN(num) ? null : Math.floor(num / 100);
            const label = floor === null ? 'Khác' : floor === 0 ? 'Tầng trệt' : `Tầng ${floor}`;
            const order = floor === null ? 999 : floor;
            if (!acc[label]) acc[label] = { order, items: [] };
            acc[label].items.push(device);
            return acc;
        }, {});

        return Object.entries(grouped)
            .map(([label, data]) => ({ label, order: data.order, items: data.items.sort((a, b) => a.name.localeCompare(b.name)) }))
            .sort((a, b) => a.order - b.order);
    };

    const groupedFloors = groupDevicesByFloor(devices);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    color: 'text.primary',
                    backdropFilter: 'none',
                }}
            >
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom color="text.primary">
                        Quản lý danh sách phòng
                    </Typography>
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        size="small"
                        sx={{ mb: 2, boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)', px: 1.5, py: 0.5 }}
                    >
                        Trở về trang quét QR
                    </Button>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box display="flex" gap={2} mb={4} alignItems="stretch">
                        <TextField
                            fullWidth
                            label="Tên phòng mới"
                            variant="outlined"
                            value={newDeviceName}
                            onChange={(e) => setNewDeviceName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addDevice()}
                            InputLabelProps={{ style: { color: 'white' } }} // Ensure label is visible
                            InputProps={{ style: { color: 'white' } }} // Ensure input text is visible
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.light',
                                    },
                                },
                            }}
                        />
                        <Button
                            onClick={addDevice}
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                                boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
                                minWidth: 140,
                                px: 1.5,
                                py: 0.5
                            }}
                        >
                            Thêm phòng
                        </Button>
                    </Box>
                    {groupedFloors.map(({ label, items }) => (
                        <Box key={label} mb={3}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                {label}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: 'repeat(1, minmax(220px, 1fr))',
                                        sm: 'repeat(2, minmax(220px, 1fr))',
                                        md: 'repeat(3, minmax(220px, 1fr))',
                                    },
                                    gap: 3,
                                }}
                            >
                                {items.map((device) => (
                                    <Box key={device.id}>
                                        {editingId === device.id ? (
                                            <TextField
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onBlur={() => handleUpdate(device.id)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleUpdate(device.id)}
                                                autoFocus
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                InputLabelProps={{ style: { color: 'white' } }}
                                                InputProps={{ style: { color: 'white' } }}
                                                sx={{
                                                    width: '100%',
                                                    borderRadius: '20px',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '20px',
                                                        height: 44,
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'white',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: 'primary.light',
                                                        },
                                                    },
                                                }}
                                            />
                                        ) : (
                                            <Chip
                                                icon={
                                                    device.device_type === 'windows11'
                                                        ? <Win11Icon width={24} height={24} />
                                                        : device.device_type === 'android'
                                                            ? <AndroidIcon sx={{ fontSize: 24 }} />
                                                            : undefined
                                                }
                                                label={device.name}
                                                onClick={() => startEditing(device)}
                                                onDelete={() => deleteDevice(device.id)}
                                                deleteIcon={<Delete sx={{ color: '#d32f2f' }} />}
                                                sx={{
                                                    borderRadius: '20px',
                                                    height: 44,
                                                    width: '100%',
                                                    px: 1.25,
                                                    py: 0,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.1px',
                                                    cursor: 'pointer',
                                                    background: 'linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%)',
                                                    color: '#0f172a',
                                                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.25), 0 3px 10px rgba(0, 0, 0, 0.16)',
                                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 0.5,
                                                    '& .MuiChip-label': {
                                                        flex: 1,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        px: 1,
                                                    },
                                                    '& .MuiChip-icon': {
                                                        color: '#0f172a',
                                                        ml: 0.25,
                                                        width: 24,
                                                        height: 24,
                                                    },
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.25), 0 6px 14px rgba(0, 0, 0, 0.2)',
                                                    },
                                                    '&:focus-visible': {
                                                        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.25), 0 6px 14px rgba(0, 0, 0, 0.2)',
                                                    },
                                                    '& .MuiChip-deleteIcon': {
                                                        color: '#d32f2f',
                                                        '&:hover': {
                                                            color: '#b71c1c',
                                                            opacity: 0.9,
                                                        },
                                                    },
                                                }}
                                            />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Container>
    );
}

export default DeviceManagerPage;
