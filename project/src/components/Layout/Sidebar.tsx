import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  Users,
  Settings,
  GraduationCap,
  ClipboardList,
  Upload,
  Building // Add this missing import
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { userProfile } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/', roles: ['student', 'cr', 'admin'] },
    { name: 'Notes Library', icon: BookOpen, path: '/notes', roles: ['student', 'cr', 'admin'] },
    { name: 'Upload Notes', icon: Upload, path: '/upload-notes', roles: ['student', 'cr', 'admin'] },
    { name: 'Timetable', icon: Calendar, path: '/timetable', roles: ['student', 'cr', 'admin'] },
    { name: 'Assignments', icon: ClipboardList, path: '/assignments', roles: ['student', 'cr', 'admin'] },
    { name: 'Discussions', icon: MessageSquare, path: '/discussions', roles: ['student', 'cr', 'admin'] },
    { name: 'User Management', icon: Users, path: '/users', roles: ['admin'] },
    { name: 'Departments', icon: Building, path: '/departments', roles: ['admin'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['student', 'cr', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    userProfile && item.roles.includes(userProfile.role)
  );

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-40 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Campus</h1>
            <p className="text-sm text-gray-500">Companion+</p>
          </div>
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {userProfile && (
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {userProfile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{userProfile.name}</p>
              <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;