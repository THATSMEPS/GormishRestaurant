import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ApprovalPending from './pages/ApprovalPending';
import 'leaflet/dist/leaflet.css';

// Custom hook to handle WebView communication
const useWebViewMessage = (message: any) => {
  React.useEffect(() => {
    console.log('[App.tsx] Sending message to WebView:', message);
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  }, [message]);
};

function App() {
  console.log('[App.tsx] App component rendered');
  useWebViewMessage({ type: 'APP_READY' });

  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            maxWidth: '90vw',
            margin: '0 auto'
          }
        }} 
      />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/approval-pending" element={<ApprovalPending />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;