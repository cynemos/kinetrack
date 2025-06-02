import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, User, MapPin, Phone, Mail, Building, Award, FileText } from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  rpps: string;
  adeli: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  specializations: string[];
  conventionnement: 'secteur1' | 'secteur2';
  diplomas: string[];
  formations: string[];
  bio: string;
}

const initialProfileData: ProfileData = {
  firstName: '',
  lastName: '',
  rpps: '',
  adeli: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  specializations: [],
  conventionnement: 'secteur1',
  diplomas: [],
  formations: [],
  bio: ''
};

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [saving, setSaving] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newDiploma, setNewDiploma] = useState('');
  const [newFormation, setNewFormation] = useState('');
  const { db } = useFirebase();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.uid) return;

      try {
        const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
        if (profileDoc.exists()) {
          setProfileData(profileDoc.data() as ProfileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [db, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (field: 'specializations' | 'diplomas' | 'formations', value: string) => {
    if (!value.trim()) return;
    
    setProfileData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));

    // Reset the corresponding input
    if (field === 'specializations') setNewSpecialization('');
    if (field === 'diplomas') setNewDiploma('');
    if (field === 'formations') setNewFormation('');
  };

  const handleRemoveItem = (field: 'specializations' | 'diplomas' | 'formations', index: number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <User className="w-6 h-6 mr-2" />
          Profil professionnel
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Informations personnelles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="rpps" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro RPPS
              </label>
              <input
                type="text"
                id="rpps"
                name="rpps"
                value={profileData.rpps}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="adeli" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro ADELI
              </label>
              <input
                type="text"
                id="adeli"
                name="adeli"
                value={profileData.adeli}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Coordonnées professionnelles
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adresse
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="w-4 h-4 inline mr-1" />
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={profileData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={profileData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Informations professionnelles
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spécialisations
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ajouter une spécialisation..."
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('specializations', newSpecialization)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-50 text-teal-700"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('specializations', index)}
                      className="ml-2 text-teal-500 hover:text-teal-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="conventionnement" className="block text-sm font-medium text-gray-700 mb-1">
                Conventionnement
              </label>
              <select
                id="conventionnement"
                name="conventionnement"
                value={profileData.conventionnement}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="secteur1">Secteur 1</option>
                <option value="secteur2">Secteur 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4 inline mr-1" />
                Diplômes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newDiploma}
                  onChange={(e) => setNewDiploma(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ajouter un diplôme..."
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('diplomas', newDiploma)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.diplomas.map((diploma, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                  >
                    {diploma}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('diplomas', index)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Formations complémentaires
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFormation}
                  onChange={(e) => setNewFormation(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ajouter une formation..."
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('formations', newFormation)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.formations.map((formation, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700"
                  >
                    {formation}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('formations', index)}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Présentation
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Présentez votre parcours et votre approche professionnelle..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;