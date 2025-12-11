import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Collapse,
    ListSubheader,
    Tooltip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

interface LayoutProps {
    children: React.ReactNode;
}

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path?: string;
    children?: MenuItem[];
    id: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(true);
    // Collapsed by default
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDesktopDrawerToggle = () => {
        setDesktopOpen(!desktopOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMenuClick = (id: string, path?: string) => {
        if (path) {
            navigate(path);
            if (mobileOpen) handleDrawerToggle();
        } else {
            setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
        }
    };

    const menuItems: MenuItem[] = [
        {
            text: 'Value',
            icon: null,
            id: 'Value',
            children: [
                { text: 'FindAMasters', icon: null, path: '/fam', id: 'FAM' },
                { text: 'FindAPhD', icon: null, path: '/fap', id: 'FAP' },
            ]
        },
        {
            text: 'Marketing',
            icon: null,
            id: 'Marketing',
            children: [
                { text: 'Content', icon: null, path: '/content', id: 'Content' },
                { text: 'Analytics', icon: null, path: '/analytics', id: 'Analytics' },
            ]
        },
        {
            text: 'Sales',
            icon: null,
            id: 'Sales',
            children: [
                { text: 'Predictor', icon: null, path: '/predictor', id: 'Predictor' },
                { text: 'Orders', icon: null, path: '/orders', id: 'Orders' },
                { text: 'Contacts', icon: null, path: '/users', id: 'Contacts' },
            ]
        },
        {
            text: 'Delivery',
            icon: null,
            id: 'Delivery',
            children: [
                { text: 'Campaign', icon: null, path: '/campaigns', id: 'Campaigns' },
                { text: 'Events', icon: null, path: '/events', id: 'Events' },
                { text: 'Email Service', icon: null, path: '/emailer', id: 'Emailer' },
            ]
        },
        {
            text: 'Finance',
            icon: null,
            id: 'Finance',
            children: [
                { text: 'Overview', icon: null, path: '/finance', id: 'FinanceOverview' },
            ]
        }
    ];

    const renderMenuItem = (item: MenuItem, depth: number = 0, isCollapsed: boolean) => {
        const isOpen = openMenus[item.id] || false;
        const isSelected = item.path ? location.pathname === item.path : false;

        // Simplified indentation for text-only menu
        // Base padding 2.5, +1.5 for each depth level
        const paddingLeft = isCollapsed ? 2.5 : 2.5 + (depth * 2);

        return (
            <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        selected={isSelected}
                        onClick={() => handleMenuClick(item.id, item.path)}
                        sx={{
                            minHeight: 40, // Slightly more compact
                            justifyContent: isCollapsed ? 'center' : 'initial',
                            px: 2.5,
                            pl: paddingLeft,
                            py: 1,
                            borderRadius: 1, // Soft rounded corners
                            mx: 1, // Margin for floating look
                            mb: 0.5,
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                            },
                        }}
                    >
                        {/* Text Only - Professional Look */}
                        {!isCollapsed && (
                            <>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: depth === 0 ? '0.9rem' : '0.85rem',
                                        fontWeight: isSelected ? 600 : (depth === 0 ? 500 : 400),
                                        color: 'inherit',
                                    }}
                                />
                                {item.children && (isOpen ? <ExpandLess sx={{ fontSize: '1.2rem', color: 'inherit', opacity: 0.7 }} /> : <ExpandMore sx={{ fontSize: '1.2rem', color: 'inherit', opacity: 0.7 }} />)}
                            </>
                        )}
                    </ListItemButton>
                </ListItem>
                {!isCollapsed && item.children && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children.map(child => renderMenuItem(child, depth + 1, false))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    const drawer = (isCollapsed: boolean) => {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {!isCollapsed && (
                        <ListSubheader
                            component="div"
                            sx={{
                                bgcolor: 'transparent',
                                fontWeight: 400,
                                color: 'text.secondary',
                                opacity: 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pt: 1,
                                pb: 0.5,
                                fontSize: '0.75rem',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Business breakdown
                            <Tooltip
                                title="Core business cycle: Create Value, Market, Sell, Deliver, and Profit."
                                arrow
                                placement="right"
                            >
                                <InfoOutlinedIcon sx={{ fontSize: 16, ml: 0.5, cursor: 'help', opacity: 0.7 }} />
                            </Tooltip>
                        </ListSubheader>
                    )}
                    <List>
                        {menuItems.map(item => renderMenuItem(item, 0, isCollapsed))}
                    </List>
                </Box>

                <List sx={{ px: isCollapsed ? 1 : 2, pb: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={handleLogout}
                            sx={{
                                borderRadius: 2,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                '&:hover': {
                                    bgcolor: 'error.light',
                                    color: 'error.contrastText',
                                    '& .MuiListItemIcon-root': {
                                        color: 'error.contrastText',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: 'center' }}>
                                <LogoutIcon />
                            </ListItemIcon>
                            {!isCollapsed && (
                                <ListItemText
                                    primary="Logout"
                                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        );
    };

    const currentDrawerWidth = desktopOpen ? drawerWidth : collapsedDrawerWidth;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafbfc' }}>
            {/* Top Navigation Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDesktopDrawerToggle}
                        sx={{ mr: 2, display: { xs: 'none', sm: 'block' }, color: 'text.primary' }}
                    >
                        {desktopOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>

                    <Box
                        component="img"
                        src="/keystone-logo.png"
                        alt="Keystone"
                        sx={{
                            height: 40,
                            objectFit: 'contain',
                            mr: 2,
                        }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none',
                            mt: '64px',
                        },
                    }}
                >
                    {drawer(false)}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentDrawerWidth,
                            border: 'none',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            mt: '64px',
                            transition: 'width 0.3s ease',
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {drawer(!desktopOpen)}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
                    minHeight: '100vh',
                    mt: '64px',
                    transition: 'width 0.3s ease',
                }}
            >
                <Box sx={{ p: 4 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
