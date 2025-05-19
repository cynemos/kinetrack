import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Save, X } from 'lucide-react';

interface PatientFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  medicalHistory: string;
  notes: string;
  status: 'active' | 'inactive';
}

const initialFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  phone: '',
  email: '',
  medicalHistory: '',
  notes: '',
  status: 'active'
};

const PatientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const navigate = useNavigate();
  const { db } = useFirebase();
  const isEditMode = !!id;

  useEffect(() => {
    const fetchPatient = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        const patientDoc = await getDoc(doc(db, 'patients', id));
        
        if (patientDoc.exists()) {
          const patientData = patientDoc.data() as PatientFormData;
          setFormData({
            firstName: patientData.firstName || '',
            lastName: patientData.lastName || '',
            birthDate: patientData.birthDate || '',
            gender: patientData.gender || '',
            phone: patientData.phone || '',
            email: patientData.email || '',
            medicalHistory: patientData.medicalHistory || '',
            notes: patientData.notes || '',
            status: patientData.status || 'active'
          });
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
    
    fetchPatient();
  }, [db, id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name as keyof PatientFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Le genre est requis';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      if (isEditMode) {
        // Update existing patient
        await updateDoc(doc(db, 'patients', id), {
          ...formData,
          status: formData.status || 'active', // Ensure status is set
          updatedAt: serverTimestamp()
        });
        
        navigate(`/patients/${id}`);
      } else {
        // Create new patient
        const docRef = await addDoc(collection(db, 'patients'), {
          ...formData,
          status: 'active', // Set status to active for new patients
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        navigate(`/patients/${docRef.id}`);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      setSaving(false);
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Modifier le patient' : 'Nouveau patient'}
        </h2>
        <button
          onClick={() => navigate(isEditMode ? `/patients/${id}` : '/patients')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5 mr-1" />
          <span>Annuler</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de naissance
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                errors.gender ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner...</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut du suivi
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
          >
            <option value="active">Patient suivi</option>
            <option value="inactive">Patient non suivi</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
            Antécédents médicaux
          </label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            placeholder="Allergies, interventions chirurgicales, traitements en cours..."
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            placeholder="Informations complémentaires..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-5 h-5 mr-2" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;