import React from 'react';
import { Mail, Phone, Github, Globe, Star, Heart, Users, Calendar, FileText, Brain } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">À propos</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">KinéTrack</h2>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">Version 1.0.0</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              KinéTrack est une application professionnelle conçue spécifiquement pour les kinésithérapeutes, 
              offrant une solution complète pour la gestion des patients et le suivi des consultations. 
              Développée en étroite collaboration avec des praticiens, elle intègre les meilleures pratiques 
              du secteur et les dernières avancées technologiques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Fonctionnalités principales</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-blue-50 p-2 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Gestion des patients</p>
                    <p className="text-sm text-gray-600">Suivi complet des dossiers patients avec historique détaillé</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-50 p-2 rounded-lg mr-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Agenda intelligent</p>
                    <p className="text-sm text-gray-600">Gestion optimisée des rendez-vous et des visites à domicile</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-amber-50 p-2 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Bilans et consultations</p>
                    <p className="text-sm text-gray-600">Outils complets pour les bilans et le suivi des séances</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-50 p-2 rounded-lg mr-3">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Assistant IA</p>
                    <p className="text-sm text-gray-600">Suggestions intelligentes et analyse des risques</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Technologies</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">React</span>
                  <span className="text-sm text-gray-500">Interface utilisateur</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Firebase</span>
                  <span className="text-sm text-gray-500">Base de données</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">OpenAI</span>
                  <span className="text-sm text-gray-500">Intelligence artificielle</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">TailwindCSS</span>
                  <span className="text-sm text-gray-500">Design système</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Développeur</h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                    alt="Cyril Nectoux"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-lg font-medium text-gray-800">Cyril Nectoux</p>
                    <p className="text-sm text-gray-600">Développeur Full Stack</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <a href="tel:+33614216146" className="hover:text-teal-600">06.14.21.61.46</a>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <a href="mailto:cnectoux@free.fr" className="hover:text-teal-600">cnectoux@free.fr</a>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Github className="w-5 h-5" />
                  <a 
                    href="https://github.com/CYNEPROD" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-teal-600"
                  >
                    @CYNEPROD
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-gray-600">Développeur certifié React</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-gray-600">Passionné de santé numérique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <a 
                    href="https://cyneprod.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-teal-600"
                  >
                    cyneprod.fr
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} KinéTrack. Tous droits réservés.
              </p>
              <p className="text-sm text-gray-500">
                Développé avec passion pour les professionnels de la kinésithérapie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;