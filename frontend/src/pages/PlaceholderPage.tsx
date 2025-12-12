import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PlaceholderPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract page title from path (e.g. /fam -> FindAMasters)
    const getPageTitle = (path: string) => {
        const map: Record<string, string> = {
            '/fam': 'FindAMasters',
            '/fap': 'FindAPhD',
            '/finance': 'Finance Overview',
        };
        return map[path] || 'Coming Soon';
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h3" gutterBottom fontWeight={700} color="primary">
                    {getPageTitle(location.pathname)}
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    This page is currently under construction.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ mt: 2 }}
                >
                    Back to Dashboard
                </Button>
            </Box>
        </Container>
    );
};

export default PlaceholderPage;
