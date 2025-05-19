import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import {
  User, Edit, Calendar, Phone, Mail,
  ClipboardList, Plus, ChevronRight, Info, Trash2,
  Stethoscope, FileEdit, Eye, ArrowLeft,
} from 'lucide-react';
import AnatomicalDiagram from '../components/AnatomicalDiagram';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
  medicalHistory?: string;
  notes?: string;
}

interface Technique {
  name: string;
  muscleGroups?: string[];
}

interface Consultation {
  id: string;
  date: string;
  reason: string;
  type?: 'bilan' | 'seance';
  notes: string;
  anamnesis?: string;
  pain?: string;
  jointMuscularExam?: string;
  functionalExam?: string;
  techniques: (string | Technique)[];
  anatomicalAreas: string[];
  recommendations: string;
  isHomeVisit?: boolean;
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialAssessment, setInitialAssessment] = useState<Consultation | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const navigate = useNavigate();
  const { db } = useFirebase();
  
  // Mapping for French translations of anatomical areas
  const anatomicalAreaTranslations: { [key: string]: string } = {
    tete: 'Tête',
    cou: 'Cou',
    epaule_gauche: 'Épaule gauche',
    epaule_droite: 'Épaule droite',
    haut_dos: 'Haut du dos',
    bras_gauche: 'Bras gauche',
    bras_droit: 'Bras droit',
    bas_dos: 'Bas du dos',
    bassin: 'Bassin',
    jambe_gauche: 'Jambe gauche',
    jambe_droite: 'Jambe droite',
    pied_gauche: 'Pied gauche',
    pied_droit: 'Pied droit',
    abdomen: 'Abdomen',
    thorax: 'Thorax',
    main_gauche: 'Main gauche',
    main_droite: 'Main droite',
    genou_gauche: 'Genou gauche',
    genou_droit: 'Genou droit',
    back_lower: 'Bas du dos',
    leg_left: 'Jambe gauche',
    knee_left: 'Genou gauche',
    foot_left: 'Pied gauche'
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      
      try {
        // Fetch patient data
        const patientDoc = await getDoc(doc(db, 'patients', id));
        
        if (patientDoc.exists()) {
          setPatient({
            id: patientDoc.id,
            ...patientDoc.data()
          } as Patient);
          
          // Fetch patient consultations
          const consultationsQuery = query(
            collection(db, 'consultations'),
            where('patientId', '==', id),
            orderBy('date', 'desc')
          );
          
          const consultationsSnapshot = await getDocs(consultationsQuery);
          const consultationsData = consultationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Consultation));

          // Find the initial assessment (first consultation of type 'bilan')
          const assessment = consultationsData.find(c => c.type === 'bilan');
          if (assessment) {
            setInitialAssessment(assessment);
          }
          
          setConsultations(consultationsData);
        } else {
          console.error('Patient not found');
          navigate('/patients');
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [db, id, navigate]);

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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getTechniqueName = (technique: string | Technique): string => {
    if (typeof technique === 'string') {
      return technique;
    }
    return technique.name;
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    try {
      await deleteDoc(doc(db, 'consultations', consultationId));
      setConsultations(prev => prev.filter(c => c.id !== consultationId));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting consultation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Patient non trouvé</p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/patients')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {patient.lastName} {patient.firstName}
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/patients/${id}/edit`)}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            <span>Modifier</span>
          </button>
          
          <button
            onClick={() => navigate(`/patients/${id}/consultation/new`)}
            className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Nouvelle consultation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-teal-100 p-3 rounded-full">
                <User className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {patient.lastName} {patient.firstName}
                </h3>
                <p className="text-gray-500">
                  {patient.gender === 'M' ? 'Homme' : 'Femme'}, {calculateAge(patient.birthDate)} ans
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="text-gray-800">{formatDate(patient.birthDate)}</p>
                </div>
              </div>
              
              {patient.phone && (
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-gray-800">{patient.phone}</p>
                  </div>
                </div>
              )}
              
              {patient.email && (
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{patient.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-gray-500" />
              Antécédents médicaux
            </h3>
            <div className="text-gray-700 whitespace-pre-wrap">
              {patient.medicalHistory || 'Aucun antécédent renseigné'}
            </div>
            {initialAssessment && (
              <button
                onClick={() => setSelectedConsultation(initialAssessment)}
                className="mt-4 flex items-center text-teal-600 hover:text-teal-800 transition-colors"
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                <span className="text-sm">Voir le bilan initial</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-gray-500" />
              Notes
            </h3>
            <div className="text-gray-700 whitespace-pre-wrap">
              {patient.notes || 'Aucune note'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Historique des consultations
            </h3>
            
            {consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="border border-gray-100 rounded-lg hover:border-gray-200 transition-colors cursor-pointer"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                            consultation.type === 'bilan'
                              ? 'bg-amber-500'
                              : consultation.isHomeVisit
                                ? 'bg-purple-500'
                                : 'bg-teal-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-800">{consultation.reason}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{formatDateTime(consultation.date)}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                consultation.type === 'bilan'
                                  ? 'bg-amber-50 text-amber-700'
                                  : consultation.isHomeVisit
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'bg-teal-50 text-teal-700'
                              }`}>
                                {consultation.type === 'bilan'
                                  ? 'Bilan initial'
                                  : consultation.isHomeVisit
                                    ? 'À domicile'
                                    : 'Au cabinet'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConsultation(consultation);
                            }}
                            className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                            title="Voir le résumé"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patients/${id}/consultation/${consultation.id}`);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <FileEdit className="w-5 h-5" />
                          </button>
                          {deleteConfirmation === consultation.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConsultation(consultation.id);
                                }}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmation(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmation(consultation.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {consultation.techniques?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Techniques</p>
                          <div className="flex flex-wrap gap-1">
                            {consultation.techniques.map((technique, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                              >
                                {getTechniqueName(technique)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {consultation.anatomicalAreas?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Zones traitées</p>
                          <div className="flex flex-wrap gap-1">
                            {consultation.anatomicalAreas.map((area, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-md"
                              >
                                {anatomicalAreaTranslations[area] || area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucune consultation enregistrée</p>
                <button
                  onClick={() => navigate(`/patients/${id}/consultation/new`)}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Nouvelle consultation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Consultation Summary Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Résumé de la consultation
                </h3>
                <button
                  onClick={() => setSelectedConsultation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-gray-800">{formatDateTime(selectedConsultation.date)}</p>
                </div>
                
                {selectedConsultation.type === 'bilan' ? (
                  <>
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-500 mb-2">Zones anatomiques concernées</p>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <AnatomicalDiagram
                          selectedAreas={selectedConsultation.anatomicalAreas || []}
                          onAreaSelect={() => {}}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Anamnèse</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedConsultation.anamnesis}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Évaluation de la douleur</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedConsultation.pain}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Examen articulaire/musculaire</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedConsultation.jointMuscularExam}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Examen fonctionnel</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedConsultation.functionalExam}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Motif</p>
                    <p className="text-gray-800">{selectedConsultation.reason}</p>
                  </div>
                )}
                
                {selectedConsultation.techniques?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Techniques utilisées</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsultation.techniques.map((technique, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                        >
                          {getTechniqueName(technique)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedConsultation.anatomicalAreas?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Zones traitées</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsultation.anatomicalAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-sm"
                        >
                          {anatomicalAreaTranslations[area] || area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedConsultation.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Notes cliniques</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedConsultation.notes}</p>
                  </div>
                )}
                
                {selectedConsultation.recommendations && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recommandations</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedConsultation.recommendations}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;