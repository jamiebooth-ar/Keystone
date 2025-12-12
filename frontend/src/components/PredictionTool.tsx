import React, { useState, useEffect } from 'react';
import {
    Paper, Grid, Typography, Box, ToggleButton, ToggleButtonGroup,
    Autocomplete, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Card, CardContent, Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import api from '../api';
import type { PredictionResult } from '../types';

const PredictionTool: React.FC = () => {
    const [type, setType] = useState<"Brand" | "LeadGen">("Brand");
    const [selectedCountries, setSelectedCountries] = useState<string[]>(["GB", "US"]);
    const [duration, setDuration] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);

    const countryOptions = [
        { code: "GB", label: "United Kingdom" },
        { code: "US", label: "United States" },
        { code: "AU", label: "Australia" },
        { code: "CA", label: "Canada" },
        { code: "IE", label: "Ireland" },
        { code: "NZ", label: "New Zealand" },
        { code: "DE", label: "Germany" },
        { code: "FR", label: "France" },
        { code: "ES", label: "Spain" },
        { code: "IT", label: "Italy" },
        { code: "NL", label: "Netherlands" },
        { code: "BE", label: "Belgium" },
        { code: "AT", label: "Austria" },
        { code: "CH", label: "Switzerland" },
        { code: "SE", label: "Sweden" },
        { code: "NO", label: "Norway" },
        { code: "DK", label: "Denmark" },
        { code: "FI", label: "Finland" },
        { code: "PL", label: "Poland" },
        { code: "CZ", label: "Czech Republic" },
        { code: "PT", label: "Portugal" },
        { code: "GR", label: "Greece" },
        { code: "HU", label: "Hungary" },
        { code: "RO", label: "Romania" },
        { code: "SG", label: "Singapore" },
        { code: "HK", label: "Hong Kong" },
        { code: "MY", label: "Malaysia" },
        { code: "IN", label: "India" },
        { code: "AE", label: "United Arab Emirates" },
        { code: "ZA", label: "South Africa" },
    ];

    const handlePredict = async () => {
        if (selectedCountries.length === 0) return;
        setLoading(true);
        try {
            const alloc: Record<string, number> = {};
            const split = 100 / selectedCountries.length;
            selectedCountries.forEach(c => alloc[c] = split);

            const response = await api.post<PredictionResult>('/predict', {
                campaign_type: type,
                countries: selectedCountries,
                allocations: alloc,
                duration: duration
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handlePredict();
    }, [type, selectedCountries, duration]);

    return (
        <Box>
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Row 1: Type, Duration, Spacers */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Campaign Type
                        </Typography>
                        <ToggleButtonGroup
                            value={type}
                            exclusive
                            onChange={(_, v) => v && setType(v)}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value="Brand">Brand</ToggleButton>
                            <ToggleButton value="LeadGen">LeadGen</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Duration
                        </Typography>
                        <ToggleButtonGroup
                            value={duration}
                            exclusive
                            onChange={(_, v) => v && setDuration(v)}
                            fullWidth
                            size="small"
                        >
                            <ToggleButton value={1}>1M</ToggleButton>
                            <ToggleButton value={2}>2M</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        {/* Spacer or Future Actions */}
                    </Grid>


                    {/* Row 2: Target Countries (Full Width) */}
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Target Countries
                            </Typography>
                            <Tooltip title="Estimate campaign performance based on historical data" arrow>
                                <InfoOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                            </Tooltip>
                        </Box>
                        <Autocomplete
                            multiple
                            options={countryOptions}
                            getOptionLabel={(option) => option.label}
                            value={countryOptions.filter(c => selectedCountries.includes(c.code))}
                            onChange={(_, newValue) => {
                                setSelectedCountries(newValue.map(v => v.code));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} variant="outlined" size="small" placeholder="Select countries" />
                            )}
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                        />
                    </Grid>

                    {/* Hidden Refresh Button kept for logic if needed, but display none */}
                    <Grid size={{ xs: 12 }} sx={{ display: 'none' }}>
                        <Button onClick={handlePredict} disabled={loading}>Refresh</Button>
                    </Grid>
                </Grid>
            </Paper>

            {result && (
                <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Client Spend
                                </Typography>
                                <Typography variant="h5" fontWeight={700} sx={{ color: '#1AC284' }}>
                                    £{result.summary.client_spend.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Impressions
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    {result.totals.impressions.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Reach
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                    {result.totals.reach.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card sx={{ flex: 1 }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {type === "Brand" ? "Link Clicks" : "Leads"}
                                </Typography>
                                <Typography variant="h5" fontWeight={700} sx={{ color: '#0000FF' }}>
                                    {type === "Brand"
                                        ? result.totals.link_clicks.toLocaleString()
                                        : result.totals.leads.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Country</TableCell>
                                    <TableCell align="right">Budget</TableCell>
                                    <TableCell align="right">Impressions</TableCell>
                                    <TableCell align="right">Reach</TableCell>
                                    <TableCell align="right">CPM</TableCell>
                                    <TableCell align="right">Frequency</TableCell>
                                    <TableCell align="right">{type === "Brand" ? "Link Clicks" : "Leads"}</TableCell>
                                    <TableCell align="right">{type === "Brand" ? "CPC" : "CPL"}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {result.breakdown.map((row) => (
                                    <TableRow key={row.country} hover>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                            {row.country}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            £{row.budget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell align="right">{row.impressions.toLocaleString()}</TableCell>
                                        <TableCell align="right">{row.reach.toLocaleString()}</TableCell>
                                        <TableCell align="right">£{row.cpm.toFixed(2)}</TableCell>
                                        <TableCell align="right">{row.frequency.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            {type === "Brand" ? row.link_clicks.toLocaleString() : row.leads.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            £{type === "Brand" ? row.cpc.toFixed(2) : row.cpl.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
};

export default PredictionTool;
