import {
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { SidebarSearchModal } from '@backstage/plugin-search';
import { UserSettingsSignInAvatar } from '@backstage/plugin-user-settings';
import { makeStyles } from '@material-ui/core/styles';
import CampaignIcon from '@material-ui/icons/AcUnit';
import SecurityIcon from '@material-ui/icons/Security';
import { usePermission } from '@backstage/plugin-permission-react';
import { policyEntityReadPermission } from '@backstage-community/plugin-rbac-common';
import FeedbackIcon from '@material-ui/icons/Feedback';

const useStyles = makeStyles({
  '@global': {
    /* SIDEBAR */
    'nav[aria-label="sidebar nav"]': {
      background: '#FFFFFF !important',
      borderRight: '1px solid #E5E7EB !important',
    },

    /* Drawer */
    '.MuiDrawer-paper': {
      background: '#FFFFFF !important',
      borderRight: '1px solid #E5E7EB !important',
    },

    /* Sidebar items */
    'nav[aria-label="sidebar nav"] a': {
      borderRadius: '12px',
      margin: '4px 10px',
      minHeight: '48px',
      color: '#4B5563 !important',
      fontWeight: 600,
      transition: 'all .2s ease',
    },

    /* Hover */
    'nav[aria-label="sidebar nav"] a:hover': {
      background: '#F3F4F6 !important',
      color: '#111827 !important',
    },

    /* Hover icon */
    'nav[aria-label="sidebar nav"] a:hover svg': {
      color: '#2563EB !important',
    },

    /* Active page */
    'nav[aria-label="sidebar nav"] a[aria-current="page"]': {
      background: '#EFF6FF !important',
      color: '#2563EB !important',
      borderLeft: '4px solid #2563EB',
      borderRadius: '12px',
    },

    /* Active icon */
    'nav[aria-label="sidebar nav"] a[aria-current="page"] svg': {
      color: '#2563EB !important',
    },

    /* All icons */
    'nav[aria-label="sidebar nav"] svg': {
      color: '#6B7280 !important',
    },

    /* Labels */
    'nav[aria-label="sidebar nav"] p, nav[aria-label="sidebar nav"] span': {
      fontWeight: 600,
      letterSpacing: 0,
    },

    /* Search */
    'button[class*="SidebarSearchModal"]': {
      background: '#F9FAFB !important',
      border: '1px solid #E5E7EB !important',
      borderRadius: '12px !important',
      margin: '8px !important',
    },

    /* Divider */
    hr: {
      borderColor: '#E5E7EB !important',
    },

    /* Avatar */
    '[class*="UserSettingsSignInAvatar"] span': {
      border: '2px solid #DBEAFE !important',
    },
  },
});

// ── Admin-only RBAC nav item ──────────────────────────────────────────────────
// Renders only when the signed-in user has `policy-entity read` permission
// (i.e. role:default/admin). Non-admins see nothing here.
function AdminNavItem() {
  const permissionResult = usePermission({
    permission: policyEntityReadPermission,
    resourceRef: 'policy/default',
  });

  if (!permissionResult.allowed) {
    return null;
  }

  return (
    <SidebarItem
      icon={SecurityIcon}
      to="/rbac"
      text="Administration"
    />
  );
}
export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      // useStyles();

      const nav = navItems.withComponent(item => (
        <SidebarItem
          icon={() => item.icon}
          to={item.href}
          text={item.title}
        />
      ));

      return (
        <Sidebar>
          <SidebarLogo />

          <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
            <SidebarSearchModal />
          </SidebarGroup>

          <SidebarDivider />

          <SidebarGroup label="Menu" icon={<MenuIcon />}>
            {nav.take('page:catalog')}
            {nav.take('page:scaffolder')}

            <SidebarDivider />

            <SidebarScrollWrapper>
              {nav.rest({ sortBy: 'title' })}
                      <SidebarItem icon={FeedbackIcon} to="feedback" text="Feedback" />

            </SidebarScrollWrapper>
          </SidebarGroup>

          <SidebarSpace />

          <SidebarItem
            icon={CampaignIcon}
            to="/banner-admin"
            text="Banner Admin"
          />

          {/* Admin-only: visible only to role:default/admin users */}
          <AdminNavItem />

          <SidebarDivider />

          <SidebarGroup
            label="Settings"
            icon={<UserSettingsSignInAvatar />}
            to="/settings"
          >
            {nav.take('page:app-visualizer')}
            {nav.take('page:user-settings')}
          </SidebarGroup>
        </Sidebar>
      );
    },
  },
});
