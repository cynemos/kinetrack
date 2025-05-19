import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { Calendar, UserRound, ClipboardList, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  lastConsultation?: string;
}

interface Consultation {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  reason: string;
}

const Dashboard: React.FC = () => {
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [activityData, setActivityData] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { db } = useFirebase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent patients
        const patientsQuery = query(
          collection(db, 'patients'),
          orderBy('lastConsultation', 'desc'),
          limit(5)
        );
        
        const patientsSnapshot = await getDocs(patientsQuery);
        const patientsData = patientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Patient));
        
        setRecentPatients(patientsData);
        
        // Fetch recent consultations
        const consultationsQuery = query(
          collection(db, 'consultations'),
          orderBy('date', 'desc'),
          limit(5)
        );
        
        const consultationsSnapshot = await getDocs(consultationsQuery);
        let consultationsData = consultationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Consultation));
        
        setRecentConsultations(consultationsData);
        
        // Fetch last 30 days of consultations for activity chart
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activityQuery = query(
          collection(db, 'consultations'),
          orderBy('date', 'desc')
        );
        
        const activitySnapshot = await getDocs(activityQuery);
        const activityData = activitySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Consultation))
          .filter(consultation => {
            const consultationDate = new Date(consultation.date);
            return consultationDate >= thirtyDaysAgo;
          });
        
        setActivityData(activityData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [db]);

  // Format date to French format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getActivityChartData = () => {
    const dates = new Array(30).fill(0).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - index));
      return date;
    });

    const consultationsPerDay = dates.map(date => {
      return activityData.filter(consultation => {
        const consultationDate = new Date(consultation.date);
        return (
          consultationDate.getDate() === date.getDate() &&
          consultationDate.getMonth() === date.getMonth() &&
          consultationDate.getFullYear() === date.getFullYear()
        );
      }).length;
    });

    return {
      labels: dates.map(date => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
      datasets: [
        {
          label: 'Consultations',
          data: consultationsPerDay,
          borderColor: 'rgb(13, 148, 136)',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          <span>{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">Activité des 30 derniers jours</h3>
          <div className="h-64">
            <Line
              data={getActivityChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Patients récents</h3>
            <button
              onClick={() => navigate('/patients')}
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              Voir tous
            </button>
          </div>
          
          <div className="space-y-3">
            {recentPatients.length > 0 ? (
              recentPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-teal-100 p-2 rounded-full mr-3">
                    <UserRound className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {patient.lastName} {patient.firstName}
                    </p>
                    {patient.lastConsultation && (
                      <p className="text-xs text-gray-500">
                        Dernière visite: {formatDate(patient.lastConsultation)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-2">Aucun patient récent</p>
            )}
          </div>
          
          <button
            onClick={() => navigate('/patients/new')}
            className="mt-4 w-full flex items-center justify-center py-2 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 transition-colors"
          >
            <span>Nouveau patient</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Consultations récentes</h3>
          </div>
          
          <div className="space-y-3">
            {recentConsultations.length > 0 ? (
              recentConsultations.map(consultation => (
                <div
                  key={consultation.id}
                  onClick={() => navigate(`/patients/${consultation.patientId}/consultation/${consultation.id}`)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {consultation.patientName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(consultation.date)} - {consultation.reason}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-2">Aucune consultation récente</p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-teal-600" />
            <h3 className="font-semibold text-lg">Activité récente</h3>
          </div>
          
          <div className="space-y-4">
            <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:bg-teal-500 before:rounded-full">
              <p className="text-sm text-gray-700">Dernière connexion</p>
              <p className="text-xs text-gray-500">Aujourd'hui, 09:45</p>
            </div>
            
            <div className="border-b border-gray-100 my-2"></div>
            
            <p className="text-center text-sm text-gray-500">
              Bienvenue sur votre tableau de bord KinéTrack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;