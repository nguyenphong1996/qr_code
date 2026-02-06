import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config';
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

function DeviceManagerPage({ selectedBranch, branches = [] }) {
    const [devices, setDevices] = useState([]);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Tìm thông tin chi nhánh được chọn
    const selectedBranchInfo = branches.find(b => b.prefixed === selectedBranch);

    const fetchDevices = useCallback(async () => {
        if (!selectedBranch) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/devices`, {
                params: { branch: selectedBranch },
                validateStatus: (status) => status >= 200 && status < 500
            });
            if (response && response.data && response.data.data) {
                setDevices(response.data.data);
                setError(null);
            } else {
                setDevices([]);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            setError('Không thể tải danh sách thiết bị.');
            setDevices([]);
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (selectedBranch) {
            fetchDevices();
        }
    }, [selectedBranch, fetchDevices]);

    const addDevice = async () => {
        if (!selectedBranch) {
            setError('Vui lòng chọn chi nhánh trước.');
            return;
        }
        
        if (!newDeviceName.trim()) {
            setError('Vui lòng nhập tên phòng.');
            return;
        }
        
        // Check for duplicate
        const duplicate = devices.find(d => d.name.toLowerCase() === newDeviceName.trim().toLowerCase());
        if (duplicate) {
            setError(`Phòng "${newDeviceName}" đã tồn tại trong chi nhánh này. Vui lòng chọn tên khác.`);
            return;
        }
        
        try {
            await axios.post(`${API_BASE_URL}/api/devices`, { 
                name: newDeviceName,
                branch: selectedBranch 
            });
            setNewDeviceName('');
            setError(null);
            setSuccess(`Thêm phòng "${newDeviceName}" thành công!`);
            setTimeout(() => setSuccess(null), 3000);
            fetchDevices();
        } catch (error) {
            console.error('Error adding device:', error);
            if (error.response?.status === 409) {
                setError(error.response.data.error);
            } else {
                setError('Không thể thêm phòng.');
            }
        }
    };

    const deleteDevice = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/devices/${id}`);
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
            await axios.put(`${API_BASE_URL}/api/devices/${id}`, { name: editingName });
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
        <Container maxWidth="lg" sx={{ 
            mt: 6, 
            mb: 6,
            px: { xs: 2, sm: 3 },
            '@media (max-width:600px)': {
                mt: 3,
                mb: 3,
            }
        }}>
            {/* Header Section */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    mb: { xs: 3, sm: 4, md: 5 },
                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: { xs: 3, md: 4 },
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Back Button */}
                <Button
                    component={Link}
                    to="/"
                    variant="outlined"
                    startIcon={<ArrowLeft size={20} style={{ width: 'clamp(16px, 4vw, 20px)', height: 'clamp(16px, 4vw, 20px)' }} />}
                    sx={{
                        mb: { xs: 2, sm: 3 },
                        borderWidth: 2,
                        cursor: 'pointer',
                        fontSize: { xs: '0.85rem', sm: '0.875rem', md: '1rem' },
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.75, sm: 1 },
                        '&:hover': {
                            borderWidth: 2,
                        },
                    }}
                >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Trở về trang quét QR</Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Trở về</Box>
                </Button>

                {/* Branch Info Header */}
                {selectedBranchInfo ? (
                    <Box sx={{ mb: { xs: 3, sm: 4 }, pb: { xs: 3, sm: 4 }, borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <Typography variant="h3" component="h1" gutterBottom sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        }}>
                            {selectedBranchInfo.name}
                        </Typography>
                        <Typography variant="body2" color="#22C55E" sx={{ 
                            mb: 2, 
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}>
                            Mã chi nhánh: {selectedBranchInfo.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}>
                            📍 {selectedBranchInfo.address}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ 
                            mb: 2,
                            fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                        }}>
                            Quản lý danh sách phòng
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}>
                            Thêm, chỉnh sửa hoặc xóa các phòng trong chi nhánh này
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Typography variant="h3" component="h1" gutterBottom sx={{ 
                            fontWeight: 700, 
                            mb: 2,
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        }}>
                            Quản lý danh sách phòng
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ 
                            mb: { xs: 3, sm: 4 },
                            fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                        }}>
                            Thêm, chỉnh sửa hoặc xóa các phòng trong hệ thống
                        </Typography>
                    </>
                )}

                {!selectedBranch && (
                    <Alert 
                        severity="info" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 }, 
                            borderRadius: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}
                    >
                        ⚠️ Vui lòng chọn chi nhánh từ trang quét QR để bắt đầu quản lý thiết bị.
                    </Alert>
                )}

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 }, 
                            borderRadius: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert 
                        severity="success" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 }, 
                            borderRadius: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        }}
                        onClose={() => setSuccess(null)}
                    >
                        {success}
                    </Alert>
                )}

                {/* Add Device Form */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
                    <TextField
                        fullWidth
                        disabled={!selectedBranch}
                        label="Tên phòng mới"
                        variant="outlined"
                        value={newDeviceName}
                        onChange={(e) => {
                            setNewDeviceName(e.target.value);
                            setError(null);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && addDevice()}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'rgba(30, 41, 59, 0.8)',
                                borderRadius: { xs: 2, sm: 3 },
                                height: { xs: 48, sm: 56 },
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
                                backgroundColor: '#1E293B',
                                padding: '0 8px',
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                '&.Mui-focused': {
                                    color: '#22C55E',
                                },
                            },
                        }}
                    />
                    <Button
                        onClick={addDevice}
                        disabled={!selectedBranch}
                        variant="contained"
                        color="primary"
                        startIcon={<Plus size={20} style={{ width: 'clamp(16px, 4vw, 20px)', height: 'clamp(16px, 4vw, 20px)' }} />}
                        sx={{
                            minWidth: { xs: '100%', sm: 180 },
                            height: { xs: 48, sm: 56 },
                            cursor: selectedBranch ? 'pointer' : 'not-allowed',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                    >
                        Thêm phòng
                    </Button>
                </Stack>
            </Paper>

            {/* Devices List by Floor */}
            {groupedFloors.map(({ label, items }) => (
                <Box key={label} mb={{ xs: 3, sm: 4, md: 5 }}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 1.5, sm: 2 },
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: 3, sm: 4 },
                                height: { xs: 24, sm: 32 },
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
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                height: { xs: 20, sm: 24 },
                            }}
                        />
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(auto-fill, minmax(160px, 1fr))',
                                sm: 'repeat(auto-fill, minmax(200px, 1fr))',
                                md: 'repeat(auto-fill, minmax(240px, 1fr))',
                                lg: 'repeat(auto-fill, minmax(260px, 1fr))',
                            },
                            gap: { xs: 2, sm: 2.5, md: 3 },
                        }}
                    >
                        {items.map((device) => (
                            <Paper
                                key={device.id}
                                sx={{
                                    p: { xs: 2, sm: 2.5 },
                                    bgcolor: '#1E293B',
                                    borderRadius: { xs: 2, sm: 3 },
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                                    transition: 'all 0.25s ease',
                                    cursor: editingId === device.id ? 'default' : 'pointer',
                                    '@media (max-width:600px)': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                    },
                                    '&:hover': {
                                        transform: editingId === device.id ? 'none' : 'translateY(-4px)',
                                        boxShadow: editingId === device.id 
                                            ? '0 4px 14px rgba(0, 0, 0, 0.25)'
                                            : '0 12px 28px rgba(0, 0, 0, 0.35)',
                                        borderColor: editingId === device.id 
                                            ? 'rgba(148, 163, 184, 0.1)'
                                            : 'rgba(34, 197, 94, 0.3)',
                                        '@media (max-width:600px)': {
                                            transform: editingId === device.id ? 'none' : 'translateY(-2px)',
                                            boxShadow: editingId === device.id 
                                                ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                                                : '0 8px 20px rgba(0, 0, 0, 0.3)',
                                        },
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
