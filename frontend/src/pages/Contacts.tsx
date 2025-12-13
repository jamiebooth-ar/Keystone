import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Chip,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Button,
    Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    jobTitle: string;
}

const Contacts: React.FC = () => {
    const [rows, setRows] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'with_email' | 'with_phone'>('all');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(100);
    // Calculated total pages
    const totalPages = Math.ceil(rowCount / pageSize) || 1;

    // Summary stats
    const [stats, setStats] = useState({
        withEmail: 0,
        withPhone: 0,
        withCompany: 0
    });

    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Backend API uses 0-based index for "page" parameter usually, or strict page number
                // Orders uses strict page number. Let's assume standard page handling.
                // Our API earlier looked like `page: paginationModel.page` which was 0-based.
                // Let's adjust: if API expects 0-indexed, we send page-1.

                const response = await axios.get('http://localhost:8000/api/v1/hubspot/contacts', {
                    params: {
                        page: page - 1, // converting 1-based UI to 0-based API
                        pageSize: pageSize
                    }
                });

                const items = response.data.items || [];
                setRows(items);
                setRowCount(response.data.total || 0);

                // Calculate rough stats from CURRENT PAGE
                setStats({
                    withEmail: items.filter((c: Contact) => c.email).length,
                    withPhone: items.filter((c: Contact) => c.phone).length,
                    withCompany: items.filter((c: Contact) => c.company).length
                });

            } catch (err: any) {
                console.error("Failed to fetch HubSpot contacts", err);
                setError("Failed to load contacts. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [page, pageSize]); // Refetch when page changes

    // Client-side filtering for the current page
    const filteredRows = filter === 'all'
        ? rows
        : rows.filter(r => {
            if (filter === 'with_email') return !!r.email;
            if (filter === 'with_phone') return !!r.phone;
            return true;
        });

    if (loading && rows.length === 0) {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading contacts directory...
                </Typography>
            </Container>
        );
    }

    if (error && rows.length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 0.5, mb: 4 }}>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
                                <PersonIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Total Contacts
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    {rowCount.toLocaleString()}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'success.light', color: 'success.dark', display: 'flex' }}>
                                <EmailIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Page Email Rate
                                </Typography>
                                <Typography variant="h5" fontWeight={700} color="success.main">
                                    {rows.length > 0 ? Math.round((stats.withEmail / rows.length) * 100) : 0}%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'info.light', color: 'info.dark', display: 'flex' }}>
                                <BusinessIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Page Company Rate
                                </Typography>
                                <Typography variant="h5" fontWeight={700} color="info.main">
                                    {rows.length > 0 ? Math.round((stats.withCompany / rows.length) * 100) : 0}%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter and Title */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={600} color="text.secondary">
                    Directory
                </Typography>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
                    size="small"
                >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="with_email">Has Email</ToggleButton>
                    <ToggleButton value="with_phone">Has Phone</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Contacts Table (MUI Table) */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>First Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Last Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Company</TableCell>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Job Title</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No contacts found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRows.map((contact) => (
                                <TableRow
                                    key={contact.id}
                                    hover
                                    sx={{
                                        '&:hover': { bgcolor: '#f5f5f5' }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {contact.firstName || '-'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        {contact.lastName || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {contact.email ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EmailIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.5 }} />
                                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                                    {contact.email}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                                No email
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: contact.phone ? 'monospace' : 'inherit', fontSize: '0.85rem', color: contact.phone ? 'inherit' : 'text.disabled' }}>
                                            {contact.phone || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {contact.company ? (
                                            <Chip
                                                label={contact.company}
                                                size="small"
                                                variant="outlined"
                                                sx={{ borderRadius: 1, maxHeight: 24, fontSize: '0.75rem' }}
                                            />
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                        {contact.jobTitle || '-'}
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
                    Showing page {page} of {totalPages} ({rowCount} total contacts)
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

export default Contacts;
