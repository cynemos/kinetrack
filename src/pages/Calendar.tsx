import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Plus, X, Search, Trash2, Eye, ArrowLeft } from 'lucide-react';

type CalendarView = 'day' | 'week';

interface Consultation {
  id: string;
  date: string;
  type?: 'bilan' | 'seance';
  isHomeVisit?: boolean;
  patientId: string;
  patientName: string;
  reason: string;
  notes: string;
  techniques: string[];
  anatomicalAreas: string[];
  recommendations: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface NewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onCreateConsultation: (patientId: string, patientName: string) => void;
}

// Move formatDateTime function to module scope so it's accessible to all components
const formatDateTime = (date: Date) => {
  return date.toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onCreateConsultation
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { db } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'patients'));
        const patientsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Patient));
        setPatients(patientsList);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPatients();
    }
  }, [db, isOpen]);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Nouvelle consultation
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            {formatDateTime(selectedDate)}
          </p>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto mb-6">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredPatients.length > 0 ? (
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => onCreateConsultation(
                      patient.id,
                      `${patient.lastName} ${patient.firstName}`
                    )}
                    className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800">
                      {patient.lastName} {patient.firstName}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Aucun patient trouvé
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => navigate('/patients/new')}
              className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Nouveau patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Calendar: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const navigate = useNavigate();
  const { db } = useFirebase();

  // Time slots from 9:00 to 19:00
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minutes = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  // Days of the week (Monday to Friday)
  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        // Get the start and end of the current week
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4);
        endOfWeek.setHours(23, 59, 59, 999);

        const q = query(
          collection(db, 'consultations'),
          where('date', '>=', startOfWeek.toISOString()),
          where('date', '<=', endOfWeek.toISOString())
        );

        const querySnapshot = await getDocs(q);
        const consultationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Consultation));

        setConsultations(consultationsData);
      } catch (error) {
        console.error('Error fetching consultations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [db, currentDate]);

  const getConsultationsForSlot = (day: number, timeSlot: string) => {
    const date = new Date(currentDate);
    if (view === 'week') {
      date.setDate(date.getDate() - date.getDay() + day + 1);
    }
    const [hours, minutes] = timeSlot.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return consultations.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      return consultationDate.getTime() === date.getTime();
    });
  };

  const handleTimeSlotClick = (day: number, timeSlot: string) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay() + day + 1);
    const [hours, minutes] = timeSlot.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCreateConsultation = async (patientId: string, patientName: string) => {
    if (!selectedDate) return;

    // Validate that the time is on hour or half hour
    const minutes = selectedDate.getMinutes();
    if (minutes !== 0 && minutes !== 30) {
      alert('L\'horaire doit être à l\'heure pile ou à la demi-heure');
      return;
    }

    try {
      const consultationData = {
        patientId,
        patientName,
        date: selectedDate.toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'consultations'), consultationData);
      navigate(`/patients/${patientId}/consultation/${docRef.id}`);
    } catch (error) {
      console.error('Error creating consultation:', error);
    }
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const formatWeekRange = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 4);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric',
        month: 'long'
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const formatDayRange = () => {
    return currentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
    }
    setCurrentDate(newDate);
  };

  const getCurrentRange = () => {
    switch (view) {
      case 'day':
        return formatDayRange();
      case 'week':
        return formatWeekRange();
      default:
        return '';
    }
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
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'day'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'week'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Semaine
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-gray-600 font-medium">
            {getCurrentRange()}
          </span>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 border-b">
          <div className="p-4 text-sm font-medium text-gray-500 border-r">
            Horaire
          </div>
          {view === 'day' ? (
            <div className="p-4 text-sm font-medium text-gray-700 text-center border-r last:border-r-0 col-span-5">
              {formatDayRange()}
            </div>
          ) : (
            weekDays.map((day, index) => (
              <div key={day} className="p-4 text-sm font-medium text-gray-700 text-center border-r last:border-r-0">
                {day}
              </div>
            ))
          )}
        </div>

        <div className="divide-y">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="grid grid-cols-6">
              <div className="p-2 text-sm text-gray-500 border-r">
                {timeSlot}
              </div>
              {view === 'day' ? (
                <div 
                  onClick={() => handleTimeSlotClick(currentDate.getDay() - 1, timeSlot)}
                  className={`col-span-5 p-2 border-r last:border-r-0 min-h-[60px] cursor-pointer hover:bg-gray-50 ${
                    getConsultationsForSlot(currentDate.getDay() - 1, timeSlot).length > 0 ? 'bg-teal-50' : ''
                  }`}
                >
                  <div className="space-y-1">
                    {getConsultationsForSlot(currentDate.getDay() - 1, timeSlot).map((consultation) => (
                      <div 
                        key={consultation.id}
                        className={`group flex items-center justify-between text-sm px-2 py-1 rounded transition-colors ${
                          consultation.type === 'bilan'
                            ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                            : consultation.isHomeVisit
                              ? 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                              : 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-100'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span 
                          className="truncate cursor-pointer flex-grow"
                          onClick={() => navigate(`/patients/${consultation.patientId}/consultation/${consultation.id}`)}
                        >
                          {consultation.patientName}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedConsultation(consultation)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-teal-600 transition-all"
                            title="Voir le résumé"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {deleteConfirmation === consultation.id ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleDeleteConsultation(consultation.id)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmation(consultation.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                weekDays.map((_, dayIndex) => {
                  const slotConsultations = getConsultationsForSlot(dayIndex, timeSlot);
                  return (
                    <div 
                      key={dayIndex}
                      onClick={() => handleTimeSlotClick(dayIndex, timeSlot)}
                      className={`p-2 border-r last:border-r-0 min-h-[60px] cursor-pointer hover:bg-gray-50 ${
                        slotConsultations.length > 0 ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        {slotConsultations.map((consultation) => (
                          <div 
                            key={consultation.id}
                            className={`group flex items-center justify-between text-sm px-2 py-1 rounded transition-colors ${
                              consultation.type === 'bilan'
                                ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                                : consultation.isHomeVisit
                                  ? 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                                  : 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-100'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span 
                              className="truncate cursor-pointer flex-grow"
                              onClick={() => navigate(`/patients/${consultation.patientId}/consultation/${consultation.id}`)}
                            >
                              {consultation.patientName}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedConsultation(consultation)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-teal-600 transition-all"
                                title="Voir le résumé"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {deleteConfirmation === consultation.id ? (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleDeleteConsultation(consultation.id)}
                                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                                  >
                                    Confirmer
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmation(null)}
                                    className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmation(consultation.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedDate && (
        <NewConsultationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          selectedDate={selectedDate}
          onCreateConsultation={handleCreateConsultation}
        />
      )}
      
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
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="text-gray-800">{selectedConsultation.patientName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-gray-800">{formatDateTime(new Date(selectedConsultation.date))}</p>
                  {selectedConsultation.isHomeVisit && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                      Visite à domicile
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Motif</p>
                  <p className="text-gray-800">{selectedConsultation.reason}</p>
                </div>
                
                {selectedConsultation.techniques?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Techniques utilisées</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsultation.techniques.map((technique: string | { name: string, muscleGroups?: string[] }, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                        >
                          {typeof technique === 'string' ? technique : technique.name}
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
                          {area}
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

export default Calendar;