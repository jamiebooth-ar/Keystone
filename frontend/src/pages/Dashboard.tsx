import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Chip, IconButton, Collapse, Button, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdOpsModal from '../components/AdOpsModal';
import DatabaseQueryAgent from '../components/DatabaseQueryAgent';
import api from '../api';

interface FlaggedCampaign {
    id: string;
    name: string;
    issues: string[];
    spend: number;
    impressions: number;
    cpm: number;
}

const Dashboard: React.FC = () => {
    const [agentStatuses, setAgentStatuses] = useState<Record<number, string>>({
        1: 'Offline',
        2: 'Idle',
        3: 'Idle',
        4: 'Idle',
        5: 'Idle',
        6: 'Idle',
        7: 'Idle'
    });

    const [expandedAgent, setExpandedAgent] = useState<number | null>(null);
    const [adOpsModalOpen, setAdOpsModalOpen] = useState(false);
    const [dbQueryModalOpen, setDbQueryModalOpen] = useState(false);
    const [flaggedCampaigns, setFlaggedCampaigns] = useState<FlaggedCampaign[]>([]);

    const agents = [
        {
            id: 1,
            name: 'Database Query Agent',
            category: 'Support Agents',
            icon: QuestionAnswerIcon,
            description: 'Natural language database queries for sales and support teams',
            details: 'Scans the FAU database estate (CMS & WYSIWYG) to find answers. Enter university names for cross-product stats. Please be patient as databases are large.',
            width: '48%',
            color: '#6366f1' // Indigo
        },
        {
            id: 2,
            name: 'Ad Ops Operative',
            category: 'Operations Agents',
            icon: AssessmentIcon,
            description: 'Analyses campaign performance across Meta, YouTube, and TikTok',
            details: 'Automatically flags campaigns with High CPM (>£12), Low impressions (<1,000 with >£100 spend), or No impressions (>£500 with 0 impressions). Industry benchmarks based on education sector averages.',
            width: '48%',
            color: '#8b5cf6' // Purple
        },
        {
            id: 3,
            name: 'Client Services',
            category: 'Operations',
            icon: SupportAgentIcon,
            description: 'Assists with client delivery workflows',
            details: 'Helps manage client delivery processes, tracks deliverables, and automates routine client communications. Scope currently under development.',
            width: '31%',
            color: '#ec4899' // Pink
        },
        {
            id: 4,
            name: 'Order Analyser',
            category: 'Operations',
            icon: ReceiptLongIcon,
            description: 'Analyses order patterns and metrics',
            details: 'Tracks order trends, identifies patterns in purchasing behavior, and provides insights into revenue optimization opportunities.',
            width: '31%',
            color: '#06b6d4' // Cyan
        },
        {
            id: 5,
            name: 'Content Generator',
            category: 'Marketing',
            icon: AssessmentIcon,
            description: 'AI-powered content creation and optimization',
            details: 'Generates marketing copy, email templates, and content suggestions based on brand guidelines and performance data. Coming soon.',
            width: '31%',
            color: '#f59e0b' // Amber
        },
        {
            id: 6,
            name: 'Revenue Optimizer',
            category: 'Finance',
            icon: QuestionAnswerIcon,
            description: 'Identifies revenue optimization opportunities',
            details: 'Analyzes pricing strategies, upsell opportunities, and revenue trends to maximize profitability. Coming soon.',
            width: '48%',
            color: '#10b981' // Green
        },
        {
            id: 7,
            name: 'Compliance Monitor',
            category: ' Operations',
            icon: SupportAgentIcon,
            description: 'Ensures regulatory compliance across operations',
            details: 'Monitors data privacy, advertising compliance, and industry regulations. Provides alerts and recommendations. Coming soon.',
            width: '48%',
            color: '#f43f5e' // Rose
        }
    ];

    const handleRunAgent = async (agentId: number) => {
        const currentStatus = agentStatuses[agentId];

        if (currentStatus === 'Active') {
            setAgentStatuses(prev => ({ ...prev, [agentId]: 'Idle' }));
            return;
        }

        setAgentStatuses(prev => ({ ...prev, [agentId]: 'Active' }));

        // Database Query Agent - open chat modal
        if (agentId === 1) {
            setDbQueryModalOpen(true);
            return;
        }

        // Ad Ops Operative - show flagged campaigns
        if (agentId === 2) {
            try {
                const response = await api.get('/campaigns');
                const allCampaigns = [...response.data.Brand, ...response.data.LeadGen];

                const flagged = allCampaigns.filter(campaign => {
                    const cpm = campaign.total_impressions > 0
                        ? (campaign.total_spend / campaign.total_impressions) * 1000
                        : 0;

                    const issues: string[] = [];
                    if (cpm > 12) issues.push('High CPM');
                    if (campaign.total_impressions < 1000 && campaign.total_spend > 100) issues.push('Low impressions');
                    if (campaign.total_spend > 500 && campaign.total_impressions === 0) issues.push('No impressions');

                    return issues.length > 0;
                }).map(campaign => {
                    const cpm = campaign.total_impressions > 0
                        ? (campaign.total_spend / campaign.total_impressions) * 1000
                        : 0;

                    const issues: string[] = [];
                    if (cpm > 12) issues.push('High CPM');
                    if (campaign.total_impressions < 1000 && campaign.total_spend > 100) issues.push('Low impressions');
                    if (campaign.total_spend > 500 && campaign.total_impressions === 0) issues.push('No impressions');

                    return {
                        id: campaign.id,
                        name: campaign.name,
                        issues,
                        spend: campaign.total_spend,
                        impressions: campaign.total_impressions,
                        cpm
                    };
                });

                setFlaggedCampaigns(flagged);
                setAdOpsModalOpen(true);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'success';
            case 'idle': return 'warning';
            case 'offline': return 'error';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 0.5, mb: 0 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h4" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 500, letterSpacing: '-0.02em' }}>
                    <SmartToyIcon fontSize="large" color="primary" /> Automated Agents
                </Typography>
                <Tooltip title="Overview of AI Agents and status across FAU" arrow placement="right">
                    <InfoOutlinedIcon sx={{ fontSize: 16, cursor: 'help', opacity: 0.6, color: 'text.secondary' }} />
                </Tooltip>
            </Box>

            {/* Agent cards */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {agents.map((agent) => {
                    const status = agentStatuses[agent.id];
                    const isExpanded = expandedAgent === agent.id;

                    return (
                        <Box
                            key={agent.id}
                            sx={{
                                width: { xs: '100%', sm: agent.width },
                                minWidth: { xs: '100%', sm: '300px' }
                            }}
                        >
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: isExpanded ? agent.color : 'grey.200',
                                    boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        borderColor: agent.color,
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '5px',
                                        bgcolor: agent.color,
                                        borderRadius: '2px 0 0 2px'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 2.5, pl: 3 }}>
                                    <Box
                                        sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                                        onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                                    >
                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                background: `linear-gradient(135deg, ${agent.color}15 0%, ${agent.color}05 100%)`,
                                                p: 1.5,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid',
                                                borderColor: `${agent.color}30`
                                            }}
                                        >
                                            <agent.icon sx={{ fontSize: 32, color: agent.color }} />
                                        </Box>

                                        {/* Content */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={600}
                                                    sx={{
                                                        lineHeight: 1.2,
                                                        fontSize: '1rem',
                                                        color: 'text.primary',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {agent.name}
                                                </Typography>
                                                <Chip
                                                    label={status}
                                                    color={getStatusColor(status) as 'success' | 'warning' | 'error' | 'default'}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    lineHeight: 1.4,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    mb: 0.25
                                                }}
                                            >
                                                {agent.description}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    opacity: 0.7
                                                }}
                                            >
                                                Last run: {status === 'Active' ? 'Just now' : 'Never'}
                                            </Typography>
                                        </Box>

                                        {/* Expand icon */}
                                        <IconButton
                                            size="small"
                                            sx={{
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s'
                                            }}
                                        >
                                            <ExpandMoreIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Expanded details */}
                                    <Collapse in={isExpanded}>
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                                {agent.details}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={status === 'Active' ? <StopIcon /> : <PlayArrowIcon />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRunAgent(agent.id);
                                                }}
                                                sx={{
                                                    bgcolor: status === 'Active' ? '#10b981' : agent.color,
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    py: 1,
                                                    '&:hover': {
                                                        bgcolor: status === 'Active' ? '#059669' : agent.color,
                                                        opacity: 0.9
                                                    }
                                                }}
                                            >
                                                {status === 'Active' ? 'Running' : 'Run Agent'}
                                            </Button>
                                        </Box>
                                    </Collapse>
                                </CardContent>
                            </Card>
                        </Box>
                    );
                })}
            </Box>

            <AdOpsModal
                open={adOpsModalOpen}
                onClose={() => setAdOpsModalOpen(false)}
                flaggedCampaigns={flaggedCampaigns}
            />

            <DatabaseQueryAgent
                open={dbQueryModalOpen}
                onClose={() => setDbQueryModalOpen(false)}
            />
        </Container>
    );
};

export default Dashboard;
