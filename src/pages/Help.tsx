import React from 'react';
import { ArrowLeft, Brain, AlertTriangle, LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Help: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Guide d'utilisation</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Retour</span>
        </button>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tableau de bord</h2>
          <div className="space-y-4 text-gray-600">
            <p>Le tableau de bord vous offre une vue d'ensemble de votre activité :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Liste des patients récents</li>
              <li>Historique des dernières consultations</li>
              <li>Activité récente sur l'application</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestion des patients</h2>
          <div className="space-y-4 text-gray-600">
            <p>La section patients vous permet de :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Créer et gérer les fiches patients avec leurs informations personnelles et antécédents médicaux</li>
              <li>Rechercher un patient par son nom</li>
              <li>Filtrer les patients selon leur statut (suivi/non suivi)</li>
              <li>Accéder à l'historique complet des consultations d'un patient</li>
              <li>Visualiser le bilan initial et les examens réalisés</li>
              <li>Modifier les informations d'un patient</li>
              <li>Gérer le statut de suivi des patients</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Assistant IA
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>L'assistant IA vous aide à optimiser vos consultations avec :</p>
            
            <div className="pl-4 space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                  Analyse des risques
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Identification des contre-indications potentielles</li>
                  <li>Évaluation des risques de complications</li>
                  <li>Points de vigilance spécifiques</li>
                  <li>Recommandations de prévention</li>
                  <li>Basée sur les antécédents et l'historique du patient</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  Suggestions de traitement
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Recommandations de techniques adaptées</li>
                  <li>Propositions d'exercices personnalisés</li>
                  <li>Conseils de prise en charge</li>
                  <li>Adaptation aux groupes musculaires ciblés</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <LineChart className="w-4 h-4 mr-2 text-purple-600" />
                  Analyse de l'évolution
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Suivi de la progression du patient</li>
                  <li>Analyse des tendances de récupération</li>
                  <li>Suggestions d'ajustement du traitement</li>
                  <li>Analyse des zones traitées et leur évolution</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Comment utiliser l'assistant :</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Renseignez les motifs de consultation</li>
                <li>Cliquez sur "Générer des suggestions"</li>
                <li>Consultez les analyses dans les sections colorées :</li>
                <ul className="ml-6 mt-2 space-y-1">
                  <li className="text-red-700">Rouge : Analyse des risques</li>
                  <li className="text-blue-700">Bleu : Suggestions de traitement</li>
                  <li className="text-purple-700">Violet : Analyse de l'évolution</li>
                </ul>
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultations</h2>
          <div className="space-y-4 text-gray-600">
            <p>La gestion des consultations comprend :</p>
            
            <div className="pl-4">
              <h3 className="font-medium text-gray-800 mb-2">1. Bilan initial (orange)</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Anamnèse détaillée</li>
                <li>Évaluation de la douleur</li>
                <li>Examen articulaire et musculaire</li>
                <li>Examen fonctionnel</li>
                <li>Sélection des zones anatomiques concernées</li>
                <li>Visualisation rapide avec indicateur orange</li>
              </ul>
            </div>

            <div className="pl-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-2">2. Séances de suivi</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sélection multiple des motifs de consultation</li>
                <li>Au cabinet (vert) ou à domicile (violet)</li>
                <li>Évolution depuis la consultation précédente</li>
                <li>Recommandations au patient</li>
                <li>Notes pour la prochaine séance</li>
              </ul>
            </div>
            
            <div className="pl-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-2">3. Techniques de traitement</h3>
              <p className="mb-2">Les techniques sont organisées en catégories :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>🧠 Techniques actives (participation du patient)
                  <ul className="list-circle list-inside ml-4 mt-1 text-sm">
                    <li>Renforcement musculaire</li>
                    <li>Exercices proprioceptifs</li>
                    <li>Étirements actifs</li>
                  </ul>
                </li>
                <li>✋ Techniques passives (mobilisations par le kiné)
                  <ul className="list-circle list-inside ml-4 mt-1 text-sm">
                    <li>Mobilisations articulaires</li>
                    <li>Étirements passifs</li>
                  </ul>
                </li>
                <li>🔥 Thérapies manuelles
                  <ul className="list-circle list-inside ml-4 mt-1 text-sm">
                    <li>Techniques myofasciales</li>
                    <li>Trigger points</li>
                  </ul>
                </li>
                <li>🌬️ Kinésithérapie respiratoire</li>
                <li>💡 Techniques instrumentales (TENS, ondes de choc)</li>
                <li>🧊 Techniques complémentaires (cryo/thermothérapie, taping)</li>
              </ul>
            </div>
            
            <div className="pl-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-2">4. Ciblage anatomique</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sélection des groupes musculaires pour chaque technique</li>
                <li>Visualisation interactive des zones traitées</li>
                <li>Suivi précis de l'évolution par zone</li>
                <li>Historique des zones traitées par séance</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Agenda</h2>
          <div className="space-y-4 text-gray-600">
            <p>L'agenda vous permet de gérer vos rendez-vous :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Vue par jour ou par semaine</li>
              <li>Créer rapidement une consultation pour un patient</li>
              <li>Code couleur pour différencier les types de consultations :</li>
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Orange : Bilan initial</li>
                <li>Vert : Consultation au cabinet</li>
                <li>Violet : Visite à domicile</li>
              </ul>
              <li>Résumé rapide des consultations avec techniques et zones traitées</li>
              <li>Supprimer ou modifier un rendez-vous</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Diagramme anatomique</h2>
          <div className="space-y-4 text-gray-600">
            <p>Le diagramme anatomique interactif permet de :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sélectionner les zones anatomiques traitées</li>
              <li>Visualiser rapidement les zones concernées</li>
              <li>Garder une trace précise des zones travaillées à chaque séance</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Help;