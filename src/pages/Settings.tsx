import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import type { BillingSettings } from '../types';

const defaultSettings: BillingSettings = {
  id: 'billing-settings',
  rates: {
    consultation: {
      cabinet: 16.13,
      domicile: 16.13
    },
    majorations: {
      dimanche: 8.50,
      nuit: 9.15,
      ferie: 8.50
    },
    indemnites: {
      deplacement: 2.50,
      kilometrique: 0.50
    }
  },
  conventionnement: 'secteur1',
  updatedAt: null
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<BillingSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const { db } = useFirebase();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'billing-settings'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as BillingSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, [db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await setDoc(doc(db, 'settings', 'billing-settings'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2" />
          Paramètres
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Paramètres de facturation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conventionnement
                </label>
                <select
                  value={settings.conventionnement}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    conventionnement: e.target.value as 'secteur1' | 'secteur2'
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="secteur1">Secteur 1</option>
                  <option value="secteur2">Secteur 2</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Tarifs des consultations
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Au cabinet</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={settings.rates.consultation.cabinet}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            consultation: {
                              ...prev.rates.consultation,
                              cabinet: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">À domicile</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={settings.rates.consultation.domicile}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            consultation: {
                              ...prev.rates.consultation,
                              domicile: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Majorations
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Dimanche</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={settings.rates.majorations.dimanche}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            majorations: {
                              ...prev.rates.majorations,
                              dimanche: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Nuit</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={settings.rates.majorations.nuit}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            majorations: {
                              ...prev.rates.majorations,
                              nuit: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Férié</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={settings.rates.majorations.ferie}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            majorations: {
                              ...prev.rates.majorations,
                              ferie: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">€</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Indemnités
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Déplacement</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={settings.rates.indemnites.deplacement}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            indemnites: {
                              ...prev.rates.indemnites,
                              deplacement: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Kilométrique</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={settings.rates.indemnites.kilometrique}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rates: {
                            ...prev.rates,
                            indemnites: {
                              ...prev.rates.indemnites,
                              kilometrique: parseFloat(e.target.value)
                            }
                          }
                        }))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-gray-600">€/km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;