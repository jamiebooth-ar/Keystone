import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, CircularProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Tabs, Tab
} from '@mui/material';
import api from '../api';
import type { MarketingPopup, SplashBanner } from '../types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Marketing: React.FC = () => {
    const [value, setValue] = useState(0);
    const [popups, setPopups] = useState<MarketingPopup[]>([]);
    const [banners, setBanners] = useState<SplashBanner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [popRes, banRes] = await Promise.all([
                    api.get<MarketingPopup[]>('/marketing/popups/'),
                    api.get<SplashBanner[]>('/marketing/banners/')
                ]);
                setPopups(popRes.data);
                setBanners(banRes.data);
            } catch (err) {
                console.error("Failed to fetch marketing data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom fontWeight={700}>
                    Marketing
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage Popups and Banners
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
                    <Tab label="Popups" />
                    <Tab label="Splash Banners" />
                </Tabs>

                {/* Popups Tab */}
                <TabPanel value={value} index={0}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Targets</TableCell>
                                    <TableCell>Start Date</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {popups.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.title}</TableCell>
                                        <TableCell>
                                            {p.target_domains && <Chip size="small" label={p.target_domains} sx={{ mr: 1 }} />}
                                            {p.target_countries && <Chip size="small" label={p.target_countries} />}
                                        </TableCell>
                                        <TableCell>{p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Immediate'}</TableCell>
                                        <TableCell>
                                            <Chip label={p.is_active ? "Active" : "Inactive"} color={p.is_active ? "success" : "default"} size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Banners Tab */}
                <TabPanel value={value} index={1}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Weight</TableCell>
                                    <TableCell>Target URL</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {banners.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell>{b.name}</TableCell>
                                        <TableCell>{b.weight}</TableCell>
                                        <TableCell>{b.target_url}</TableCell>
                                        <TableCell>
                                            <Chip label={b.is_active ? "Active" : "Inactive"} color={b.is_active ? "success" : "default"} size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default Marketing;
