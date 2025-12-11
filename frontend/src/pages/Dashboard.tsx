import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Chip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import ExtensionIcon from '@mui/icons-material/Extension';

const Dashboard: React.FC = () => {
    // Placeholder agent data - will be replaced with real data when AI agents are implemented
    const agents = [
        {
            id: 1,
            name: 'Campaign Optimizer',
            category: 'Delivery Agents',
            status: 'idle',
            lastRun: '2 hours ago',
            icon: TrendingUpIcon,
            description: 'Monitors and optimizes campaign performance'
        },
        {
            id: 2,
            name: 'Budget Manager',
            category: 'Delivery Agents',
            status: 'idle',
            lastRun: '5 hours ago',
            icon: AccountBalanceWalletIcon,
            description: 'Manages budget allocation and pacing'
        },
        {
            id: 3,
            name: 'Audience Analyser',
            category: 'Marketing Agents',
            status: 'idle',
            lastRun: '1 day ago',
            icon: PeopleIcon,
            description: 'Analyses audience performance and targeting'
        },
        {
            id: 4,
            name: 'Strategy Simulator',
            category: 'Value Creation Agents',
            status: 'idle',
            lastRun: 'Never',
            icon: ExtensionIcon,
            description: 'Simulates business strategies for impact analysis'
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
        <Container maxWidth="xl" sx={{ mt: 0.5, mb: 4 }}>
            {/* Header Section */}
            // ... (Header - same)

            <Grid container spacing={3}>
                {agents.map((agent) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <agent.icon color="primary" />
                                        <Box>
                                            <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
                                                {agent.name}
                                            </Typography>
                                            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                                {agent.category}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={agent.status}
                                        color={getStatusColor(agent.status) as any}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                                    {agent.description}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Last run: {agent.lastRun}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard;
