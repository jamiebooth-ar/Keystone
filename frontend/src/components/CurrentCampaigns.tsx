import React, { useEffect, useState } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Box, Chip, CircularProgress, Alert, Card, CardContent,
    ToggleButtonGroup, ToggleButton
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../api';
import type { CampaignList } from '../types';

const CurrentCampaigns: React.FC = () => {
    const [data, setData] = useState<CampaignList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'Brand' | 'LeadGen' | 'Event'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching campaigns from API...');
                const response = await api.get<CampaignList>('/campaigns');
                console.log('Campaigns response:', response.data);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching campaigns:', err);
                const errorMsg = (err as any).response?.data?.detail || 'Failed to fetch campaigns. Please check your Meta API connection.';
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading campaigns from Meta...
            </Typography>
        </Box>
    );

    if (error) return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
        </Alert>
    );

    if (!data) return null;

    const allCampaigns = [...data.Brand, ...data.LeadGen];

    // Filter campaigns based on selection using campaign_type field
    const filteredCampaigns = filter === 'all'
        ? allCampaigns
        : allCampaigns.filter(c => {
            if (filter === 'Event') {
                // Use campaign_type field if available
                return c.campaign_type === 'Event';
            }
            if (filter === 'Brand') {
                return c.campaign_type === 'Brand';
            }
            if (filter === 'LeadGen') {
                return c.campaign_type === 'LeadGen';
            }
            return true;
        });

    // Evaluate campaign performance based on industry standards
    const evaluateCampaignPerformance = (campaign: any) => {
        const cpm = campaign.total_impressions > 0
            ? (campaign.total_spend / campaign.total_impressions) * 1000
            : 0;

        const issues: string[] = [];

        // High CPM threshold: > £12 (education avg: £8.19)
        if (cpm > 12) {
            issues.push('High CPM');
        }

        // Low impressions with significant spend: < 1,000 impressions with spend > £100
        if (campaign.total_impressions < 1000 && campaign.total_spend > 100) {
            issues.push('Low impressions');
        }

        // Spending without results: > £500 spend with 0 impressions
        if (campaign.total_spend > 500 && campaign.total_impressions === 0) {
            issues.push('No impressions');
        }

        return {
            isPoorPerformer: issues.length > 0,
            issues
        };
    };

    const activeCampaigns = filteredCampaigns.filter(c => c.effective_status === 'ACTIVE');
    const totalSpend = filteredCampaigns.reduce((acc, c) => acc + c.total_spend, 0);


    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Active Campaigns
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {activeCampaigns.length}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Spend
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#1AC284' }}>
                                £{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Total Impressions
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
                    size="small"
                    sx={{ gap: 1 }}
                >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="Brand">Brand</ToggleButton>
                    <ToggleButton value="LeadGen">Lead Gen</ToggleButton>
                    <ToggleButton value="Event">Event</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Campaign Name</TableCell>
                            <TableCell>Platform</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Brand</TableCell>
                            <TableCell align="right">Spend</TableCell>
                            <TableCell align="right">Impressions</TableCell>
                            <TableCell align="right">CPM</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCampaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No campaigns found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCampaigns.map((campaign) => {
                                // Evaluate campaign performance
                                const performance = evaluateCampaignPerformance(campaign);

                                const cpm = campaign.total_impressions > 0
                                    ? (campaign.total_spend / campaign.total_impressions) * 1000
                                    : 0;

                                let chipLabel = campaign.campaign_type || "Brand";
                                let chipColor: "primary" | "secondary" | "success" = "primary";

                                if (chipLabel === "Event") {
                                    chipColor = "success";
                                } else if (chipLabel === "LeadGen") {
                                    chipLabel = "Lead Gen";
                                    chipColor = "secondary";
                                }


                                // Brand chip colors: FAM = #1AC284, FAP = #0000FF, FAU = #7645FB
                                // Brand chip colors: FAM = #1AC284, FAP = #0000FF, FAU = #7645FB
                                let brandChipColor = "#7645FB"; // Default to FAU purple
                                let brandChipLabel = "FAU"; // Default to FAU if N/A or missing

                                if (campaign.brand === "FAM") {
                                    brandChipColor = "#1AC284"; // FindAMasters green
                                    brandChipLabel = "FAM";
                                } else if (campaign.brand === "FAP") {
                                    brandChipColor = "#0000FF"; // FindAPhD blue
                                    brandChipLabel = "FAP";
                                }
                                // If brand is N/A, null, undefined, or FAU, it stays as the default FAU


                                return (
                                    <TableRow
                                        key={campaign.id}
                                        hover
                                        sx={{
                                            bgcolor: performance.isPoorPerformer ? 'error.light' : 'inherit',
                                            '&:hover': {
                                                bgcolor: performance.isPoorPerformer ? 'error.main' : 'action.hover',
                                                opacity: performance.isPoorPerformer ? 0.9 : 1
                                            }
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {campaign.name}
                                                {performance.isPoorPerformer && (
                                                    <Chip
                                                        icon={<WarningIcon />}
                                                        label={performance.issues.join(', ')}
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={campaign.platform || "Meta"}
                                                size="small"
                                                sx={{
                                                    bgcolor: (campaign.platform === 'TikTok' ? '#000000' : campaign.platform === 'YouTube' ? '#FF0000' : '#0668E1'),
                                                    color: 'white',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={chipLabel}
                                                size="small"
                                                color={chipColor}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={brandChipLabel}
                                                size="small"
                                                sx={{
                                                    bgcolor: brandChipColor,
                                                    color: 'white',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            £{campaign.total_spend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {campaign.total_impressions.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">£{cpm.toFixed(2)}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {campaign.campaign_date || '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box >
    );
};

export default CurrentCampaigns;
