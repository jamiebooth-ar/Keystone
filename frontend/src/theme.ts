import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1a237e',
            light: '#534bae',
            dark: '#000051',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#c62828',
            light: '#ff5f52',
            dark: '#8e0000',
            contrastText: '#ffffff',
        },
        background: {
            default: '#fafbfc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#666666',
        },
        divider: '#e8eaed',
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        h3: {
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 500,
            color: '#666666',
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#666666',
        },
        body1: {
            fontSize: '0.9375rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e8eaed',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 20px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation0: {
                    boxShadow: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 700,
                    backgroundColor: '#f8f9fa',
                    color: '#1a1a1a',
                    borderBottom: '2px solid #e8eaed',
                    fontSize: '0.875rem',
                },
                root: {
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 6,
                },
            },
        },
    },
});
