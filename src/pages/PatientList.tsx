import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { UserPlus, Search, SortDesc, Filter, Trash2, FileEdit, ToggleLeft, ToggleRight } from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone?: string;
  email?: string;
  lastConsultation?: string;
  status: 'active' | 'inactive';
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const navigate = useNavigate();
  const { db } = useFirebase();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(
          collection(db, 'patients'),
          orderBy('lastName')
        );
        const querySnapshot = await getDocs(q);
        const patientsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: doc.data().status || 'active' // Set default status to active if not specified
        } as Patient));
        
        setPatients(patientsList);
        setFilteredPatients(patientsList);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [db]);

  useEffect(() => {
    // Filter patients based on search term
    const filtered = patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    // Sort patients
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
      } else {
        // Sort by date (most recent first)
        const dateA = a.lastConsultation ? new Date(a.lastConsultation).getTime() : 0;
        const dateB = b.lastConsultation ? new Date(b.lastConsultation).getTime() : 0;
        return dateB - dateA;
      }
    });
    
    setFilteredPatients(sorted);
  }, [patients, searchTerm, sortBy, statusFilter]);

  const handleToggleStatus = async (patientId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'patients', patientId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === patientId
            ? { ...patient, status: newStatus }
            : patient
        )
      );
    } catch (error) {
      console.error('Error updating patient status:', error);
    }
  };

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
      setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Patients</h2>
        <button
          onClick={() => navigate('/patients/new')}
          className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          <span>Nouveau patient</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-teal-50 text-teal-700 border-teal-200"
              >
                <option value="active">Patients suivis</option>
                <option value="all">Tous les patients</option>
                <option value="inactive">Patients non suivis</option>
              </select>

              <button
                onClick={() => setSortBy('name')}
                className={`flex items-center px-3 py-2 rounded-md border ${
                  sortBy === 'name' 
                    ? 'bg-teal-50 border-teal-200 text-teal-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SortDesc className="w-4 h-4 mr-2" />
                <span>Nom</span>
              </button>
              
              <button
                onClick={() => setSortBy('date')}
                className={`flex items-center px-3 py-2 rounded-md border ${
                  sortBy === 'date' 
                    ? 'bg-teal-50 border-teal-200 text-teal-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span>Récent</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Âge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière consultation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          patient.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                        }`} title={patient.status === 'active' ? 'Patient suivi' : 'Patient non suivi'} />
                        <span className="text-sm font-medium text-gray-900">
                        {patient.lastName} {patient.firstName}
                        </span>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="text-sm text-gray-500">
                        {patient.birthDate ? `${calculateAge(patient.birthDate)} ans` : 'N/A'}
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="text-sm text-gray-500">
                        {patient.phone || patient.email || 'Non renseigné'}
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="text-sm text-gray-500">
                        {formatDate(patient.lastConsultation)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(patient.id, patient.status || 'active')}
                          className={`text-gray-400 hover:text-teal-600 transition-colors`}
                          title={patient.status === 'active' ? 'Marquer comme non suivi' : 'Marquer comme suivi'}
                        >
                          {patient.status === 'active' ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/patients/${patient.id}/edit`)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <FileEdit className="w-5 h-5" />
                        </button>
                      {deleteConfirmation === patient.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation(null)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmation(patient.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm 
                      ? 'Aucun patient trouvé pour cette recherche'
                      : 'Aucun patient dans la base de données'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;