import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, CircularProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import api from '../api';
import type { PageTemplate } from '../types';

const ContentBuilder: React.FC = () => {
    const [templates, setTemplates] = useState<PageTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ title: '', content: '<h1>New Template</h1>', domains: 1, mode: 1 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get<PageTemplate[]>('/content/templates/');
            setTemplates(res.data);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await api.post('/content/templates/', newTemplate);
            setOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                        Content Builder
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage HTML Templates
                    </Typography>
                </Box>
                <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Create New</Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Mode</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {templates.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.title}</TableCell>
                                    <TableCell>{row.mode === 1 ? 'Email' : 'Web'}</TableCell>
                                    <TableCell>{new Date(row.created_on).toLocaleDateString()}</TableCell>
                                    <TableCell align="center">
                                        <Button size="small">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>New Template</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        variant="standard"
                        value={newTemplate.title}
                        onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="HTML Content"
                        fullWidth
                        multiline
                        rows={10}
                        variant="outlined"
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ContentBuilder;
