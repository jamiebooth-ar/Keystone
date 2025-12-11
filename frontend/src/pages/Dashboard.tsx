import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Chip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';

const Dashboard: React.FC = () => {
    // Placeholder agent data - will be replaced with real data when AI agents are implemented
    const agents = [
        {
            id: 1,
            name: 'Campaign Optimizer',
            status: 'idle',
            lastRun: '2 hours ago',
            icon: TrendingUpIcon,
            description: 'Monitors and optimizes campaign performance'
        },
        {
            id: 2,
            name: 'Budget Manager',
            status: 'idle',
            lastRun: '5 hours ago',
            icon: AccountBalanceWalletIcon,
            description: 'Manages budget allocation and pacing'
        },
        {
            id: 3,
            name: 'Audience Analyzer',
            status: 'idle',
            lastRun: '1 day ago',
            icon: PeopleIcon,
            description: 'Analyzes audience performance and targeting'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'success';
            case 'paused': return 'warning';
            case 'idle': return 'default';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmartToyIcon /> Automated Agents
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        AI-powered automation agents for campaign management
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {agents.map((agent) => {
                        const IconComponent = agent.icon;
                        return (
                            <Grid item xs={12} md={4} key={agent.id}>
                                <Card 
                                    sx={{ 
                                        height: '100%',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': { 
                                            transform: 'translateY(-4px)', 
                                            boxShadow: 4 
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ 
                                                bgcolor: 'primary.main', 
                                                color: 'white', 
                                                p: 1.5, 
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <IconComponent />
                                            </Box>
                                            <Chip 
                                                label={agent.status.toUpperCase()} 
                                                size="small" 
                                                color={getStatusColor(agent.status) as any}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                            {agent.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {agent.description}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Last run: {agent.lastRun}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Container>
    );
};

export default Dashboard;
