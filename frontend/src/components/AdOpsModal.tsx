import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Alert
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface FlaggedCampaign {
    id: string;
    name: string;
    issues: string[];
    spend: number;
    impressions: number;
    cpm: number;
}

interface AdOpsModalProps {
    open: boolean;
    onClose: () => void;
    flaggedCampaigns: FlaggedCampaign[];
}

const AdOpsModal: React.FC<AdOpsModalProps> = ({ open, onClose, flaggedCampaigns }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minHeight: '400px'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" />
                    <Typography variant="h6">Ad Ops Operative Analysis</Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                {flaggedCampaigns.length === 0 ? (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                        All campaigns are performing within industry standards. No issues detected.
                    </Alert>
                ) : (
                    <>
                        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                            Found {flaggedCampaigns.length} campaign{flaggedCampaigns.length !== 1 ? 's' : ''} with performance issues
                        </Alert>

                        <List sx={{ width: '100%' }}>
                            {flaggedCampaigns.map((campaign, index) => (
                                <React.Fragment key={campaign.id}>
                                    <ListItem
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            bgcolor: '#fafafa',
                                            borderRadius: 1,
                                            mb: 2,
                                            p: 2
                                        }}
                                    >
                                        <Box sx={{ width: '100%', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                {campaign.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                {campaign.issues.map((issue, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={issue}
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 3, width: '100%', flexWrap: 'wrap' }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Spend</Typography>
                                                <Typography variant="body2" fontWeight={500}>£{campaign.spend.toFixed(2)}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Impressions</Typography>
                                                <Typography variant="body2" fontWeight={500}>{campaign.impressions.toLocaleString()}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">CPM</Typography>
                                                <Typography variant="body2" fontWeight={500}>£{campaign.cpm.toFixed(2)}</Typography>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    </>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdOpsModal;
