import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, getDocs, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { Euro, TrendingUp, Users, Calendar } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import type { ConsultationBilling, BillingSettings } from '../types';

const FinancialDashboard: React.FC = () => {
  const [billings, setBillings] = useState<ConsultationBilling[]>([]);
  const [settings, setSettings] = useState<BillingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { db } = useFirebase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch consultations
        const consultationsQuery = query(
          collection(db, 'consultations'),
          orderBy('date', 'desc'));
        
        const consultationsSnapshot = await getDocs(consultationsQuery);
        const consultations = consultationsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        // Fetch billing settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'billing-settings'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as BillingSettings);
        }
        
        // Calculate potential revenue
        const billingsData = consultations.map(consultation => {
          const isHomeVisit = consultation.isHomeVisit || false;
          const baseRate = isHomeVisit ? 16.13 : 16.13; // Default rates if settings not loaded
          
          return {
            id: consultation.id,
            consultationId: consultation.id,
            patientId: consultation.patientId,
            patientName: consultation.patientName,
            date: consultation.date,
            type: isHomeVisit ? 'domicile' : 'cabinet',
            baseRate,
            totalAmount: baseRate,
            status: 'pending',
            createdAt: consultation.createdAt,
            updatedAt: consultation.updatedAt
          } as ConsultationBilling;
        });

        setBillings(billingsData);
      } catch (error) {
        console.error('Error fetching billings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  const calculateStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyBillings = billings.filter(billing => {
      const date = new Date(billing.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const totalRevenue = monthlyBillings.reduce((sum, billing) => 
      sum + billing.totalAmount, 0
    );

    const paidBillings = monthlyBillings.filter(billing => 
      billing.status === 'paid'
    );

    const unpaidAmount = monthlyBillings
      .filter(billing => billing.status === 'pending')
      .reduce((sum, billing) => sum + billing.totalAmount, 0);

    const paymentMethods = paidBillings.reduce((acc, billing) => {
      if (billing.paymentMethod) {
        acc[billing.paymentMethod] = (acc[billing.paymentMethod] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      paidCount: paidBillings.length,
      unpaidAmount,
      paymentMethods
    };
  };

  const getRevenueChartData = () => {
    const monthlyData = new Array(12).fill(0);
    
    billings.forEach(billing => {
      const date = new Date(billing.date);
      if (billing.status === 'paid') {
        monthlyData[date.getMonth()] += billing.totalAmount;
      }
    });

    return {
      labels: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ],
      datasets: [{
        label: 'Revenus mensuels',
        data: monthlyData,
        borderColor: 'rgb(13, 148, 136)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  };

  const stats = calculateStats();

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
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Euro className="w-6 h-6 mr-2" />
          Tableau de bord financier
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Revenus du mois</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalRevenue.toFixed(2)} €
              </p>
              <p className="text-xs text-gray-500">
                Basé sur les tarifs conventionnés {settings?.conventionnement === 'secteur2' ? 'secteur 2' : 'secteur 1'}
              </p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Consultations réglées</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.paidCount}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Montant à encaisser</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.unpaidAmount.toFixed(2)} €
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Euro className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Moyenne par jour</p>
              <p className="text-2xl font-bold text-gray-800">
                {(stats.totalRevenue / new Date().getDate()).toFixed(2)} €
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Évolution des revenus
          </h3>
          <Line
            data={getRevenueChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => `${value} €`
                  }
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Moyens de paiement
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.paymentMethods).map(([method, count]) => (
              <div key={method} className="flex items-center">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {method === 'carte' ? 'Carte bancaire' :
                       method === 'especes' ? 'Espèces' :
                       method === 'cheque' ? 'Chèque' : 'Tiers payant'}
                    </span>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{
                        width: `${(count / stats.paidCount * 100).toFixed(1)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Dernières transactions
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billings.slice(0, 10).map(billing => (
                <tr key={billing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(billing.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {billing.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {billing.type === 'cabinet' ? 'Cabinet' : 'Domicile'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {billing.totalAmount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      billing.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : billing.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {billing.status === 'paid' ? 'Payé' :
                       billing.status === 'pending' ? 'En attente' : 'Annulé'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;