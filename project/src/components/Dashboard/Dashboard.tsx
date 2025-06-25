import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Users,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Assignment, Note, DiscussionThread } from '../../types';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    assignments: 0,
    notes: 0,
    discussions: 0,
    upcomingDeadlines: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assignments count
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('subclassId', '==', userProfile?.subclass || '')
      );
      const assignmentsSnap = await getDocs(assignmentsQuery);
      
      // Fetch notes count
      const notesQuery = query(
        collection(db, 'notes'),
        where('subclassId', '==', userProfile?.subclass || '')
      );
      const notesSnap = await getDocs(notesQuery);
      
      // Fetch discussions count
      const discussionsQuery = query(collection(db, 'discussions'));
      const discussionsSnap = await getDocs(discussionsQuery);
      
      setStats({
        assignments: assignmentsSnap.size,
        notes: notesSnap.size,
        discussions: discussionsSnap.size,
        upcomingDeadlines: 3 // Mock data
      });

      // Mock recent activities
      setRecentActivities([
        { type: 'assignment', title: 'Database Systems Assignment', time: '2 hours ago' },
        { type: 'note', title: 'Machine Learning Notes uploaded', time: '1 day ago' },
        { type: 'discussion', title: 'New discussion on Data Structures', time: '2 days ago' },
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Calendar, label: 'View Timetable', color: 'from-blue-500 to-blue-600', path: '/timetable' },
    { icon: FileText, label: 'Upload Notes', color: 'from-green-500 to-green-600', path: '/upload-notes' },
    { icon: MessageSquare, label: 'Join Discussion', color: 'from-purple-500 to-purple-600', path: '/discussions' },
    { icon: BookOpen, label: 'View Assignments', color: 'from-orange-500 to-orange-600', path: '/assignments' },
  ];

  const statsCards = [
    { icon: BookOpen, label: 'Assignments', value: stats.assignments, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: FileText, label: 'Notes', value: stats.notes, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: MessageSquare, label: 'Discussions', value: stats.discussions, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Clock, label: 'Deadlines', value: stats.upcomingDeadlines, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userProfile?.name}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to make today productive? Let's get started with your studies.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white text-left transition-all`}
              >
                <action.icon className="w-6 h-6 mb-2" />
                <p className="font-medium">{action.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {activity.type === 'assignment' && <BookOpen className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'note' && <FileText className="w-4 h-4 text-green-600" />}
                  {activity.type === 'discussion' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Deadlines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Deadlines</h2>
        <div className="space-y-4">
          {[
            { title: 'Database Systems Project', due: 'Tomorrow', urgent: true },
            { title: 'Machine Learning Assignment', due: 'In 3 days', urgent: false },
            { title: 'Software Engineering Report', due: 'Next week', urgent: false },
          ].map((deadline, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${deadline.urgent ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <div>
                  <p className="font-medium text-gray-800">{deadline.title}</p>
                  <p className="text-sm text-gray-600">Due {deadline.due}</p>
                </div>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;