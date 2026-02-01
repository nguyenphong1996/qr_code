import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import {
    Container,
    Typography,
    Button,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Box,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Alert,
    AppBar,
    Toolbar,
    Paper,
    Stack,
    TextField,
    MenuItem
} from '@mui/material';
import { QrCode, Settings, Wifi, Smartphone, Monitor, Building2 } from 'lucide-react';
import DeviceManagerPage from './DeviceManagerPage';
import './App.css';

// Soft UI Evolution Theme - Professional Design System
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#22C55E', // Green CTA - Modern & Tech
            light: '#4ADE80',
            dark: '#16A34A',
        },
        secondary: {
            main: '#334155', // Slate secondary
            light: '#475569',
            dark: '#1E293B',
        },
        background: {
            default: '#0F172A', // Deep dark background
            paper: '#1E293B', // Elevated surface
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#CBD5E1',
        },
    },
    typography: {
        fontFamily: '"Fira Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 700, fontFamily: '"Fira Sans", sans-serif' },
        h2: { fontWeight: 700, fontFamily: '"Fira Sans", sans-serif' },
        h3: { fontWeight: 600, fontFamily: '"Fira Sans", sans-serif' },
        h4: { fontWeight: 600, fontFamily: '"Fira Sans", sans-serif' },
        h5: { fontWeight: 600, fontFamily: '"Fira Sans", sans-serif' },
        h6: { fontWeight: 600, fontFamily: '"Fira Sans", sans-serif' },
        code: { fontFamily: '"Fira Code", monospace' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.25)',
                    borderRadius: 12,
                    textTransform: 'none',
                    minHeight: 44,
                    padding: '10px 24px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.35)',
                    },
                },
                sizeSmall: {
                    minHeight: 36,
                    padding: '6px 16px',
                },
                sizeLarge: {
                    minHeight: 52,
                    padding: '14px 32px',
                    fontSize: '1.1rem',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1E293B',
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 24,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                },
            },
        },
    },
});

function ScannerPage({ branches, selectedBranch, onBranchChange }) {
    const [onlineDevices, setOnlineDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Tìm thông tin chi nhánh được chọn
    const selectedBranchInfo = branches.find(b => b.prefixed === selectedBranch);

    const runScan = async (mode) => {
        if (!selectedBranch) {
            setError('Vui lòng chọn chi nhánh trước khi quét.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setOnlineDevices([]);
        try {
            const endpoint = mode === 'network' ? '/scan/network' : '/scan/local';
            const response = await axios.get(`http://localhost:3001${endpoint}`, {
                params: { branch: selectedBranch }
            });
            const filtered = (response.data || []).filter((d) => d && d.url);
            // Sắp xếp theo deviceId tăng dần
            const sorted = filtered.sort((a, b) => {
                const idA = parseInt(a.deviceId) || 0;
                const idB = parseInt(b.deviceId) || 0;
                return idA - idB;
            });
            setOnlineDevices(sorted);
        } catch (err) {
            setError('Không thể thực hiện quét. Dịch vụ backend có đang chạy không?');
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 6,
                    mb: 6,
                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                <Box textAlign="center">
                    {/* Icon Header */}
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '20px',
                            bgcolor: 'rgba(34, 197, 94, 0.1)',
                            border: '2px solid rgba(34, 197, 94, 0.3)',
                            mb: 3,
                        }}
                    >
                        <QrCode size={40} color="#22C55E" strokeWidth={2} />
                    </Box>

                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        {selectedBranchInfo ? `${selectedBranchInfo.name}` : 'Quét mã QR chi nhánh'}
                    </Typography>
                    {selectedBranchInfo && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {selectedBranchInfo.address}
                        </Typography>
                    )}
                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{ maxWidth: 600, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
                        {selectedBranchInfo ? 'Quét mạng để tìm các thiết bị' : 'Chọn chi nhánh và quét mạng để tìm các thiết bị đã đăng ký'}
                    </Typography>

                    {/* Branch Selection */}
                    <Box sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={selectedBranch}
                            onChange={(e) => onBranchChange(e.target.value)}
                            placeholder="Chọn chi nhánh"
                            InputProps={{
                                startAdornment: (
                                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                        <Building2 size={18} color="#22C55E" />
                                    </Box>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                                    borderRadius: 2.5,
                                    height: 48,
                                    transition: 'all 0.2s ease',
                                    '& fieldset': {
                                        borderColor: 'rgba(34, 197, 94, 0.2)',
                                        borderWidth: 1.5,
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(15, 23, 42, 0.8)',
                                        transform: 'translateY(-1px)',
                                        '& fieldset': {
                                            borderColor: 'rgba(34, 197, 94, 0.4)',
                                        },
                                    },
                                    '&.Mui-focused': {
                                        bgcolor: 'rgba(15, 23, 42, 0.9)',
                                        boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
                                        '& fieldset': {
                                            borderColor: '#22C55E',
                                            borderWidth: 2,
                                        },
                                    },
                                },
                                '& .MuiSelect-select': {
                                    py: 1.5,
                                    pl: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    color: selectedBranch ? '#F8FAFC' : 'rgba(203, 213, 225, 0.5)',
                                },
                                '& .MuiSelect-icon': {
                                    color: '#22C55E',
                                },
                            }}
                        >
                            <MenuItem value="" disabled sx={{ 
                                fontSize: '0.9rem',
                                fontStyle: 'italic',
                                color: 'rgba(203, 213, 225, 0.5)',
                            }}>
                                Chọn chi nhánh...
                            </MenuItem>
                            {branches.map((branch) => (
                                <MenuItem 
                                    key={branch.code} 
                                    value={branch.prefixed}
                                    sx={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        py: 1.5,
                                        '&:hover': {
                                            bgcolor: 'rgba(34, 197, 94, 0.1)',
                                        },
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(34, 197, 94, 0.15)',
                                            '&:hover': {
                                                bgcolor: 'rgba(34, 197, 94, 0.2)',
                                            },
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: '#22C55E',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {branch.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', ml: 3 }}>
                                            {branch.address}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    
                    {/* CTA Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Wifi size={20} />}
                            onClick={() => runScan('network')}
                            disabled={isLoading}
                            sx={{
                                px: 5,
                                py: 1.5,
                                cursor: 'pointer',
                                fontSize: '1.05rem',
                                fontWeight: 600,
                                minWidth: 200,
                                '&:disabled': {
                                    cursor: 'not-allowed',
                                },
                            }}
                        >
                            {isLoading ? 'Đang quét...' : 'Quét Network'}
                        </Button>
                    </Box>
                    
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mt: 4, 
                                maxWidth: 600, 
                                mx: 'auto',
                                borderRadius: 3,
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                </Box>
            </Paper>

            {/* Results Grid */}
            <Grid container spacing={5} justifyContent="center">
                {onlineDevices.map((device) => (
                    <Grid item key={device.deviceId} xs={12} sm={6} md={4} lg={3}>
                        <Card 
                            elevation={0}
                            sx={{
                                cursor: 'default',
                                height: '100%',
                                bgcolor: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                                    borderColor: 'rgba(34, 197, 94, 0.4)',
                                },
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: 2.5 }}>
                                {/* Device Header */}
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                        {device.deviceId}
                                    </Typography>
                                    {device.type && (
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 1,
                                                py: 0.25,
                                                bgcolor: device.type === 'windows11' 
                                                    ? 'rgba(34, 197, 94, 0.15)' 
                                                    : 'rgba(59, 130, 246, 0.15)',
                                                borderRadius: 1,
                                                border: `1px solid ${device.type === 'windows11' 
                                                    ? 'rgba(34, 197, 94, 0.3)' 
                                                    : 'rgba(59, 130, 246, 0.3)'}`,
                                            }}
                                        >
                                            {device.type === 'windows11' ? (
                                                <Monitor size={14} color="#22C55E" />
                                            ) : (
                                                <Smartphone size={14} color="#3B82F6" />
                                            )}
                                        </Box>
                                    )}
                                </Stack>

                                {/* QR Code */}
                                <Box 
                                    sx={{ 
                                        p: 2, 
                                        bgcolor: 'white', 
                                        borderRadius: 2,
                                        display: 'inline-block',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                    }}
                                >
                                    <QRCodeSVG value={device.url} size={140} level="H" />
                                </Box>

                                {/* Resolved Link */}
                                {device.url && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography 
                                            component="a"
                                            href={device.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="caption" 
                                            sx={{ 
                                                fontSize: '0.75rem',
                                                color: '#22C55E',
                                                wordBreak: 'break-all',
                                                display: 'block',
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'normal',
                                                textDecoration: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    color: '#4ADE80',
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            {device.url}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            {/* Results Summary */}
            {!isLoading && onlineDevices.length > 0 && (
                <Box 
                    textAlign="center" 
                    sx={{ 
                        mt: 6,
                        p: 3,
                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: 3,
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#22C55E' }}>
                        ✔ Tìm thấy {onlineDevices.length} thiết bị trực tuyến
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

function AppContent({ branches, selectedBranch, onBranchChange }) {
    const location = useLocation();
    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
            },
        }}>
            {/* Floating Navbar */}
            <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        top: 16,
                        bgcolor: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, justifyContent: 'center', position: 'relative' }}>
                        {/* Logo - Centered */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                }}
                            >
                                <QrCode size={24} color="#22C55E" />
                            </Box>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                                QR Manager
                            </Typography>
                        </Box>
                        
                        {/* Button - Absolute positioned to right */}
                        {location.pathname === '/' && (
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to="/devices"
                                startIcon={<Settings size={20} />}
                                sx={{ 
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    right: 16,
                                }}
                            >
                                Quản lý thiết bị
                            </Button>
                        )}
                    </Toolbar>
                </AppBar>
            </Box>
            <Routes>
                <Route path="/" element={<ScannerPage branches={branches} selectedBranch={selectedBranch} onBranchChange={onBranchChange} />} />
                <Route path="/devices" element={<DeviceManagerPage selectedBranch={selectedBranch} branches={branches} />} />
            </Routes>
        </Box>
    );
}

function App() {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/branches');
            setBranches(response.data.data || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppContent 
                    branches={branches} 
                    selectedBranch={selectedBranch} 
                    onBranchChange={setSelectedBranch}
                />
            </Router>
        </ThemeProvider>
    );
}

export default App;
