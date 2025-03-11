import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import Dashboard from './Components/Dashboard';
import './App.css';

function App() {
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
    
    return children;
  };
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="app">
              <AuthPage />
              <footer className="footer">
                <div className="footer-left">
                  <p>&copy; 2025 Insyde. All rights reserved.</p>
                </div>
                <div className="footer-right">
                  <a href="mailto:ayyappachowdarykandula@gmail.com" className="footer-email">
                    ayyappachowdarykandula@gmail.com
                  </a>
                  <a href="#" className="twitter-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                </div>
              </footer>
            </div>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Component that handles the authentication page (login/register)
function AuthPage() {
  const [currentPage, setCurrentPage] = React.useState('login');

  const switchToLogin = () => setCurrentPage('login');
  const switchToRegister = () => setCurrentPage('register');
  
  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <>
      <div className="logo">Insyde</div>
      {currentPage === 'login' ? (
        <Login switchToRegister={switchToRegister} />
      ) : (
        <Register switchToLogin={switchToLogin} />
      )}
    </>
  );
}

export default App;
