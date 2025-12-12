import { useEffect, useState } from 'react';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, Typography, Paper } from '@mui/material';
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

const Contacts = () => {
    const [rows, setRows] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 100,
    });

    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            try {
                // Fetch paginated data
                const response = await axios.get('http://localhost:8000/api/v1/hubspot/contacts', {
                    params: {
                        page: paginationModel.page,
                        pageSize: paginationModel.pageSize
                    }
                });

                // Handle new response structure { items: [], total: ... }
                // Fallback to empty array if items is undefined
                setRows(response.data.items || []);
                setRowCount(response.data.total || 0);

            } catch (error) {
                console.error("Failed to fetch HubSpot contacts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [paginationModel]);
    // Effect depends on paginationModel changes

    const columns: GridColDef[] = [
        {
            field: 'firstName',
            headerName: 'First',
            width: 100,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'lastName',
            headerName: 'Last',
            width: 110,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 220,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'phone',
            headerName: 'Phone',
            width: 130,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'company',
            headerName: 'Company',
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'jobTitle',
            headerName: 'Job Title',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {params.value}
                </Typography>
            )
        }
    ];

    return (
        <Box>
            <Paper sx={{ height: 'calc(100vh - 100px)', width: '100%', p: 2, borderRadius: 2 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    rowCount={rowCount}
                    pageSizeOptions={[100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            padding: '8px 12px',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f5f5f5',
                            color: '#1a237e',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            minHeight: '48px !important',
                            maxHeight: '48px !important',
                        },
                        '& .MuiDataGrid-row': {
                            minHeight: '52px !important',
                            maxHeight: '52px !important',
                        },
                        '& .MuiDataGrid-row:nth-of-type(even)': {
                            bgcolor: '#fafafa',
                        },
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: '#f0f0f0',
                        },
                    }}
                />
            </Paper>

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
        </Box>
    );
};

export default Contacts;
