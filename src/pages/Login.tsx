import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, ArrowRight } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        await register(formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message === 'Les mots de passe ne correspondent pas' 
          ? err.message 
          : isRegistering 
            ? 'Échec de l\'inscription. Veuillez réessayer.'
            : 'Échec de connexion. Veuillez vérifier vos identifiants.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-500 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <Stethoscope className="h-12 w-12 text-teal-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">KinéTrack</h1>
          <p className="text-gray-600 mt-2">
            {isRegistering ? 'Créer un compte praticien' : 'Connexion à votre espace praticien'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {isRegistering && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (isRegistering ? 'Inscription...' : 'Connexion...') : (isRegistering ? 'S\'inscrire' : 'Se connecter')}
          </button>

          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-4 w-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>{isRegistering ? 'Déjà inscrit ? Se connecter' : 'Créer un compte'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Application de suivi patient pour Kinésithérapeute
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;