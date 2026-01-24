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
    Paper,
    Stack,
    IconButton,
} from '@mui/material';
import { ArrowLeft, Trash2, Monitor, Smartphone, Plus, Edit2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
            {/* Header Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    mb: 5,
                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Back Button */}
                <Button
                    component={Link}
                    to="/"
                    variant="outlined"
                    startIcon={<ArrowLeft size={20} />}
                    sx={{
                        mb: 3,
                        borderWidth: 2,
                        cursor: 'pointer',
                        '&:hover': {
                            borderWidth: 2,
                        },
                    }}
                >
                    Trở về trang quét QR
                </Button>

                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                    Quản lý danh sách phòng
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Thêm, chỉnh sửa hoặc xóa các phòng trong hệ thống
                </Typography>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 3 }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                {/* Add Device Form */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
                    <TextField
                        fullWidth
                        label="Tên phòng mới"
                        variant="outlined"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addDevice()}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'rgba(30, 41, 59, 0.8)',
                                borderRadius: 3,
                                height: 56,
                                '& fieldset': {
                                    borderColor: 'rgba(148, 163, 184, 0.3)',
                                    borderWidth: 2,
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(34, 197, 94, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#22C55E',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(203, 213, 225, 0.7)',
                                '&.Mui-focused': {
                                    color: '#22C55E',
                                },
                            },
                        }}
                    />
                    <Button
                        onClick={addDevice}
                        variant="contained"
                        color="primary"
                        startIcon={<Plus size={20} />}
                        sx={{
                            minWidth: { xs: '100%', sm: 180 },
                            height: 56,
                            cursor: 'pointer',
                        }}
                    >
                        Thêm phòng
                    </Button>
                </Stack>
            </Paper>

            {/* Devices List by Floor */}
            {groupedFloors.map(({ label, items }) => (
                <Box key={label} mb={5}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 4,
                                height: 32,
                                bgcolor: '#22C55E',
                                borderRadius: 1,
                            }}
                        />
                        {label}
                        <Chip 
                            label={items.length} 
                            size="small" 
                            sx={{ 
                                bgcolor: 'rgba(34, 197, 94, 0.1)',
                                color: '#22C55E',
                                fontWeight: 700,
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                            }}
                        />
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(auto-fill, minmax(200px, 1fr))',
                                sm: 'repeat(auto-fill, minmax(240px, 1fr))',
                                md: 'repeat(auto-fill, minmax(260px, 1fr))',
                            },
                            gap: 3,
                        }}
                    >
                        {items.map((device) => (
                            <Paper
                                key={device.id}
                                sx={{
                                    p: 2.5,
                                    bgcolor: '#1E293B',
                                    borderRadius: 3,
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                                    transition: 'all 0.25s ease',
                                    cursor: editingId === device.id ? 'default' : 'pointer',
                                    '&:hover': {
                                        transform: editingId === device.id ? 'none' : 'translateY(-4px)',
                                        boxShadow: editingId === device.id 
                                            ? '0 4px 14px rgba(0, 0, 0, 0.25)'
                                            : '0 12px 28px rgba(0, 0, 0, 0.35)',
                                        borderColor: editingId === device.id 
                                            ? 'rgba(148, 163, 184, 0.1)'
                                            : 'rgba(34, 197, 94, 0.3)',
                                    },
                                }}
                                onClick={() => editingId !== device.id && startEditing(device)}
                            >
                                {editingId === device.id ? (
                                    <Stack spacing={2}>
                                        <TextField
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleUpdate(device.id)}
                                            autoFocus
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: 'rgba(15, 23, 42, 0.5)',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(34, 197, 94, 0.3)',
                                                        borderWidth: 2,
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'rgba(34, 197, 94, 0.5)',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#22C55E',
                                                    },
                                                },
                                            }}
                                        />
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdate(device.id);
                                            }}
                                            variant="contained"
                                            size="small"
                                            startIcon={<Check size={16} />}
                                            fullWidth
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            Lưu
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {/* Device Type Icon */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 0.75,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    bgcolor: device.device_type === 'windows11' 
                                                        ? 'rgba(34, 197, 94, 0.1)' 
                                                        : device.device_type === 'android'
                                                            ? 'rgba(59, 130, 246, 0.1)'
                                                            : 'rgba(148, 163, 184, 0.1)',
                                                    borderRadius: 1.5,
                                                    border: `1px solid ${
                                                        device.device_type === 'windows11' 
                                                            ? 'rgba(34, 197, 94, 0.3)' 
                                                            : device.device_type === 'android'
                                                                ? 'rgba(59, 130, 246, 0.3)'
                                                                : 'rgba(148, 163, 184, 0.3)'
                                                    }`,
                                                }}
                                            >
                                                {device.device_type === 'windows11' ? (
                                                    <Monitor size={14} color="#22C55E" />
                                                ) : device.device_type === 'android' ? (
                                                    <Smartphone size={14} color="#3B82F6" />
                                                ) : (
                                                    <Monitor size={14} color="#94A3B8" />
                                                )}
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '0.7rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                        color: device.device_type === 'windows11' 
                                                            ? '#22C55E' 
                                                            : device.device_type === 'android'
                                                                ? '#3B82F6'
                                                                : '#94A3B8',
                                                    }}
                                                >
                                                    {device.device_type === 'windows11' ? 'Win' : device.device_type === 'android' ? 'And' : 'N/A'}
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteDevice(device.id);
                                                }}
                                                sx={{
                                                    color: '#EF4444',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                    },
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Box>

                                        {/* Device Name */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontWeight: 700, 
                                                    fontSize: '1.25rem',
                                                    flex: 1,
                                                }}
                                            >
                                                {device.name}
                                            </Typography>
                                            <Edit2 size={16} style={{ opacity: 0.5 }} />
                                        </Box>

                                        {/* Device Info */}
                                        {device.ip && (
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    fontFamily: '"Fira Code", monospace',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {device.ip}:{device.port}
                                            </Typography>
                                        )}
                                    </Stack>
                                )}
                            </Paper>
                        ))}
                    </Box>
                </Box>
            ))}

            {/* Empty State */}
            {devices.length === 0 && !error && (
                <Paper
                    sx={{
                        p: 8,
                        textAlign: 'center',
                        bgcolor: 'rgba(30, 41, 59, 0.4)',
                        borderRadius: 4,
                        border: '2px dashed rgba(148, 163, 184, 0.3)',
                    }}
                >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Chưa có phòng nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Thêm phòng đầu tiên bằng form bên trên
                    </Typography>
                </Paper>
            )}
        </Container>
    );
}

export default DeviceManagerPage;
