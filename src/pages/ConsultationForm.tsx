import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { 
  doc, getDoc, addDoc, updateDoc, collection, 
  serverTimestamp, Timestamp, arrayUnion, getDocs,
  query, where, orderBy, limit
} from 'firebase/firestore';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import AnatomicalDiagram from '../components/AnatomicalDiagram';
import TechniqueSelector from '../components/TechniqueSelector';
import OpenAI from 'openai';
import { Brain } from 'lucide-react';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface ConsultationFormData {
  date: string;
  type: 'bilan' | 'seance';
  riskFactors?: string[];
  isHomeVisit: boolean;
  reasons: string[];
  customReason: string;
  notes: string;
  anamnesis: string;
  pain: string;
  jointMuscularExam: string;
  functionalExam: string;
  techniques: Array<{
    category: 'active' | 'passive' | 'manual' | 'respiratory' | 'instrumental' | 'complementary';
    name: string;
    description?: string;
    targetGroups?: string[];
    purpose?: string;
  }>;
  anatomicalAreas: string[];
  recommendations: string;
  evolution: string;
  nextSessionNotes: string;
}

const initialFormData: ConsultationFormData = {
  date: new Date().toISOString().substring(0, 16), // format: YYYY-MM-DDThh:mm
  type: 'seance',
  riskFactors: [],
  isHomeVisit: false,
  reasons: [],
  customReason: '',
  notes: '',
  anamnesis: '',
  pain: '',
  jointMuscularExam: '',
  functionalExam: '',
  techniques: [],
  anatomicalAreas: [],
  recommendations: '',
  evolution: '',
  nextSessionNotes: ''
};

const muscleGroups = [
  'Quadriceps', 'Ischio-jambiers', 'Mollets',
  'Fessiers', 'Abdominaux', 'Lombaires',
  'Dorsaux', 'Trapèzes', 'Deltoïdes',
  'Biceps', 'Triceps', 'Pectoraux'
];

// Predefined options for quick selection
const predefinedReasons = [
  // Troubles musculo-squelettiques
  'Cervicalgie aiguë', 'Cervicalgie chronique', 'Torticolis',
  'Dorsalgie haute', 'Dorsalgie moyenne', 'Dorsalgie basse',
  'Lombalgie aiguë', 'Lombalgie chronique', 'Sciatique',
  'Cruralgie', 'Névralgie cervico-brachiale',
  
  // Pathologies articulaires
  'Arthrose cervicale', 'Arthrose lombaire',
  'Tendinite épaule', 'Capsulite épaule', 'Rupture coiffe rotateurs',
  'Tendinite genou', 'Syndrome rotulien', 'Entorse genou',
  'Entorse cheville', 'Tendinite achille',
  
  // Rééducation post-opératoire
  'Post-op genou', 'Post-op hanche', 'Post-op épaule',
  'Post-op rachis', 'Post-op cheville',
  
  // Troubles neurologiques
  'Paralysie faciale', 'Névralgie faciale',
  'Syndrome du canal carpien', 'Névralgie intercostale',
  
  // Troubles respiratoires
  'Bronchite chronique', 'BPCO', 'Encombrement bronchique',
  'Rééducation respiratoire post-covid',
  
  // Troubles vestibulaires et posturaux
  'Vertiges positionnels', 'Troubles de l\'équilibre',
  'Syndrome proprioceptif', 'Troubles posturaux',
  
  // Céphalées et migraines
  'Migraine cervicogène', 'Céphalées de tension',
  'Névralgie d\'Arnold',
  
  // Pathologies sportives
  'Claquage musculaire', 'Élongation musculaire',
  'Tendinopathie sportive', 'Préparation physique',
  
  // Rhumatismes
  'Polyarthrite', 'Spondylarthrite', 'Fibromyalgie',
  
  // Autres
  'Drainage lymphatique', 'Rééducation périnéale',
  'Kinésithérapie du sport', 'Autre'
];

const predefinedTechniques = [
  'Étirements', 'Mobilisations passives', 'Renforcement musculaire', 'MTP',
  'Points gachette', 'Massage', 'Traction cervicale', 'Presse',
  'Vélo', 'Tapis', 'Autre'
];

const ConsultationForm: React.FC = () => {
  const { id, consultationId } = useParams<{ id: string; consultationId: string }>();
  const [formData, setFormData] = useState<ConsultationFormData>(initialFormData);
  const [patient, setPatient] = useState<{ firstName: string; lastName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previousConsultation, setPreviousConsultation] = useState<ConsultationFormData | null>(null);
  const navigate = useNavigate();
  const { db } = useFirebase();
  const [aiSuggestions, setAiSuggestions] = useState<{
    techniques: string;
    risks: string | null;
    evolution: string | null;
  }>({ techniques: '', risks: null, evolution: null });
  const [loadingAI, setLoadingAI] = useState(false);
  const isEditMode = !!consultationId;
  const [consultationHistory, setConsultationHistory] = useState<ConsultationFormData[]>([]);
  const [newTechnique, setNewTechnique] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch patient data
        const patientDoc = await getDoc(doc(db, 'patients', id));
        
        if (patientDoc.exists()) {
          const patientData = patientDoc.data();
          setPatient({
            firstName: patientData.firstName,
            lastName: patientData.lastName
          });
          
          // If editing an existing consultation
          if (isEditMode && consultationId) {
            const consultationDoc = await getDoc(doc(db, 'consultations', consultationId));
            
            if (consultationDoc.exists()) {
              const consultationData = consultationDoc.data();
              
              // Convert Firestore timestamp to string
              let dateString = '';
              if (consultationData.date instanceof Timestamp) {
                const date = consultationData.date.toDate();
                dateString = new Date(date).toISOString().substring(0, 16); // format: YYYY-MM-DDThh:mm
              } else {
                dateString = consultationData.date;
              }
              
              setFormData({
                ...initialFormData,
                date: dateString,
                type: consultationData.type || 'seance',
                isHomeVisit: consultationData.isHomeVisit ?? false,
                reasons: consultationData.reasons || [],
                customReason: consultationData.customReason || '',
                notes: consultationData.notes || '',
                anamnesis: consultationData.anamnesis || '',
                pain: consultationData.pain || '',
                jointMuscularExam: consultationData.jointMuscularExam || '',
                functionalExam: consultationData.functionalExam || '',
                techniques: consultationData.techniques || [],
                anatomicalAreas: consultationData.anatomicalAreas || [],
                recommendations: consultationData.recommendations || '',
                evolution: consultationData.evolution || '',
                nextSessionNotes: consultationData.nextSessionNotes || ''
              });
            }
          } else {
            // For new consultation, fetch the most recent previous consultation
            const consultationsQuery = collection(db, 'consultations');
            const prevConsultationsSnapshot = await getDocs(
              query(consultationsQuery, where('patientId', '==', id), orderBy('date', 'desc'), limit(1))
            );
            
            if (!prevConsultationsSnapshot.empty) {
              const prevConsultationData = prevConsultationsSnapshot.docs[0].data();
              setPreviousConsultation(prevConsultationData as ConsultationFormData);
              
              // Fetch consultation history
              const historySnapshot = await getDocs(
                query(consultationsQuery, 
                  where('patientId', '==', id),
                  orderBy('date', 'desc'),
                  limit(5)
                )
              );
              
              const history = historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              } as ConsultationFormData));
              
              setConsultationHistory(history);
              
              // If there's a note for next session, prefill it
              if (prevConsultationData.nextSessionNotes) {
                setFormData(prev => ({
                  ...prev,
                  notes: prevConsultationData.nextSessionNotes
                }));
              }
            }
          }
        } else {
          console.error('Patient not found');
          navigate('/patients');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [db, id, consultationId, isEditMode, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check if time is on hour or half hour
    if (formData.date) {
      const date = new Date(formData.date);
      const minutes = date.getMinutes();
      if (minutes !== 0 && minutes !== 30) {
        newErrors.date = 'L\'horaire doit être à l\'heure pile ou à la demi-heure';
      }
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleReasonSelect = (selectedReason: string) => {
    setFormData(prev => {
      const updatedReasons = prev.reasons.includes(selectedReason)
        ? prev.reasons.filter(reason => reason !== selectedReason)
        : [...prev.reasons, selectedReason];
      return { ...prev, reasons: updatedReasons };
    });
    if (errors.reasons) {
      setErrors(prev => ({ ...prev, reasons: '' }));
    }
  };

  // Grouper les motifs par catégorie pour l'affichage
  const reasonCategories = {
    'Troubles musculo-squelettiques': predefinedReasons.slice(0, 11),
    'Pathologies articulaires': predefinedReasons.slice(11, 21),
    'Rééducation post-opératoire': predefinedReasons.slice(21, 26),
    'Troubles neurologiques': predefinedReasons.slice(26, 30),
    'Troubles respiratoires': predefinedReasons.slice(30, 34),
    'Troubles vestibulaires et posturaux': predefinedReasons.slice(34, 38),
    'Céphalées et migraines': predefinedReasons.slice(38, 41),
    'Pathologies sportives': predefinedReasons.slice(41, 45),
    'Rhumatismes': predefinedReasons.slice(45, 48),
    'Autres': predefinedReasons.slice(48)
  };

  const handleTechniqueSelect = (techniqueName: string) => {
    const techniqueData = Object.values(techniquesData)
      .flatMap(category => category.techniques)
      .find(t => t.name === techniqueName);

    if (techniqueData && !formData.techniques.some(t => t.name === techniqueName)) {
      const newTechnique = {
        category: 'manual',
        name: techniqueName,
        targetGroups: [],
        description: techniqueData.description,
        purpose: techniqueData.purpose
      };
      
      setFormData(prev => ({
        ...prev,
        techniques: [...prev.techniques, newTechnique]
      }));
    }
  };

  const handleRemoveTechnique = (index: number) => {
    setFormData(prev => ({
      ...prev,
      techniques: prev.techniques.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomTechnique = () => {
    if (newTechnique.trim() && !formData.techniques.some(t => t.name === newTechnique.trim())) {
      setFormData(prev => ({
        ...prev,
        techniques: [...prev.techniques, {
          category: 'manual',
          name: newTechnique.trim(),
          targetGroups: []
        }]
      }));
      setNewTechnique('');
    }
  };

  const handleTechniqueCategorySelect = (technique: {
    category: 'active' | 'passive' | 'manual' | 'respiratory' | 'instrumental' | 'complementary';
    name: string;
    description?: string;
    targetGroups?: string[];
    purpose?: string;
  }) => {
    const existingTechniqueIndex = formData.techniques.findIndex(t => t.name === technique.name);
    
    if (existingTechniqueIndex === -1) {
      setFormData(prev => ({
        ...prev,
        techniques: [...prev.techniques, {
          ...technique,
          targetGroups: []
        }]
      }));
    } else {
      // Update existing technique with new target groups
      setFormData(prev => {
        const updatedTechniques = [...prev.techniques];
        updatedTechniques[existingTechniqueIndex] = {
          ...updatedTechniques[existingTechniqueIndex],
          targetGroups: []
        };
        return { ...prev, techniques: updatedTechniques };
      });
    }
  };

  const handleMuscleGroupToggle = (techniqueIndex: number, muscleGroup: string) => {
    setFormData((prev) => {
      const updatedTechniques = [...prev.techniques];
      const currentTechnique = updatedTechniques[techniqueIndex];
      
      // Toggle the muscle group
      if (currentTechnique.targetGroups?.includes(muscleGroup)) {
        currentTechnique.targetGroups = currentTechnique.targetGroups.filter(
          group => group !== muscleGroup
        );
      } else {
        currentTechnique.targetGroups = [
          ...(currentTechnique.targetGroups || []),
          muscleGroup
        ];
      }
      
      updatedTechniques[techniqueIndex] = currentTechnique;
      return { ...prev, techniques: updatedTechniques };
    });
  };

  const handleAnatomicalAreaSelect = (area: string) => {
    setFormData(prev => {
      const updated = prev.anatomicalAreas.includes(area)
        ? prev.anatomicalAreas.filter(a => a !== area)
        : [...prev.anatomicalAreas, area];
      
      return {
        ...prev,
        anatomicalAreas: updated
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Prepare consultation data with default values for potentially undefined fields
      const consultationData = {
        ...formData,
        date: formData.date,
        type: formData.type || 'seance',
        isHomeVisit: formData.isHomeVisit ?? false,
        reasons: formData.reasons.includes('Autre') 
          ? formData.reasons.map(r => r === 'Autre' ? formData.customReason : r)
          : formData.reasons,
        customReason: formData.customReason || '',
        notes: formData.notes || '',
        anamnesis: formData.anamnesis || '',
        pain: formData.pain || '',
        jointMuscularExam: formData.jointMuscularExam || '',
        functionalExam: formData.functionalExam || '',
        techniques: formData.techniques.map(t => ({
          category: t.category || 'manual',
          name: t.name,
          targetGroups: t.targetGroups || []
        })),
        anatomicalAreas: formData.anatomicalAreas || [],
        recommendations: formData.recommendations || '',
        evolution: formData.evolution || '',
        nextSessionNotes: formData.nextSessionNotes || '',
        patientId: id,
        patientName: `${patient?.lastName} ${patient?.firstName}`,
        updatedAt: serverTimestamp()
      };
      
      if (isEditMode && consultationId) {
        // Update existing consultation
        await updateDoc(doc(db, 'consultations', consultationId), consultationData);
      } else {
        // Create new consultation
        consultationData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'consultations'), consultationData);
        
        // Update patient's lastConsultation date
        await updateDoc(doc(db, 'patients', id), {
          lastConsultation: formData.date,
          updatedAt: serverTimestamp()
        });
      }
      
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error('Error saving consultation:', error);
      setSaving(false);
    }
  };

  const getAISuggestions = async () => {
    if (!formData.reasons.length) return;
    
    setLoadingAI(true);
    let evolutionAnalysis = null;

    try {
      // Génération des suggestions de techniques
      const techniquesPrompt = `En tant que kinésithérapeute, suggère des techniques de traitement et des recommandations pour un patient présentant : ${formData.reasons.join(', ')}. ${
        formData.notes ? `Notes additionnelles : ${formData.notes}` : ''
      }`;
      
      // Analyse des risques
      const riskPrompt = `En tant que kinésithérapeute, analyse les risques potentiels pour un patient présentant :
      - Motifs actuels : ${formData.reasons.join(', ')}
      - Antécédents médicaux : ${patient?.medicalHistory || 'Non renseignés'}
      ${consultationHistory.length > 0 ? `
      - Historique récent :
      ${consultationHistory.map(c => `
        - ${new Date(c.date).toLocaleDateString('fr-FR')} : ${c.reasons.join(', ')}
        ${c.evolution ? `Evolution : ${c.evolution}` : ''}`).join('\n')}
      ` : ''}
      
      Identifie et analyse :
      1. Les contre-indications potentielles
      2. Les risques de complications
      3. Les points de vigilance spécifiques
      4. Les recommandations de prévention`;

      const techniquesResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "Tu es un assistant kinésithérapeute expert. Réponds de manière concise et professionnelle."
        }, {
          role: "user",
          content: techniquesPrompt
        }],
        temperature: 0.7,
        max_tokens: 500
      });
      
      // Analyse des risques
      const riskResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "Tu es un assistant kinésithérapeute expert en analyse des risques et prévention. Fournis une analyse concise et structurée des risques potentiels."
        }, {
          role: "user",
          content: riskPrompt
        }],
        temperature: 0.7,
        max_tokens: 500
      });

      // Analyse de l'évolution si l'historique existe
      if (consultationHistory.length > 0) {
        const historyContext = consultationHistory
          .map(c => `Date: ${new Date(c.date).toLocaleDateString('fr-FR')}
Motifs: ${c.reasons.join(', ')}
Techniques: ${c.techniques.map(t => t.name).join(', ')}
Evolution: ${c.evolution || 'Non renseignée'}`)
          .join('\n\n');

        const evolutionPrompt = `Analyse l'évolution de ce patient basée sur l'historique suivant des consultations:

${historyContext}

Fournis une analyse concise de l'évolution du patient et des suggestions pour optimiser le traitement.`;

        const evolutionResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: "Tu es un assistant kinésithérapeute expert spécialisé dans l'analyse de l'évolution des patients. Fournis une analyse concise et des recommandations pertinentes."
          }, {
            role: "user",
            content: evolutionPrompt
          }],
          temperature: 0.7,
          max_tokens: 500
        });

        evolutionAnalysis = evolutionResponse.choices[0].message.content;
      }

      setAiSuggestions({
        techniques: techniquesResponse.choices[0].message.content || '',
        risks: riskResponse.choices[0].message.content || '',
        evolution: evolutionAnalysis
      });

    } catch (error) {
      console.error('Erreur lors de la génération des suggestions:', error);
    } finally {
      setLoadingAI(false);
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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Modifier la consultation' : 'Nouvelle consultation'}
          </h2>
          {patient && (
            <p className="text-gray-600">
              Patient: {patient.lastName} {patient.firstName}
            </p>
          )}
        </div>
        
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5 mr-1" />
          <span>Annuler</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date et heure <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de consultation <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            >
              <option value="bilan">Bilan initial</option>
              <option value="seance">Séance</option>
            </select>
          </div>
          
          {formData.type === 'seance' && (
            <div>
              <label htmlFor="isHomeVisit" className="block text-sm font-medium text-gray-700 mb-1">
                Type de séance
              </label>
              <select
                id="isHomeVisit"
                name="isHomeVisit"
                value={formData.isHomeVisit.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, isHomeVisit: e.target.value === 'true' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              >
                <option value="false">Au cabinet</option>
                <option value="true">Visite à domicile</option>
              </select>
            </div>
          )}
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motifs de consultation
            </label>
            {formData.type === 'bilan' ? (
              <div className="space-y-4">
              {Object.entries(reasonCategories).map(([category, reasons]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {reasons.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => handleReasonSelect(reason)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          formData.reasons.includes(reason)
                            ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
                ))}
              
              {formData.reasons.includes('Autre') && (
                <input
                  type="text"
                  value={formData.customReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, customReason: e.target.value }))}
                  placeholder="Précisez le motif..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Les motifs de consultation sont uniquement disponibles lors du bilan initial.</p>
            )}
            {errors.reasons && (
              <p className="mt-1 text-sm text-red-600">{errors.reasons}</p>
            )}
          </div>
        </div>
        
        {/* Bilan initial fields */}
        {formData.type === 'bilan' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label htmlFor="anamnesis" className="block text-sm font-medium text-gray-700 mb-1">
                  Anamnèse
                </label>
                <textarea
                  id="anamnesis"
                  name="anamnesis"
                  value={formData.anamnesis}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Antécédents, histoire de la maladie, mode de vie..."
                />
              </div>
              
              <div>
                <label htmlFor="pain" className="block text-sm font-medium text-gray-700 mb-1">
                  Évaluation de la douleur
                </label>
                <textarea
                  id="pain"
                  name="pain"
                  value={formData.pain}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Localisation, intensité, type, facteurs aggravants/soulageants..."
                />
              </div>
              
              <div>
                <label htmlFor="jointMuscularExam" className="block text-sm font-medium text-gray-700 mb-1">
                  Examen articulaire/musculaire
                </label>
                <textarea
                  id="jointMuscularExam"
                  name="jointMuscularExam"
                  value={formData.jointMuscularExam}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Amplitudes articulaires, force musculaire, tests spécifiques..."
                />
              </div>
              
              <div>
                <label htmlFor="functionalExam" className="block text-sm font-medium text-gray-700 mb-1">
                  Examen fonctionnel
                </label>
                <textarea
                  id="functionalExam"
                  name="functionalExam"
                  value={formData.functionalExam}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Évaluation des mouvements, posture, équilibre..."
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes complémentaires
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Observations additionnelles, diagnostic ostéopathique..."
                />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="h-full bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Zones anatomiques</h3>
                <AnatomicalDiagram
                  selectedAreas={formData.anatomicalAreas}
                  onAreaSelect={handleAnatomicalAreaSelect}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Common fields for both types */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Techniques utilisées
            </label>
            <TechniqueSelector
              selectedTechniques={formData.techniques.map(t => t.name)}
              onTechniqueSelect={handleTechniqueCategorySelect}
              onTechniqueRemove={handleRemoveTechnique}
              selectedMuscleGroups={Object.fromEntries(
                formData.techniques.map(t => [t.name, t.targetGroups || []])
              )}
              onMuscleGroupToggle={handleMuscleGroupToggle}
            />
          </div>
          
          <div>
            <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-1">
              Recommandations
            </label>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              placeholder="Conseils, exercices à domicile, précautions..."
            />
          </div>
          
          <div>
            <label htmlFor="evolution" className="block text-sm font-medium text-gray-700 mb-1">
              Évolution
            </label>
            <textarea
              id="evolution"
              name="evolution"
              value={formData.evolution}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              placeholder="Progrès, changements observés..."
            />
          </div>
          
          <div>
            <label htmlFor="nextSessionNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes pour la prochaine séance
            </label>
            <textarea
              id="nextSessionNotes"
              name="nextSessionNotes"
              value={formData.nextSessionNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              placeholder="Points à aborder, techniques à privilégier..."
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={getAISuggestions}
            disabled={loadingAI || formData.reasons.length === 0}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              loadingAI || formData.reasons.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Brain className="w-5 h-5 mr-2" />
            <span>Suggestions IA</span>
          </button>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(`/patients/${id}`)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-5 h-5 mr-2" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </form>
      
      {/* AI Suggestions Panel */}
      {aiSuggestions.techniques && (
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Suggestions de l'assistant IA
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Techniques recommandées
              </h4>
              <div className="bg-blue-50 rounded-md p-4">
                <p className="text-blue-800 whitespace-pre-line">
                  {aiSuggestions.techniques}
                </p>
              </div>
            </div>
            
            {aiSuggestions.risks && (
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Analyse des risques
                </h4>
                <div className="bg-red-50 rounded-md p-4">
                  <p className="text-red-800 whitespace-pre-line">
                    {aiSuggestions.risks}
                  </p>
                </div>
              </div>
            )}
            
            {aiSuggestions.evolution && (
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Analyse de l'évolution
                </h4>
                <div className="bg-green-50 rounded-md p-4">
                  <p className="text-green-800 whitespace-pre-line">
                    {aiSuggestions.evolution}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationForm;