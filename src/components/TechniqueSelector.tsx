import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface Technique {
  category: 'active' | 'passive' | 'manual' | 'respiratory' | 'instrumental' | 'complementary';
  name: string;
  description?: string;
  targetGroups?: string[];
  purpose?: string;
}

interface TechniqueSelectorProps {
  selectedTechniques: string[];
  onTechniqueSelect: (technique: Technique) => void;
  onTechniqueRemove: (index: number) => void;
  selectedMuscleGroups?: { [key: string]: string[] };
  onMuscleGroupToggle?: (techniqueIndex: number, muscleGroup: string) => void;
}

const techniquesData = {
  active: {
    title: '🧠 Techniques actives',
    description: 'Le patient participe activement',
    techniques: [
      {
        name: 'Renforcement musculaire',
        description: 'Exercices de renforcement adaptés',
        targetGroups: ['Quadriceps', 'Ischio-jambiers', 'Abdominaux', 'Deltoïdes'],
        purpose: 'Augmenter la force, la tonicité et prévenir la fonte musculaire'
      },
      {
        name: 'Exercices proprioceptifs',
        description: 'Exercices d\'équilibre et de stabilisation',
        targetGroups: ['Muscles stabilisateurs', 'Cheville', 'Genou', 'Hanche', 'Épaule', 'Tronc'],
        purpose: 'Améliorer l\'équilibre, la coordination, la prévention des entorses'
      },
      {
        name: 'Étirements actifs',
        description: 'Étirements réalisés par le patient',
        targetGroups: ['Ischio-jambiers', 'Psoas', 'Trapèzes'],
        purpose: 'Restaurer l\'amplitude articulaire, prévenir les raideurs'
      }
    ]
  },
  passive: {
    title: '✋ Techniques passives',
    description: 'Le kiné mobilise, le patient reste passif',
    techniques: [
      {
        name: 'Mobilisations articulaires',
        description: 'Mobilisations douces des articulations',
        targetGroups: ['Épaule', 'Genou', 'Poignet', 'Rachis'],
        purpose: 'Augmenter la mobilité, prévenir les adhérences, soulager la douleur'
      },
      {
        name: 'Étirements passifs',
        description: 'Étirements réalisés par le thérapeute',
        targetGroups: ['Ischio-jambiers', 'Mollets', 'Pectoraux'],
        purpose: 'Assouplir les tissus, améliorer la souplesse'
      }
    ]
  },
  manual: {
    title: '🔥 Thérapies manuelles',
    description: 'Techniques de thérapie manuelle',
    techniques: [
      {
        name: 'Techniques myofasciales',
        description: 'Travail sur les fascias et chaînes musculaires',
        targetGroups: ['Dos', 'Nuque', 'Membres'],
        purpose: 'Libérer les tensions, améliorer la mobilité globale'
      },
      {
        name: 'Trigger points',
        description: 'Traitement des points gâchettes',
        targetGroups: ['Trapèzes', 'Piriforme', 'Masséters'],
        purpose: 'Décontracter les zones douloureuses par pression'
      }
    ]
  },
  respiratory: {
    title: '🌬️ Kinésithérapie respiratoire',
    description: 'Techniques respiratoires',
    techniques: [
      {
        name: 'Techniques d\'expectoration',
        description: 'Drainage et désencombrement',
        targetGroups: ['Poumons', 'Diaphragme', 'Muscles intercostaux'],
        purpose: 'Désencombrer les voies respiratoires'
      }
    ]
  },
  instrumental: {
    title: '💡 Techniques instrumentales',
    description: 'Aides technologiques',
    techniques: [
      {
        name: 'Électrostimulation',
        description: 'TENS, Compex',
        targetGroups: ['Muscles affaiblis', 'Muscles douloureux'],
        purpose: 'Renforcement, récupération, antalgie'
      },
      {
        name: 'Ondes de choc',
        description: 'Traitement par ondes de choc',
        targetGroups: ['Tendons', 'Fascias'],
        purpose: 'Effet anti-inflammatoire, cicatrisation tissulaire'
      }
    ]
  },
  complementary: {
    title: '🧊 Techniques complémentaires',
    description: 'Autres techniques de soin',
    techniques: [
      {
        name: 'Cryothérapie',
        description: 'Application de froid',
        targetGroups: ['Zones douloureuses', 'Zones inflammatoires'],
        purpose: 'Soulagement de la douleur, réduction de l\'inflammation'
      },
      {
        name: 'Thermothérapie',
        description: 'Application de chaleur',
        targetGroups: ['Zones douloureuses', 'Muscles contractés'],
        purpose: 'Soulagement de la douleur, décontraction musculaire'
      },
      {
        name: 'Strapping / Taping',
        description: 'Contentions adhésives',
        targetGroups: ['Cheville', 'Genou', 'Épaule'],
        purpose: 'Soutien fonctionnel, proprioception, prévention'
      }
    ]
  }
};

const TechniqueSelector: React.FC<TechniqueSelectorProps> = ({
  selectedTechniques,
  onTechniqueSelect,
  onTechniqueRemove,
  selectedMuscleGroups = {},
  onMuscleGroupToggle
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [expandedTechniques, setExpandedTechniques] = useState<number[]>([]);

  const muscleGroups = [
    'Quadriceps', 'Ischio-jambiers', 'Mollets',
    'Fessiers', 'Abdominaux', 'Lombaires',
    'Dorsaux', 'Trapèzes', 'Deltoïdes',
    'Biceps', 'Triceps', 'Pectoraux'
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTechnique = (index: number) => {
    setExpandedTechniques(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleTechniqueRemove = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onTechniqueRemove(index);
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-2">
        {Object.entries(techniquesData).map(([category, data]) => (
          <div key={category} className="border border-gray-200 rounded-lg">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCategory(category);
              }}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="flex items-center">
                {expandedCategories.includes(category) ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <span className="ml-2 font-medium text-gray-700">{data.title}</span>
                <span className="ml-2 text-sm text-gray-500">({data.description})</span>
              </div>
            </button>

            {expandedCategories.includes(category) && (
              <div className="p-3 pt-0">
                <div className="grid grid-cols-1 gap-2">
                  {data.techniques.map((technique, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="relative flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-grow">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onTechniqueSelect({
                              category: category as 'active' | 'passive' | 'manual' | 'respiratory' | 'instrumental' | 'complementary',
                              ...technique
                            });
                          }}
                          className="text-left text-sm text-gray-700 hover:text-gray-900"
                        >
                          {technique.name}
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowInfo(showInfo === `${category}-${index}` ? null : `${category}-${index}`);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {showInfo === `${category}-${index}` && (
                        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <h4 className="font-medium text-gray-800 mb-2">{technique.name}</h4>
                          {technique.description && (
                            <p className="text-sm text-gray-600 mb-2">{technique.description}</p>
                          )}
                          {technique.targetGroups && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-gray-500">Groupes ciblés :</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {technique.targetGroups.map((group, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                                  >
                                    {group}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {technique.purpose && (
                            <div>
                              <p className="text-xs font-medium text-gray-500">But :</p>
                              <p className="text-sm text-gray-600">{technique.purpose}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Techniques */}
      {selectedTechniques.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Techniques sélectionnées</h4>
          <div className="space-y-2">
            {selectedTechniques.map((technique, index) => (
              <button
                key={index}
                onClick={() => toggleTechnique(index)}
                className="w-full text-left block"
                type="button"
              >
                <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center">
                    {expandedTechniques.includes(index) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-800">{technique}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleTechniqueRemove(e, index)}
                    className="ml-2 p-1 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {expandedTechniques.includes(index) && onMuscleGroupToggle && (
                  <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Sélectionnez les groupes musculaires concernés :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {muscleGroups.map((group) => (
                        <button
                          key={group}
                          type="button"
                          onClick={() => onMuscleGroupToggle(index, group)}
                          className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                            selectedMuscleGroups[technique]?.includes(group)
                              ? 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniqueSelector;