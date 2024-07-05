// component
import SvgColor from '../../../components/svg-color';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther'; // Importa l'icona MUI

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;
const muiIcon = (IconComponent) => <IconComponent sx={{ width: 1, height: 1 }} />;


const navConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Network Devices',
    path: '/dashboard/devices',
    icon: muiIcon(DevicesOtherIcon),
  },
  {
    title: 'Positioning Viewer',
    path: '/dashboard/positioningviewer',
    icon: muiIcon(DevicesOtherIcon),
  },
  {
    title: 'OpenThread Connections',
    path: '/dashboard/openthread',
    icon: icon('ic_user'),
  },
  {
    title: 'VPN settings',
    path: '/dashboard/vpn',
    icon: icon('ic_disabled'),
  },
  {
    title: 'WiFi settings',
    path: '/dashboard/wifi',
    icon: icon('ic_blog'),
  },
  {
    title: 'Docker settings',
    path: '/dashboard/docker',
    icon: icon('ic_lock'),
  },
  {
    title: 'Services settings',
    path: '/dashboard/service',
    icon: icon('ic_disabled'),
  },
  {
    title: 'LOGS infos',
    path: '/dashboard/logs',
    icon: icon('ic_user'),
  },
  {
    title: 'Calibration stats',
    path: '/dashboard/calibration',
    icon: icon('ic_user'),
  },
  {
    title: 'Areas Settings',
    path: '/dashboard/roomssettings',
    icon: muiIcon(DevicesOtherIcon),
  },
  // {
  //   title: 'Current Config',
  //   path: '/dashboard/currentstatus',
  //   icon: icon('ic_user'),
  // },
  // {
  //   title: 'user',
  //   path: '/dashboard/user',
  //   icon: icon('ic_user'),
  // },
  // {
  //   title: 'product',
  //   path: '/dashboard/products',
  //   icon: icon('ic_cart'),
  // },
  // {
  //   title: 'blog',
  //   path: '/dashboard/blog',
  //   icon: icon('ic_blog'),
  // },
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: icon('ic_lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
