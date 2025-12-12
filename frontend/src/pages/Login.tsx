import React, { useState } from 'react';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        if (await login(email, password)) {
            navigate('/campaigns');
        } else {
            setError('Invalid credentials. Please try again.');
            setPassword('');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fafbfc',
                backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        bgcolor: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}
                >
                    <Box sx={{ p: 6 }}>
                        <Stack spacing={4} alignItems="center">
                            <Box
                                component="img"
                                src="/keystone-logo.png"
                                alt="Keystone"
                                sx={{
                                    height: 80,
                                    objectFit: 'contain',
                                }}
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </Stack>

                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3} sx={{ mt: 4 }}>
                                {error && (
                                    <Alert 
                                        severity="warning" 
                                        sx={{ 
                                            borderRadius: 2,
                                            bgcolor: '#fff9e6',
                                            border: '1px solid #ffe0a3',
                                            color: '#856404',
                                            '& .MuiAlert-icon': {
                                                color: '#ffa726'
                                            }
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                )}

                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Email Address"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                    autoComplete="email"
                                />

                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Password"
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        mt: 2,
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Stack>
                        </form>
                    </Box>
                </Card>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 3 }}
                >
                    © {new Date().getFullYear()} Keystone. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Login;
