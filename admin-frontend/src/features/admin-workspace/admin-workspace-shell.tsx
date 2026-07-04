import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import type { PropsWithChildren } from 'react'

import { drawerWidth } from '@/features/admin-workspace/admin-workspace-config'
import type { SectionConfig, SectionKey } from '@/features/admin-workspace/admin-workspace-types'
import type { AdminWorkspaceResponse } from '@/lib/api-types'

type AdminWorkspaceShellProps = PropsWithChildren<{
  mode: 'light' | 'dark'
  isDesktop: boolean
  mobileOpen: boolean
  brandLogoSrc: string
  role: AdminWorkspaceResponse['role']
  workspaceName: string
  sectionConfig: SectionConfig
  allowedSections: SectionConfig[]
  currentSection: SectionKey
  counts: {
    users: number
    organizations: number
    reservations: number
  }
  onToggleMode: () => void
  onSignOut: () => void
  onOpenMobileMenu: () => void
  onCloseMobileMenu: () => void
  onSectionSelect: (section: SectionKey) => void
}>

export const AdminWorkspaceShell = ({
  mode,
  isDesktop,
  mobileOpen,
  brandLogoSrc,
  role,
  workspaceName,
  sectionConfig,
  allowedSections,
  currentSection,
  counts,
  onToggleMode,
  onSignOut,
  onOpenMobileMenu,
  onCloseMobileMenu,
  onSectionSelect,
  children,
}: AdminWorkspaceShellProps) => {
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, background: mode === 'light' ? 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FB 100%)' : 'linear-gradient(180deg, #101D32 0%, #0C1525 100%)' }}>
      <Stack spacing={1.5} sx={{ px: 1.5, py: 2 }}>
        <Box component="img" src={brandLogoSrc} alt="Bookiblastek" sx={{ height: 34, width: 'auto', display: 'block', mb: 0.5 }} />
        <Typography variant="overline" color="primary.main">Bookiblastek Platform</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Admin Console</Typography>
        <Typography color="text.secondary">{sectionConfig.caption}</Typography>
      </Stack>
      <Divider sx={{ my: 1.5 }} />
      <List sx={{ flex: 1, px: 0.5 }}>
        {allowedSections.map((section) => (
          <ListItemButton
            key={section.key}
            selected={section.key === currentSection}
            onClick={() => {
              onSectionSelect(section.key)
              onCloseMobileMenu()
            }}
            sx={{ borderRadius: 3, mb: 0.75 }}
          >
            <ListItemIcon>{section.icon}</ListItemIcon>
            <ListItemText primary={section.label} secondary={section.caption} />
          </ListItemButton>
        ))}
      </List>
      <Paper sx={{ p: 2, borderRadius: 4, background: 'linear-gradient(145deg, rgba(0, 89, 179, 0.16), rgba(0, 168, 143, 0.14))' }}>
        <Typography variant="subtitle2">Signed in as</Typography>
        <Typography variant="h6">{workspaceName}</Typography>
        <Typography color="text.secondary">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Organization Admin'}</Typography>
      </Paper>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', background: mode === 'light' ? 'linear-gradient(180deg, #F5F7FB 0%, #FFFFFF 100%)' : 'linear-gradient(180deg, #0C1525 0%, #101D32 100%)' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(12, 21, 37, 0.8)',
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 78, flexWrap: 'wrap', py: 1.25 }}>
          {!isDesktop ? <IconButton onClick={onOpenMobileMenu}><MenuOutlinedIcon /></IconButton> : null}
          <Box component="img" src={brandLogoSrc} alt="Bookiblastek" sx={{ height: 30, width: 'auto', display: 'block', mr: { xs: 0, md: 0.5 } }} />
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>{sectionConfig.label}</Typography>
              <Chip size="small" label={role === 'SUPER_ADMIN' ? 'Super Admin' : 'Organization Admin'} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">{sectionConfig.caption}</Typography>
          </Box>
          <IconButton onClick={onToggleMode}>{mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}</IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>{workspaceName.slice(0, 1)}</Avatar>
          <Button variant="outlined" startIcon={<LogoutOutlinedIcon />} onClick={onSignOut} sx={{ ml: { xs: 0, sm: 'auto', lg: 0 } }}>Sign out</Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={onCloseMobileMenu} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: { xs: '100vw', sm: drawerWidth }, maxWidth: drawerWidth, boxSizing: 'border-box' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, ml: { lg: `${drawerWidth}px` }, p: { xs: 2, md: 3 }, pt: { xs: 11.5, md: 13 } }}>
        <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', background: mode === 'light' ? 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FB 100%)' : 'linear-gradient(135deg, rgba(16, 29, 50, 0.95) 0%, rgba(12, 21, 37, 0.95) 100%)' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' } }}>
            <Box>
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.12em' }}>Workspace Overview</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>{workspaceName}</Typography>
              <Typography color="text.secondary">
                {role === 'SUPER_ADMIN'
                  ? 'Full platform control with organization, place, and request management.'
                  : 'Focused operations across places, floors, reservations, and settings.'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip label={`${counts.users} users`} variant="outlined" />
              <Chip label={`${counts.organizations} organizations`} variant="outlined" />
              <Chip label={`${counts.reservations} reservations`} variant="outlined" />
            </Stack>
          </Stack>
        </Paper>
        {children}
      </Box>
    </Box>
  )
}
