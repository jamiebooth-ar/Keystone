import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, CircularProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Chip
} from '@mui/material';
import api from '../api';
import type { Mailshot } from '../types';

const Emailer: React.FC = () => {
    const [mailshots, setMailshots] = useState<Mailshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get<Mailshot[]>('/email/mailshots/');
            setMailshots(res.data);
        } catch (err) {
            console.error("Failed to fetch mailshots", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (id: number) => {
        try {
            await api.post(`/email/mailshots/${id}/send`);
            alert("Sending background task started!");
            fetchData(); // Refresh to see state change
        } catch (err) {
            alert("Failed to trigger send");
        }
    }

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                        Bulk Emailer
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and send mass emails (Simulated)
                    </Typography>
                </Box>
                <Button variant="contained" color="primary">Create New</Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Sent</TableCell>
                                <TableCell align="right">Opened</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mailshots.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.title}</TableCell>
                                    <TableCell>{row.subject}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status}
                                            color={row.status === 'Sent' ? 'success' : row.status === 'Sending' ? 'warning' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">{row.total_sent}</TableCell>
                                    <TableCell align="right">{row.total_opened}</TableCell>
                                    <TableCell align="right">
                                        {row.status === 'Draft' && (
                                            <Button size="small" variant="outlined" onClick={() => handleSend(row.id)}>
                                                Send
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default Emailer;
