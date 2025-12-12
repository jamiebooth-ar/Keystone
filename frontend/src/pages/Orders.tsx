import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    ToggleButtonGroup,
    ToggleButton,
    Button
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface HubSpotOrder {
    id: string;
    properties: {
        dealname?: string;
        createdate?: string;
        amount?: string;
        dealstage?: string;
        closedate?: string;
        pipeline?: string;
    };
}

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<HubSpotOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [sortBy, setSortBy] = useState<'amount' | 'created' | 'closedate' | 'age'>('created');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDeals, setTotalDeals] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, page]); // Refetch when filter or page changes

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Fetch with pagination
            const response = await fetch(`http://localhost:8000/deals?page=${page}&limit=50&status=${statusFilter}`);
            const data = await response.json();
            setOrders(data.results || []);
            setTotalPages(data.pagination?.pages || 1);
            setTotalDeals(data.pagination?.total || 0);
        } catch (err) {
            console.error('Error fetching deals:', err);
            const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(errorObj.response?.data?.detail || errorObj.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getDealAge = (createDate: string | undefined): number => {
        if (!createDate) return 0;
        const created = new Date(createDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - created.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDaysToClose = (createDate: string | undefined, closeDate: string | undefined): number | null => {
        if (!createDate || !closeDate) return null;
        const created = new Date(createDate);
        const closed = new Date(closeDate);
        const diffTime = Math.abs(closed.getTime() - created.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getRowBorderColor = (stage?: string): string => {
        if (!stage) return '#E0E0E0';
        const lowerStage = stage.toLowerCase();
        if (lowerStage === 'closedwon') return '#1AC284'; // Green
        if (lowerStage === 'closedlost') return '#F44336'; // Red
        return '#FFA726'; // Orange for in-progress
    };

    const handleSort = (column: 'amount' | 'created' | 'closedate' | 'age') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading deals from HubSpot CRM...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        const stage = order.properties.dealstage?.toLowerCase();
        if (statusFilter === 'paid') return stage === 'closedwon';
        if (statusFilter === 'pending') return stage && stage !== 'closedwon' && stage !== 'closedlost';
        if (statusFilter === 'overdue') return stage === 'closedlost';
        return true;
    }).sort((a, b) => {
        let aVal: any, bVal: any;

        if (sortBy === 'amount') {
            aVal = parseFloat(a.properties.amount || '0');
            bVal = parseFloat(b.properties.amount || '0');
        } else if (sortBy === 'created') {
            aVal = new Date(a.properties.createdate || 0).getTime();
            bVal = new Date(b.properties.createdate || 0).getTime();
        } else if (sortBy === 'closedate') {
            aVal = new Date(a.properties.closedate || 0).getTime();
            bVal = new Date(b.properties.closedate || 0).getTime();
        } else if (sortBy === 'age') {
            aVal = getDealAge(a.properties.createdate);
            bVal = getDealAge(b.properties.createdate);
        }

        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const totalRevenue = orders.reduce((sum, order) => {
        return sum + (parseFloat(order.properties.amount || '0'));
    }, 0);

    const paidOrders = orders.filter(o => o.properties.dealstage?.toLowerCase() === 'closedwon');
    const pendingOrders = orders.filter(o => {
        const stage = o.properties.dealstage?.toLowerCase();
        return stage && stage !== 'closedwon' && stage !== 'closedlost';
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (amount?: string) => {
        if (!amount) return '£0.00';
        return `£${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };



    return (
        <Container maxWidth="xl" sx={{ mt: 0.5, mb: 4 }}>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total Deals
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {orders.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total Revenue
                            </Typography>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#1AC284' }}>
                                {formatCurrency(totalRevenue.toString())}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Avg Deal Size
                            </Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {formatCurrency((totalRevenue / (orders.length || 1)).toString())}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Win Rate
                            </Typography>
                            <Typography variant="h5" fontWeight={700} color="success.main">
                                {orders.length > 0 ? ((paidOrders.length / orders.length) * 100).toFixed(1) : '0.0'}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Pending Value
                            </Typography>
                            <Typography variant="h5" fontWeight={700} color="warning.main">
                                {formatCurrency(pendingOrders.reduce((sum, o) => sum + parseFloat(o.properties.amount || '0'), 0).toString())}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    onChange={(_, newFilter) => newFilter && setStatusFilter(newFilter)}
                    size="small"
                >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="paid">Won</ToggleButton>
                    <ToggleButton value="pending">In Progress</ToggleButton>
                    <ToggleButton value="overdue">Lost</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Orders Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Deal Name</TableCell>
                            <TableCell
                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => handleSort('created')}
                            >
                                Created {sortBy === 'created' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell
                                align="right"
                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => handleSort('amount')}
                            >
                                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell
                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => handleSort('age')}
                            >
                                Deal Age {sortBy === 'age' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Days to Close</TableCell>
                            <TableCell
                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => handleSort('closedate')}
                            >
                                Close Date {sortBy === 'closedate' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No orders found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    hover
                                    sx={{
                                        borderLeft: `4px solid ${getRowBorderColor(order.properties.dealstage)}`,
                                        '&:hover': {
                                            borderLeft: `4px solid ${getRowBorderColor(order.properties.dealstage)}`,
                                        }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {order.properties.dealname || 'Unnamed Deal'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(order.properties.createdate)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1AC284' }}>
                                        {formatCurrency(order.properties.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {getDealAge(order.properties.createdate)} days
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {getDaysToClose(order.properties.createdate, order.properties.closedate) !== null ? (
                                            <Typography variant="body2" color="success.main" fontWeight={600}>
                                                {getDaysToClose(order.properties.createdate, order.properties.closedate)} days
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                -
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(order.properties.closedate)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Showing page {page} of {totalPages} ({totalDeals} total deals)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </Box>
            </Box>

            {/* HubSpot Attribution */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, opacity: 0.6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Data provided by
                </Typography>
                <Box
                    component="img"
                    src="https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png"
                    alt="HubSpot"
                    sx={{ height: 14, mr: 0.5 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    HubSpot
                </Typography>
            </Box>
        </Container>
    );
};

export default Orders;
