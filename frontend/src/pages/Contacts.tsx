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
    hubspotUrl?: string;
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
        { field: 'firstName', headerName: 'First Name', flex: 1 },
        { field: 'lastName', headerName: 'Last Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1.5 },
        {
            field: 'phone',
            headerName: 'Phone',
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {params.value}
                </Typography>
            )
        },
        { field: 'company', headerName: 'Company', flex: 1 },
        { field: 'jobTitle', headerName: 'Job Title', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.8,
            sortable: false,
            renderCell: (params) => (
                params.row.hubspotUrl ? (
                    <a
                        href={params.row.hubspotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1a237e', fontWeight: 600, textDecoration: 'none' }}
                    >
                        View in HubSpot
                    </a>
                ) : null
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
                            fontSize: '0.9rem',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f5f5f5',
                            color: '#1a237e',
                            fontWeight: 700,
                        },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default Contacts;
