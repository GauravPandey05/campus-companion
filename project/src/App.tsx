import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import UploadNotes from './components/Notes/UploadNotes';
import NotesLibrary from './components/Notes/NotesLibrary';
import ComingSoon from './components/ComingSoon';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <Layout>
                    <ErrorBoundary>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/upload-notes" element={<UploadNotes />} />
                        <Route path="/notes" element={<NotesLibrary />} />
                        <Route path="/timetable" element={<ComingSoon feature="Timetable" />} />
                        <Route path="/assignments" element={<ComingSoon feature="Assignments" />} />
                        <Route path="/discussions" element={<ComingSoon feature="Discussions" />} />
                        <Route path="/users" element={<ComingSoon feature="User Management" />} />
                        <Route path="/departments" element={<ComingSoon feature="Department Management" />} />
                        <Route path="/settings" element={<ComingSoon feature="Settings" />} />
                      </Routes>
                    </ErrorBoundary>
                  </Layout>
                }
              />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;