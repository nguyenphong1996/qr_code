import React, { useState } from 'react';
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
    Alert
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import './App.css';

// Create a custom theme
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2', // Changed button color
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#e0e0e0',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h4: {
            fontWeight: 700,
            color: '#ffffff',
        },
        body1: {
            color: '#e0e0e0',
        },
    },
});

function App() {
    const [onlineDevices, setOnlineDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleScan = async () => {
        setIsLoading(true);
        setError(null);
        setOnlineDevices([]);
        try {
            const response = await axios.get('/scan');
            setOnlineDevices(response.data);
        } catch (err) {
            setError('Không thể thực hiện quét. Dịch vụ backend có đang chạy không?');
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url(/backgroud.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: -1,
            }} />
            <Container maxWidth="lg">
                <Box textAlign="center" my={4}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                        Trình quét mã QR mạng
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                        Nhấn nút để quét mạng và tìm các thiết bị được chỉ định.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <QrCodeScannerIcon />}
                        onClick={handleScan}
                        disabled={isLoading}
                        sx={{ mt: 2 }}
                    >
                        {isLoading ? 'Đang quét...' : 'Quét mạng'}
                    </Button>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {onlineDevices.map((device) => (
                        <Grid item key={device.ip} xs={12} sm={6} md={4} lg={3}>
                            <Card sx={{
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } 
                            }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" component="div" color="text.primary">
                                        Phòng {device.deviceId}
                                    </Typography>
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
                        <Typography variant="body1">{`Tìm thấy ${onlineDevices.length} thiết bị trực tuyến.`}</Typography>
                    </Box>
                )}
            </Container>
        </ThemeProvider>
    );
}

export default App;
