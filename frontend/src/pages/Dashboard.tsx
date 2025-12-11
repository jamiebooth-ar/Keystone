import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const Dashboard: React.FC = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                    Dashboard
                </Typography>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Welcome to the Ad Ops Dashboard.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default Dashboard;
