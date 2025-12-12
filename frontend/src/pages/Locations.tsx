import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, CircularProgress, Alert, Paper,
    List, ListItem, ListItemButton, ListItemText, ListItemIcon, Collapse
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PublicIcon from '@mui/icons-material/Public'; // Earth
import FlagIcon from '@mui/icons-material/Flag'; // Country
import LocationCityIcon from '@mui/icons-material/LocationCity'; // City
import api from '../api';
import type { GeoLocation } from '../types';

// Recursive Tree Item Component
const LocationItem: React.FC<{ location: GeoLocation; level: number }> = ({ location, level }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = location.children && location.children.length > 0;

    const handleClick = () => {
        setOpen(!open);
    };

    const getIcon = (typeId: number) => {
        if (typeId === 0) return <PublicIcon color="primary" />;
        if (typeId === 3) return <FlagIcon color="secondary" />;
        if (typeId === 6) return <LocationCityIcon color="action" />;
        return <PublicIcon />;
    };

    return (
        <>
            <ListItem disablePadding sx={{ borderBottom: '1px solid #f0f0f0' }}>
                <ListItemButton onClick={handleClick} sx={{ pl: level * 4 }}>
                    <ListItemIcon>
                        {getIcon(location.location_type_id)}
                    </ListItemIcon>
                    <ListItemText
                        primary={location.friendly_name || location.name}
                        secondary={location.location_code ? `Code: ${location.location_code}` : null}
                    />
                    {hasChildren ? (open ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>
            </ListItem>
            {hasChildren && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {location.children!.map((child) => (
                            <LocationItem key={child.id} location={child} level={level + 1} />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const Locations: React.FC = () => {
    const [locations, setLocations] = useState<GeoLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true);
                const response = await api.get<GeoLocation[]>('/locations/');
                // Simple flat list to tree logic (assuming API returns flat list sorted or we process it)
                // For now, we might receive just a flat list. Let's rely on basic list if tree construction is complex on client without data.
                // NOTE: A real implementation would convert flat list to tree structure here.
                setLocations(response.data);
            } catch (err) {
                console.error('Error fetching locations:', err);
                setError('Failed to load locations. (Make sure backend is running)');
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom fontWeight={700}>
                    Location Hierarchy
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View global location database (Read Only)
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <List>
                    {locations.length === 0 ? (
                        <ListItem><ListItemText primary="No locations found." /></ListItem>
                    ) : (
                        // If API returns flat, we just list them. Ideally we construct a tree.
                        locations.map((loc) => (
                            <LocationItem key={loc.id} location={loc} level={0} />
                        ))
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default Locations;
