import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { AuthProvider } from './contexts/AuthContext';
import { FirebaseProvider } from './contexts/FirebaseContext';

// Pages
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import ConsultationForm from './pages/ConsultationForm';
import Login from './pages/Login';
import Help from './pages/Help';
import Reports from './pages/Reports';
import About from './pages/About';
import PatientForm from './pages/PatientForm';
import Settings from './pages/Settings';
import FinancialDashboard from './pages/FinancialDashboard';
import Statistics from './pages/Statistics';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function App() {
  return (
    <Router>
      <FirebaseProvider app={app} db={db} auth={auth}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<PatientList />} />
              <Route path="patients/new" element={<PatientForm />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="patients/:id/edit" element={<PatientForm />} />
              <Route path="patients/:id/consultation/new" element={<ConsultationForm />} />
              <Route path="patients/:id/consultation/:consultationId" element={<ConsultationForm />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="help" element={<Help />} />
              <Route path="reports" element={<Reports />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="about" element={<About />} />
              <Route path="settings" element={<Settings />} />
              <Route path="financial" element={<FinancialDashboard />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </AuthProvider>
      </FirebaseProvider>
    </Router>
  );
}

export default App;