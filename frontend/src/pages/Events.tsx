import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, Grid, Card, CardContent, CardMedia,
    Chip, CircularProgress, Alert, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';
import type { ManagedEvent } from '../types';

const Events: React.FC = () => {
    const [events, setEvents] = useState<ManagedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // Fetching from new CMS4 endpoint
                const response = await api.get<ManagedEvent[]>('/events/');
                setEvents(response.data);
            } catch (err) {
                console.error('Error fetching events:', err);
                const msg = (err as any).response?.data?.detail || (err as any).message || 'Failed to load events';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleCreateEvent = async () => {
        // Placeholder for Create Action
        alert("Create Event Modal will open here.");
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Alert severity="error">{error}</Alert>
        </Container>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" color="primary" gutterBottom fontWeight={700}>
                        Events
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your upcoming events
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateEvent}
                    sx={{ borderRadius: 2 }}
                >
                    Create Event
                </Button>
            </Box>

            {!events || events.length === 0 ? (
                <Alert severity="info" action={
                    <Button color="inherit" size="small" onClick={handleCreateEvent}>
                        Create One
                    </Button>
                }>
                    No events found in the system.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {events.map((event) => {
                        // Adapter logic for UI
                        const displayDate = new Date(event.start_date || Date.now()).toLocaleDateString();
                        const displayCity = event.city || "Online";

                        const placeholderUrl = `https://placehold.co/600x400/7645FB/FFFFFF?text=${encodeURIComponent(displayCity)}`;

                        return (
                            // @ts-expect-error: Grid item prop missing in types
                            <Grid key={event.id} item xs={12} sm={6} md={4} lg={3}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                }}>
                                    <div style={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={placeholderUrl}
                                            alt={event.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <Chip
                                            label={event.status_id === 1 ? 'Active' : 'Inactive'}
                                            size="small"
                                            color={event.status_id === 1 ? 'success' : 'default'}
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </div>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="overline" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
                                            {displayDate}
                                        </Typography>
                                        <Typography gutterBottom variant="h6" component="div" sx={{ mt: 1, lineHeight: 1.2 }}>
                                            {event.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {event.location_building}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                            <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                                                {displayCity}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
};

export default Events;
