import React, { useState } from 'react';
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
    Stack
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SettingsIcon from '@mui/icons-material/Settings';
import AndroidIcon from '@mui/icons-material/Android';
import DeviceManagerPage from './DeviceManagerPage';
import './App.css';

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

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9', // Light blue for dark theme
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#121212',
            paper: 'rgba(18, 18, 18, 0.8)',
        },
    },
    shape: {
        borderRadius: 5,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
                    borderRadius: 5,
                    textTransform: 'none',
                    minHeight: 40,
                    padding: '6px 14px',
                },
                sizeSmall: {
                    minHeight: 34,
                    padding: '4px 10px',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    minHeight: 40,
                    outline: 'none',
                    '&:focus': { outline: 'none' },
                    '&:focus-visible': { outline: 'none' },
                    '&.Mui-focusVisible': { outline: 'none' },
                },
                rounded: {
                    borderRadius: 20,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly transparent white for cards
                    color: '#ffffff', // White text for card content
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: '#ffffff', // Default text color for dark theme
                },
            },
        },
    },
});

function ScannerPage() {
    const [onlineDevices, setOnlineDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const runScan = async (mode) => {
        setIsLoading(true);
        setError(null);
        setOnlineDevices([]);
        try {
            const endpoint = mode === 'network' ? '/scan/network' : '/scan/local';
            const response = await axios.get(`http://localhost:3001${endpoint}`);
            const filtered = (response.data || []).filter((d) => d && d.url);
            setOnlineDevices(filtered);
        } catch (err) {
            setError('Không thể thực hiện quét. Dịch vụ backend có đang chạy không?');
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    backdropFilter: 'none',
                }}
            >
                <Box textAlign="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Trình quét mã QR mạng
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Nhấn nút để quét mạng và tìm các thiết bị đã định cấu hình.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <QrCodeScannerIcon />}
                            onClick={() => runScan('local')}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang quét...' : 'Quét local'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            startIcon={<QrCodeScannerIcon />}
                            onClick={() => runScan('network')}
                            disabled={isLoading}
                            sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderWidth: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
                        >
                            Quét network
                        </Button>
                    </Stack>
                    {error && <Alert severity="error" sx={{ mt: 2, justifyContent: 'center' }}>{error}</Alert>}
                </Box>
            </Paper>

            <Grid container spacing={4} justifyContent="center">
                {onlineDevices.map((device) => (
                    <Grid item key={device.deviceId} xs={12} sm={6} md={4} lg={3}>
                        <Card elevation={3}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" component="div">
                                    Phòng {device.deviceId}
                                </Typography>
                                {device.type && (
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{ mt: 1, mb: 1, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 5, width: 36, height: 36 }}
                                        aria-label={device.type}
                                    >
                                        {device.type === 'windows11' ? (
                                            <Win11Icon />
                                        ) : device.type === 'android' ? (
                                            <AndroidIcon fontSize="small" />
                                        ) : null}
                                    </Box>
                                )}
                                <Box my={2} p={2} bgcolor="white" borderRadius={1} display="inline-block">
                                    <QRCodeSVG value={device.url} size={180} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {!isLoading && onlineDevices.length > 0 && (
                <Box textAlign="center" my={4}>
                    <Typography variant="h6">{`Tìm thấy ${onlineDevices.length} thiết bị trực tuyến.`}</Typography>
                </Box>
            )}
        </Container>
    );
}

function AppContent() {
    const location = useLocation();
    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url(/backgroud.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            color: 'white', // Ensure overall text is white against dark background
        }}>
            <AppBar
                position="static"
                color="transparent"
                elevation={0}
                sx={{ backgroundColor: 'transparent', boxShadow: 'none', backdropFilter: 'none' }}
            >
                <Toolbar sx={{ backgroundColor: 'transparent' }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {/* Title removed */}
                    </Typography>
                    {location.pathname === '/' && (
                        <Button
                            variant="contained" // Changed to contained for better visibility on transparent AppBar
                            color="primary"
                            component={Link}
                            to="/devices"
                            startIcon={<SettingsIcon />}
                            sx={{ fontSize: '1.1rem' }}
                        >
                            Quản lý thiết bị
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/" element={<ScannerPage />} />
                <Route path="/devices" element={<DeviceManagerPage />} />
            </Routes>
        </Box>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}

export default App;
