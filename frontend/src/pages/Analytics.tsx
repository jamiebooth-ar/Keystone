import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, CircularProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import api from '../api';
import type { BenchmarkAgg } from '../types';

const Analytics: React.FC = () => {
    const [benchmarks, setBenchmarks] = useState<BenchmarkAgg[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sitewide benchmarks for collection 1 (example)
                const res = await api.get<BenchmarkAgg[]>('/analytics/benchmarks/sitewide?collection_id=1');
                setBenchmarks(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom fontWeight={700}>
                    Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Sitewide Benchmarks (Collection 1)
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell align="right">Total Stats</TableCell>
                                <TableCell align="right">Aggregate Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {benchmarks.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(row.month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</TableCell>
                                    <TableCell align="right">{row.stat_total}</TableCell>
                                    <TableCell align="right">{row.aggregate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default Analytics;
