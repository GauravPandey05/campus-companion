# Campus Companion


A comprehensive academic management platform designed to enhance the college experience by centralizing notes sharing, assignment tracking, discussions, and timetable management.

## 🚀 Features

### Ready for Use
- **🔐 Authentication System**: Secure login via Firebase Authentication with role-based access
- **👥 User Profiles**: Student, Class Representative (CR), and Admin roles with appropriate permissions
- **📝 Notes Library**: Upload, organize, and share academic materials with customizable sharing settings
- **📚 Subject Management**: Browse subjects specific to your department and semester
- **🏫 Department & Class Structure**: Organized academic content based on department and class sections

### In Development
- **✏️ Assignment Tracker**: Create, submit, and track assignments (80% complete)
- **💬 Discussion Forum**: Engage in subject-specific discussions (50% complete)
- **📅 Timetable View**: Weekly class schedule with visual calendar interface (30% complete)
- **📊 Analytics Dashboard**: Track usage and performance (planning phase)

## 💻 Technology Stack

- **Frontend**: React with TypeScript, Vite for build system
- **State Management**: React Context API and custom hooks
- **UI Framework**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore, Authentication)
- **File Storage**: Google Drive API integration
- **Deployment**: Vercel/Netlify (frontend), Firebase Functions (serverless)

## 🏗️ Project Structure

```
campus-companion/
├── project/               # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Auth/      # Authentication components
│   │   │   ├── Notes/     # Notes management
│   │   │   ├── Dashboard/ # User dashboard
│   │   │   └── Layout/    # Layout components
│   │   ├── contexts/      # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── config/        # Configuration files
│   │   │   ├── firebase.ts
│   │   │   └── googleDrive.ts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Utility functions
│   └── public/            # Public assets
└── server/                # Backend server for file uploads
    ├── index.js           # Express server
    └── credentials.json   # Google Drive API credentials
```

## 📦 Data Model

Campus Companion uses Firestore collections with the following structure:

- **Users**: Profile data with roles and department affiliations
- **Departments**: Academic departments with associated subclasses
- **Subclasses**: Class sections with year and semester information
- **Subjects**: Course information linked to departments
- **Notes**: Shared study materials with Google Drive integration
- **Assignments**: Tasks with deadlines and submission tracking
- **Discussions**: Threaded discussions with comments and voting
- **Timetable**: Weekly class schedules

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ and npm
- Firebase account
- Google Cloud Platform account with Drive API enabled

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/campus-companion.git
cd campus-companion
```

2. Install dependencies
```bash
cd project
npm install
```

3. Create environment variables
```bash
# In project/.env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3001/api
```

4. Set up server for file uploads
```bash
cd ../server
npm install
```

5. Start the development server
```bash
# In project directory
npm run dev

# In server directory (separate terminal)
npm start
```

## 🌐 Deployment

The application is being deployed with the following setup:

1. Frontend: Vercel continuous deployment from main branch
2. Backend: Firebase Functions for serverless operations
3. Database: Firebase Firestore
4. File Storage: Google Drive API

## 🛠️ Current Development Status

The project is in **active development** with several components in different stages:

1. **Core Infrastructure**: ✅ Complete
2. **Authentication**: ✅ Complete
3. **Notes System**: ✅ Complete
4. **Department/Class Organization**: ✅ Complete
5. **Google Drive Integration**: ✅ Complete
6. **Assignment System**: 🟡 In Progress (80%)
7. **Discussion Forum**: 🟡 In Progress (50%)
8. **Timetable View**: 🟡 In Progress (30%)
9. **Mobile Responsive Design**: 🟡 In Progress (70%)

## 🤝 Contributing

Contributions are welcome! The project follows a component-based architecture making it easy to add new features.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Google Drive API](https://developers.google.com/drive)

