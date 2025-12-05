# Campus Check-in - Geofencing Attendance App

## 🎯 Project Overview

**Campus Check-in** is a production-ready React Native mobile application with Firebase backend that enables automated attendance tracking using geofencing technology. The app is designed for college campuses where students can automatically check in to classes when they are within a 50-meter radius of the classroom.

## ✨ Key Features

### Student Features
- **Auto Attendance**: Automatic check-in when within 50m radius during class time
- **Attendance History**: View past attendance records with status indicators
- **Profile Management**: Manage personal profile and settings
- **Background Location Tracking**: Continuous location tracking every 30 seconds
- **Offline Support**: Cached attendance records when network unavailable
- **Push Notifications**: Real-time notifications for attendance confirmations
- **GDPR Compliance**: Consent screen on first launch for location data

### Faculty Features
- **Live Dashboard**: Real-time monitoring of class attendance
- **Attendance Reports**: Detailed reports with charts and statistics
- **CSV Export**: Export attendance data in CSV format
- **Student Management**: View student profiles and attendance history
- **Class Management**: Create and manage classroom locations

### Technical Highlights
- **Email/Password & Google Sign-In**: Firebase Authentication
- **Geofencing**: Haversine distance calculation for 50m radius
- **Real-time Sync**: Firestore for real-time database updates
- **Background Processing**: expo-task-manager for background location tracking
- **Duplicate Prevention**: 24-hour duplicate check-in prevention
- **Data Encryption**: Location data encryption for security

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit
- **Styling**: NativeWind (Tailwind CSS)
- **Location**: expo-location for geofencing
- **Maps**: React Native Maps

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Push Notifications**: Firebase Cloud Messaging
- **Cloud Functions**: Firebase Cloud Functions
- **Storage**: AsyncStorage for local caching

## 📱 Mobile Requirements

- **iOS**: 13.0 or higher
- **Android**: 8.0 or higher
- **Permissions Required**:
  - Location Services (Background)
  - Calendar (for class schedule)
  - Notifications

## 📁 Project Structure

```
Campus-Check-in/
├── client/               # React Native Expo app
│   ├── components/       # Reusable UI components
│   ├── screens/          # App screens (Student, Faculty)
│   ├── navigation/       # Navigation configuration
│   ├── store/            # Redux store and slices
│   ├── services/         # Firebase services
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   └── App.tsx           # App entry point
├── server/               # Backend (Node.js)
│   ├── functions/        # Cloud Functions
│   └── config/           # Server configuration
├── shared/               # Shared types and schemas
├── scripts/              # Build and setup scripts
├── app.json              # Expo app configuration
├── package.json          # Dependencies
└── README.md             # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Firebase account
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nayankamal305-hub/Campus-Check-in.git
   cd Campus-Check-in
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Add your `firebaseConfig` in `client/services/firebase.ts`
   - Enable Authentication methods (Email/Google)
   - Enable Firestore database

4. **Configure Google Maps API**
   - Get your API key from Google Cloud Console
   - Update `client/constants/config.ts` with your API key

5. **Setup Demo Classrooms**
   - Three demo classrooms are pre-configured:
     - Room101: Latitude 19.0760, Longitude 72.8777
     - LabA: Latitude 19.0758, Longitude 72.8780
     - Auditorium: Latitude 19.0762, Longitude 72.8765

### Running the App

```bash
# Start the development server
npm start

# Or run specific platform
npm run android
npm run ios

# Or run web version
npm run web
```

### Running Backend Functions

```bash
cd server
firebase emulators:start
```

## 🔐 Security Features

- **Location Encryption**: Student location data is encrypted
- **GDPR Consent**: Explicit user consent for location tracking
- **Firebase Security Rules**: Restricted database access
- **TypeScript Strict Mode**: Type-safe code
- **Error Handling**: Comprehensive error handling

## 📊 Database Schema

### Firestore Collections

```
users/
  ├── {userId}/
      ├── role: "student" | "faculty"
      ├── profile: {name, email, phone}
      └── attendance: [{classId, date, status}]

classes/
  ├── {classId}/
      ├── name: string
      ├── latitude: number
      ├── longitude: number
      ├── radius: 50 (meters)
      └── schedule: [{dayOfWeek, startTime, endTime}]

attendance/
  ├── {date}/
      ├── {classId}/
          ├── {studentId}/
              ├── status: "present" | "absent"
              ├── timestamp: datetime
              └── location: {latitude, longitude}
```

## 🎨 UI/UX

- **Blue/Purple Gradient**: Modern design with gradient backgrounds
- **Dark Mode Support**: Full dark mode implementation
- **Skeleton Loaders**: Smooth loading states
- **60fps Animations**: Smooth and performant animations
- **Responsive Design**: Works on all screen sizes

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📈 Performance

- **App Size**: ~45MB (compressed)
- **Startup Time**: <2 seconds
- **Location Update Interval**: 30 seconds (background)
- **Bundler**: Metro with optimizations

## 🐛 Known Issues & Limitations

1. **Web Platform**: Map visualization not available on web
2. **iOS Background**: May need app approval for background location
3. **Accuracy**: GPS accuracy ~5-10 meters

## 🔄 Future Enhancements

- [ ] Biometric authentication (Face/Fingerprint)
- [ ] QR code check-in option
- [ ] Advanced analytics dashboard
- [ ] Attendance penalties system
- [ ] Parent/Guardian notifications
- [ ] Multiple campus support
- [ ] API for third-party integration

## 📝 API Documentation

See `/docs/API.md` for detailed API documentation.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Kamal Nayan**
- GitHub: [@nayankamal305-hub](https://github.com/nayankamal305-hub)
- Email: kamalnayan305@gmail.com
- Location: Bihar, India

## 🎓 Educational Context

Developed as part of first-year Computer Science (AI Specialization) coursework at Vedam School of Technology, Bihar.

## 📞 Support & Contact

For issues, feature requests, or questions:
- Open an issue on GitHub
- Email: kamalnayan305@gmail.com
- LinkedIn: [Kamal Nayan](https://linkedin.com)

## 🙏 Acknowledgments

- Expo team for excellent React Native tooling
- Firebase for backend services
- React Navigation for routing
- Community contributors

---

**Made with ❤️ by Kamal Nayan**

Last Updated: December 6, 2025
