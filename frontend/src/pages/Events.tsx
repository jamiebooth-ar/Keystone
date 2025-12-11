import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, Chip, CircularProgress, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
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
                // Fetching from legacy stats endpoint with proper headers
                const response = await api.get<LegacyEventStats[]>('/events/stats/legacy');
                console.log('Legacy events response:', response.data);
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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom fontWeight={700}>
                    Event Performance Stats
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    External event signup data from legacy system
                </Typography>
            </Box>

            {!events || events.length === 0 ? (
                <Alert severity="info">
                    No event stats available from the legacy system.
                </Alert>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Venue</TableCell>
                                <TableCell>Audience</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Platform</TableCell>
                                <TableCell align="right">Signups</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((event) => {
                                // Brand chip colors: FAM = #1AC284, FAP = #0000FF, FAU = #7645FB
                                let brandChipColor = "#7645FB"; // Default to FAU purple

                                if (event.brand === "FAM") {
                                    brandChipColor = "#1AC284"; // FindAMasters green
                                } else if (event.brand === "FAP") {
                                    brandChipColor = "#0000FF"; // FindAPhD blue
                                }

                                return (
                                    <TableRow key={event.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                        <TableCell>{event.product || '-'}</TableCell>
                                        <TableCell>{event.venue || '-'}</TableCell>
                                        <TableCell>{event.audience || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.brand || 'N/A'}
                                                size="small"
                                                sx={{
                                                    bgcolor: brandChipColor,
                                                    color: 'white',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.platform || 'Unknown'}
                                                size="small"
                                                sx={{
                                                    bgcolor: (event.platform === 'TikTok' ? '#000000' : event.platform === 'YouTube' ? '#FF0000' : '#0668E1'),
                                                    color: 'white',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600}>
                                                {event.signups}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {event.date || '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default Events;
