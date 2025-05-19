import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, getDocs } from 'firebase/firestore';
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadarController
} from 'chart.js';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadarController
);

interface PathologyData {
  name: string;
  count: number;
  anatomicalAreas: { [key: string]: number };
  techniques: { [key: string]: number };
  relatedPathologies: { [key: string]: number };
  avgAge: number;
  genderDistribution: { M: number; F: number };
}

const Statistics: React.FC = () => {
  const [consultationsData, setConsultationsData] = useState<any[]>([]);
  const [patientsData, setPatientsData] = useState<any[]>([]);
  const [pathologyStats, setPathologyStats] = useState<{ [key: string]: PathologyData }>({});
  const [loading, setLoading] = useState(true);
  const { db } = useFirebase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch consultations
        const consultationsSnapshot = await getDocs(collection(db, 'consultations'));
        const consultations = consultationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConsultationsData(consultations);

        // Fetch patients
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const patients = patientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPatientsData(patients);
        // Analyze pathologies
        const pathologyAnalysis: { [key: string]: PathologyData } = {};

        consultations.forEach(consultation => {
          const reasons = consultation.reasons || [];
          const patient = patients.find(p => p.id === consultation.patientId);

          reasons.forEach(reason => {
            if (!pathologyAnalysis[reason]) {
              pathologyAnalysis[reason] = {
                name: reason,
                count: 0,
                anatomicalAreas: {},
                techniques: {},
                relatedPathologies: {},
                avgAge: 0,
                genderDistribution: { M: 0, F: 0 }
              };
            }

            pathologyAnalysis[reason].count++;

            // Analyze patterns to deduce related pathologies
            const anatomicalPattern = consultation.anatomicalAreas || [];
            const techniquesPattern = consultation.techniques?.map(t => 
              typeof t === 'string' ? t : t.name
            ) || [];

            // Define pathology patterns
            const pathologyPatterns = {
              'Syndrome cervical': {
                areas: ['cou', 'epaule_gauche', 'epaule_droite'],
                techniques: ['Massage', 'Mobilisations passives', 'Étirements']
              },
              'Syndrome lombaire': {
                areas: ['bas_dos', 'bassin'],
                techniques: ['Massage', 'Étirements', 'Renforcement musculaire']
              },
              'Troubles posturaux': {
                areas: ['haut_dos', 'bas_dos', 'cou'],
                techniques: ['Renforcement musculaire', 'Étirements']
              },
              'Syndrome de l\'épaule': {
                areas: ['epaule_gauche', 'epaule_droite'],
                techniques: ['Mobilisations passives', 'Renforcement musculaire']
              }
            };

            // Check patterns and update related pathologies
            Object.entries(pathologyPatterns).forEach(([pathology, pattern]) => {
              const hasRequiredAreas = pattern.areas.some(area => 
                anatomicalPattern.includes(area)
              );
              const hasRequiredTechniques = pattern.techniques.some(technique =>
                techniquesPattern.includes(technique)
              );

              if (hasRequiredAreas && hasRequiredTechniques) {
                pathologyAnalysis[reason].relatedPathologies[pathology] = 
                  (pathologyAnalysis[reason].relatedPathologies[pathology] || 0) + 1;
              }
            });

            // Count anatomical areas
            consultation.anatomicalAreas?.forEach(area => {
              pathologyAnalysis[reason].anatomicalAreas[area] = 
                (pathologyAnalysis[reason].anatomicalAreas[area] || 0) + 1;
            });

            // Count techniques
            consultation.techniques?.forEach(technique => {
              const techniqueName = typeof technique === 'string' ? technique : technique.name;
              pathologyAnalysis[reason].techniques[techniqueName] = 
                (pathologyAnalysis[reason].techniques[techniqueName] || 0) + 1;
            });

            // Update gender distribution
            if (patient?.gender) {
              pathologyAnalysis[reason].genderDistribution[patient.gender]++;
            }

            // Update average age
            if (patient?.birthDate) {
              const age = calculateAge(patient.birthDate);
              const currentAvg = pathologyAnalysis[reason].avgAge;
              const currentCount = pathologyAnalysis[reason].count;
              pathologyAnalysis[reason].avgAge = 
                (currentAvg * (currentCount - 1) + age) / currentCount;
            }
          });
        });

        setPathologyStats(pathologyAnalysis);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Prepare data for consultations per month chart
  const getConsultationsPerMonth = () => {
    const monthsData = new Array(12).fill(0);
    consultationsData.forEach(consultation => {
      const date = new Date(consultation.date);
      monthsData[date.getMonth()]++;
    });

    return {
      labels: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ],
      datasets: [{
        label: 'Consultations par mois',
        data: monthsData,
        backgroundColor: 'rgba(20, 184, 166, 0.5)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 1
      }]
    };
  };

  // Prepare data for consultation types chart
  const getConsultationTypes = () => {
    const types = {
      bilan: 0,
      seance: { cabinet: 0, domicile: 0 }
    };

    consultationsData.forEach(consultation => {
      if (consultation.type === 'bilan') {
        types.bilan++;
      } else {
        consultation.isHomeVisit
          ? types.seance.domicile++
          : types.seance.cabinet++;
      }
    });

    return {
      labels: ['Bilan initial', 'Séance cabinet', 'Visite à domicile'],
      datasets: [{
        data: [types.bilan, types.seance.cabinet, types.seance.domicile],
        backgroundColor: [
          'rgba(245, 158, 11, 0.5)',
          'rgba(20, 184, 166, 0.5)',
          'rgba(147, 51, 234, 0.5)'
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(13, 148, 136)',
          'rgb(147, 51, 234)'
        ],
        borderWidth: 1
      }]
    };
  };

  // Prepare data for patient evolution chart
  const getPatientEvolution = () => {
    const sortedConsultations = [...consultationsData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Create a map to track unique patients per date
    const patientsByDate = new Map<string, Set<string>>();
    
    sortedConsultations.forEach(consultation => {
      const dateKey = new Date(consultation.date).toLocaleDateString('fr-FR');
      if (!patientsByDate.has(dateKey)) {
        patientsByDate.set(dateKey, new Set());
      }
      patientsByDate.get(dateKey)?.add(consultation.patientId);
    });

    // Convert map to array and calculate cumulative patient count
    let totalPatients = new Set<string>();
    const evolution = Array.from(patientsByDate.entries()).map(([date, patients]) => {
      patients.forEach(patientId => totalPatients.add(patientId));
      return {
        date,
        count: totalPatients.size
      };
    });

    return {
      labels: evolution.map(e => e.date),
      datasets: [{
        label: 'Évolution du nombre de patients',
        data: evolution.map(e => e.count),
        borderColor: 'rgb(13, 148, 136)',
        backgroundColor: 'rgba(20, 184, 166, 0.5)',
        tension: 0.4
      }]
    };
  };

  // Prepare data for pathology analysis
  const getPathologyAnalysisData = (pathology: string) => {
    const stats = pathologyStats[pathology];
    if (!stats) return null;

    // Get top 5 anatomical areas
    const topAreas = Object.entries(stats.anatomicalAreas)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: topAreas.map(([area]) => area),
      datasets: [{
        label: 'Zones traitées',
        data: topAreas.map(([, count]) => count),
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 1,
        pointBackgroundColor: 'rgb(13, 148, 136)'
      }]
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
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          Statistiques
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Consultations par mois
          </h3>
          <Bar
            data={getConsultationsPerMonth()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Types de consultations
          </h3>
          <div className="aspect-square">
            <Pie
              data={getConsultationTypes()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Analyse par pathologie
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(pathologyStats)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([pathology, stats]) => (
                <div key={pathology} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">{pathology}</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      Nombre de cas: <span className="font-medium">{stats.count}</span>
                    </p>
                    {Object.entries(stats.relatedPathologies).length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Pathologies associées:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(stats.relatedPathologies)
                            .sort(([, a], [, b]) => b - a)
                            .map(([pathology, count]) => (
                              <span
                                key={pathology}
                                className="inline-block px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-md"
                                title={`${count} cas`}
                              >
                                {pathology}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    <p className="text-gray-600">
                      Âge moyen: <span className="font-medium">{Math.round(stats.avgAge)} ans</span>
                    </p>
                    <div className="flex gap-4">
                      <p className="text-gray-600">
                        Hommes: <span className="font-medium">{stats.genderDistribution.M}</span>
                      </p>
                      <p className="text-gray-600">
                        Femmes: <span className="font-medium">{stats.genderDistribution.F}</span>
                      </p>
                    </div>
                    {getPathologyAnalysisData(pathology) && (
                      <div className="mt-4 h-48">
                        <Radar
                          data={getPathologyAnalysisData(pathology)}
                          options={{
                            scales: {
                              r: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 1
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Évolution du nombre de patients suivis
          </h3>
          <Line
            data={getPatientEvolution()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Statistics;