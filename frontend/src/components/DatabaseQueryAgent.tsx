import React, { useState } from 'react';
import api from '../api';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    Paper,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import StorageIcon from '@mui/icons-material/Storage';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface DatabaseQueryAgentProps {
    open: boolean;
    onClose: () => void;
}

const DatabaseQueryAgent: React.FC<DatabaseQueryAgentProps> = ({ open, onClose }) => {
    const initialMessage: Message = {
        role: 'assistant',
        content: 'Hello! I can scan the FAU database estate to find answers to your questions. If you\'d like stats for a specific university across all our products, just enter the university name. Please be patient as the databases are large.'
    };

    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [loading, setLoading] = useState(false);

    // Reset chat when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setMessages([initialMessage]);
            setQuery('');
            setLoading(false);
        }
    }, [open]);

    const handleSendQuery = async () => {
        if (!query.trim()) return;

        const currentQuery = query;
        const userMessage: Message = { role: 'user', content: currentQuery };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const response = await api.post('/database/query', { query: currentQuery });
            const assistantMessage: Message = {
                role: 'assistant',
                content: response.data.answer || "I found some data but couldn't summarize it."
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error querying database:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "I'm sorry, I encountered an error while querying the database. Please try again."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendQuery();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    height: '600px',
                    maxHeight: '80vh'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            bgcolor: '#6366f115',
                            p: 1,
                            borderRadius: 1.5,
                            display: 'flex',
                            border: '1px solid #6366f130'
                        }}
                    >
                        <StorageIcon sx={{ color: '#6366f1', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>Database Query Agent</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Querying FAU CMS & WYSIWYG databases
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)' }}>
                {/* Messages Area */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                mb: 2
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    maxWidth: '75%',
                                    bgcolor: message.role === 'user' ? '#6366f1' : '#f5f5f5',
                                    color: message.role === 'user' ? 'white' : 'text.primary',
                                    borderRadius: 2,
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                    {message.content}
                                </Typography>
                            </Paper>
                        </Box>
                    ))}
                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary">
                                Querying databases...
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }}>
                    <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
                        💡 <strong>Tip:</strong> Enter a university name to get stats across all products, or ask about specific data from our CMS.
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Enter your query... (e.g., 'University of Oxford' or 'Show me all courses in Computer Science')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            size="small"
                            multiline
                            maxRows={3}
                        />
                        <IconButton
                            onClick={handleSendQuery}
                            disabled={loading || !query.trim()}
                            color="primary"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                },
                                '&:disabled': {
                                    bgcolor: 'grey.300'
                                }
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default DatabaseQueryAgent;
