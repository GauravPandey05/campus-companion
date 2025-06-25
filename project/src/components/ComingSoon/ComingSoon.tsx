import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComingSoonProps {
  feature: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ feature }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Construction className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gray-800 mb-4"
        >
          {feature} Coming Soon!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          We're working hard to bring you the {feature.toLowerCase()} feature. 
          Stay tuned for updates and exciting new functionality!
        </motion.p>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-8 shadow-sm mb-8 max-w-2xl mx-auto"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">What to Expect:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {getFeatureList(feature).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-600">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 bg-blue-50 rounded-xl max-w-md mx-auto"
        >
          <h4 className="font-semibold text-blue-800 mb-2">Development Progress</h4>
          <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage(feature)}%` }}
              transition={{ delay: 1, duration: 1 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            />
          </div>
          <p className="text-sm text-blue-600">
            {getProgressPercentage(feature)}% Complete
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Helper function to get feature-specific lists
const getFeatureList = (feature: string): string[] => {
  const featureLists: { [key: string]: string[] } = {
    'Timetable': [
      'Interactive class schedules',
      'Room and teacher information',
      'Calendar integration',
      'Conflict detection',
      'Export to mobile calendar',
      'Reminder notifications'
    ],
    'Assignments': [
      'Assignment creation and management',
      'Due date tracking',
      'Submission status',
      'File upload support',
      'Grade tracking',
      'Email reminders'
    ],
    'Discussions': [
      'Reddit-style discussion threads',
      'Subject-wise categorization',
      'Upvote and downvote system',
      'Nested comments',
      'Real-time notifications',
      'Moderation tools'
    ],
    'User Management': [
      'Bulk user registration',
      'Role assignment',
      'Department management',
      'Access control',
      'User analytics',
      'Account verification'
    ],
    'Department Management': [
      'Add/edit departments',
      'Subclass configuration',
      'Subject assignment',
      'CR appointment',
      'Statistics dashboard',
      'Bulk operations'
    ],
    'Settings': [
      'Profile customization',
      'Notification preferences',
      'Privacy controls',
      'Theme selection',
      'Language options',
      'Data export'
    ]
  };

  return featureLists[feature] || [
    'Enhanced user experience',
    'Improved functionality',
    'Better performance',
    'Mobile optimization',
    'Advanced features',
    'Seamless integration'
  ];
};

// Helper function to get progress percentage
const getProgressPercentage = (feature: string): number => {
  const progress: { [key: string]: number } = {
    'Timetable': 25,
    'Assignments': 30,
    'Discussions': 15,
    'User Management': 40,
    'Department Management': 35,
    'Settings': 20
  };

  return progress[feature] || 10;
};

export default ComingSoon;