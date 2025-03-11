import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, UploadCloud, Clock, Mail, LogOut, RotateCw, FileBox } from 'lucide-react';
import Upload from './Upload';
import History from './History';
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'upload':
        return <Upload />;
      case 'history':
        return <History />;
      default:
        return (
          <div className="dashboard-home">
            <div className="welcome-banner">
              <div className="welcome-content">
                <div className="welcome-text">
                  <h1>Welcome back, {user?.name}! 👋</h1>
                  <p>Your 3D model management workspace is ready</p>
                </div>
                <div className="welcome-graphic">
                  <img src="https://cdn-icons-png.flaticon.com/512/3342/3342137.png" alt="3D Model" />
                </div>
              </div>
            </div>

            

            <div className="features-section">
              <div className="section-header">
                <h2>Insyde Features</h2>
                <p>Everything you need to manage 3D models</p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon bg-purple">
                    <UploadCloud size={24} />
                  </div>
                  <div className="feature-details">
                    <h4>Seamless Upload</h4>
                    <p>Drag-and-drop interface for STL/OBJ files with instant preview</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon bg-blue">
                    <RotateCw size={24} />
                  </div>
                  <div className="feature-details">
                    <h4>Interactive Viewer</h4>
                    <p>Real-time manipulation with orbit controls and measurement tools</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon bg-green">
                    <FileBox size={24} />
                  </div>
                  <div className="feature-details">
                    <h4>Smart Organization</h4>
                    <p>Automatic file categorization and version control</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <div className="cta-content">
                <h2>Ready to explore your models?</h2>
                <p>Start by uploading your first 3D file or browse our documentation</p>
                <div className="cta-buttons">
                  <button 
                    className="cta-primary"
                    onClick={() => setActivePage('upload')}
                  >
                    <UploadCloud size={18} />
                    Upload Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">Insyde</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activePage === 'dashboard' ? 'active' : ''}
              onClick={() => { setActivePage('dashboard'); setSidebarOpen(false); }}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </li>
            <li 
              className={activePage === 'upload' ? 'active' : ''}
              onClick={() => { setActivePage('upload'); setSidebarOpen(false); }}
            >
              <UploadCloud size={20} />
              <span>Upload Model</span>
            </li>
            <li 
              className={activePage === 'history' ? 'active' : ''}
              onClick={() => { setActivePage('history'); setSidebarOpen(false); }}
            >
              <Clock size={20} />
              <span>History</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1 className="navbar-logo">Insyde</h1>
          </div>
          <div className="navbar-right">
            <a href={`mailto:${user?.email}`} className="navbar-email">
  <Mail size={20} />
  <span className="email-text">{user?.email}</span>
</a>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="page-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;