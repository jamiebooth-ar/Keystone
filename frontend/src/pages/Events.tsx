import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../api';
import type { LegacyEventStats } from '../types';

const Events: React.FC = () => {
    const [events, setEvents] = useState<LegacyEventStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // Fetching from new CMS4 endpoint which proxies legacy stats
                const response = await api.get<LegacyEventStats[]>('/events/stats/legacy');
                setEvents(response.data);
            } catch (err) {
                console.error('Error fetching events:', err);
                const error = err as { response?: { data?: { detail?: string } }; message?: string };
                const msg = error.response?.data?.detail || error.message || 'Failed to load events';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleDownloadPdf = (eventName: string) => {
        // Placeholder for PDF download action
        console.log(`Downloading PDF for ${eventName}`);
        alert(`Downloading PDF Breakdown for ${eventName}...`);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ mt: 2, mb: 4 }}>
                {/* Title removed as requested */}

                <Grid container spacing={3} alignItems="stretch">
                    {events.map((event) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={event.id || Math.random()} sx={{ display: 'flex' }}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* Placeholder Image */}
                                <Box
                                    sx={{
                                        height: 140,
                                        bgcolor: 'grey.300',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'text.secondary'
                                    }}
                                >
                                    <Typography variant="caption">Venue Placeholder</Typography>
                                </Box>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6" fontWeight={600} component="div" sx={{ lineHeight: 1.2 }}>
                                            {event.venue}
                                        </Typography>
                                        <Chip
                                            label={event.brand || 'FAU'}
                                            size="small"
                                            color={event.brand === 'FAM' ? 'primary' : event.brand === 'FAP' ? 'secondary' : 'default'}
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            <strong>Product:</strong> {event.product}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            <strong>Audience:</strong> {event.audience}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            <strong>Date:</strong> {event.date}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Signups:</strong> {event.signups}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<PictureAsPdfIcon />}
                                        fullWidth
                                        onClick={() => handleDownloadPdf(event.venue)}
                                        sx={{ mt: 'auto' }}
                                    >
                                        PDF Stats
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default Events;
