import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BlogPage from './pages/BlogPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import DashboardAppPage from './pages/DashboardAppPage';
import VPNSettings from './pages/VPNSettings';
import LogsSettings from './pages/LogsSettings';
import WiFiSettings from './pages/WiFiSettings';
import DockerSettings from './pages/DockerSettings';
import ServiceSettings from './pages/ServiceSettings';
import OpenThreadSettings from './pages/OpenThreadSettings';
import CurrentStatus from './pages/CurrentStatus';
import NetworkDevices from './pages/NetworkDevices';
import CalibrationPage from './pages/CalibrationPage';
import Rooms from './pages/Rooms';
import PositioningViewer from './pages/PositioningViewer';
// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'vpn', element: <VPNSettings /> },
        { path: 'logs', element: <LogsSettings /> },
        { path: 'wifi', element: <WiFiSettings /> },
        { path: 'docker', element: <DockerSettings /> },
        { path: 'service', element: <ServiceSettings /> },
        { path: 'openthread', element: <OpenThreadSettings /> },
        { path: 'devices', element: <NetworkDevices /> },
        { path: 'roomssettings', element: <Rooms /> },
        { path: 'positioningviewer', element: <PositioningViewer /> },
        // { path: 'currentstatus', element: <CurrentStatus /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'calibration', element: <CalibrationPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
