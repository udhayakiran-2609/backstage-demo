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
const useStyles = makeStyles((theme) => ({
    '@global': {
    /* =========================
       FORCE LIGHT SIDEBAR
    ========================= */

    'nav[class*="BackstageSidebar"]': {
      background: '#FFFFFF !important',
      color: '#1F2937 !important',
      borderRight: '1px solid #E5E7EB !important',
      boxShadow: 'none !important',
    },

    '[class*="BackstageSidebar-drawer"]': {
      background: '#FFFFFF !important',
      borderRight: '1px solid #E5E7EB !important',
    },

    '[class*="MuiDrawer-paper"]': {
      background: '#FFFFFF !important',
      color: '#1F2937 !important',
      borderRight: '1px solid #E5E7EB !important',
    },

    /* =========================
       LOGO AREA
    ========================= */

    'a[class*="BackstageSidebarLogo"]': {
      background: '#FFFFFF !important',
      borderBottom: '1px solid #F3F4F6 !important',
    },

    'button[class*="SidebarSearchModal"]': {
      background: '#F9FAFB !important',
      color: '#374151 !important',
      borderRadius: '12px !important',
      border: '1px solid #E5E7EB !important',
      margin: '8px !important',
    },

    /* =========================
       MENU ITEMS
    ========================= */

    'a[class*="BackstageSidebarItem-root"], button[class*="BackstageSidebarItem-root"]':
      {
        color: '#4B5563 !important',
        borderRadius: '12px !important',
        margin: '4px 10px !important',
        minHeight: '48px !important',
        fontWeight: 600,
        transition: 'all .2s ease !important',
      },

    /* Hover */

    'a[class*="BackstageSidebarItem-root"]:hover, button[class*="BackstageSidebarItem-root"]:hover':
      {
        background: '#F3F4F6 !important',
        color: '#111827 !important',
      },

    /* Active */

    'a[class*="BackstageSidebarItem-root"][aria-current="page"], a[class*="BackstageSidebarItem-buttonItem"][class*="selected"]':
      {
        background: '#EFF6FF !important',
        color: '#2563EB !important',
        borderLeft: '4px solid #2563EB',
      },

    /* =========================
       ICONS
    ========================= */

    'a[class*="BackstageSidebarItem-root"] svg, button[class*="BackstageSidebarItem-root"] svg':
      {
        color: '#6B7280 !important',
      },

    'a[class*="BackstageSidebarItem-root"]:hover svg, button[class*="BackstageSidebarItem-root"]:hover svg':
      {
        color: '#2563EB !important',
      },

    'a[class*="BackstageSidebarItem-root"][aria-current="page"] svg':
      {
        color: '#2563EB !important',
      },

    /* =========================
       LABELS
    ========================= */

    'p[class*="BackstageSidebarItem-label"], span[class*="BackstageSidebarItem-label"]':
      {
        color: '#374151 !important',
        fontWeight: 600,
        textTransform: 'none !important',
        letterSpacing: '0 !important',
      },

    /* =========================
       DIVIDERS
    ========================= */

    'hr[class*="BackstageSidebarDivider"]': {
      borderColor: '#E5E7EB !important',
      margin: '12px 16px !important',
    },

    /* =========================
       NOTIFICATIONS
    ========================= */

    '[class*="NotificationsSidebarItem"]': {
      color: '#4B5563 !important',
    },

    /* =========================
       SETTINGS AVATAR
    ========================= */

    'button[class*="UserSettingsSignInAvatar"] span': {
      border: '2px solid #DBEAFE !important',
      boxShadow: 'none !important',
    },

    /* =========================
       SCROLLBAR
    ========================= */

    '*::-webkit-scrollbar': {
      width: '4px',
    },

    '*::-webkit-scrollbar-thumb': {
      background: '#CBD5E1',
      borderRadius: '999px',
    },

    '*::-webkit-scrollbar-track': {
      background: 'transparent',
    },
  },
}));

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      useStyles();

      const nav = navItems.withComponent(item => (
        <SidebarItem
          icon={() => item.icon}
          to={item.href}
          text={item.title}
        />
      ));

      nav.take('page:search');

      return (
        <Sidebar>
          <SidebarLogo />

          <SidebarGroup
            label="Search"
            icon={<SearchIcon />}
            to="/search"
          >
            <SidebarSearchModal />
          </SidebarGroup>

          <SidebarDivider />

          <SidebarGroup
            label="Menu"
            icon={<MenuIcon />}
          >
            {nav.take('page:catalog')}
            {nav.take('page:scaffolder')}

            <SidebarDivider />

            <SidebarScrollWrapper>
              {nav.rest({ sortBy: 'title' })}
            </SidebarScrollWrapper>
          </SidebarGroup>

          <SidebarSpace />

          {/* <SidebarDivider /> */}

          {/* <NotificationsSidebarItem /> */}
          <SidebarItem icon={CampaignIcon} to="banner-admin" text="Banner Admin" />

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