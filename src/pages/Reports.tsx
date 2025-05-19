import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

interface ReportConfig {
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    patientId?: string;
    pathology?: string;
    technique?: string;
    anatomicalArea?: string;
  };
  sections: {
    patientInfo: boolean;
    consultationHistory: boolean;
    techniques: boolean;
    evolution: boolean;
    recommendations: boolean;
  };
}

const Reports: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: '',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    filters: {},
    sections: {
      patientInfo: true,
      consultationHistory: true,
      techniques: true,
      evolution: true,
      recommendations: true
    }
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { db } = useFirebase();

  useEffect(() => {
    const fetchData = async () => {
      const patientsSnapshot = await getDocs(collection(db, 'patients'));
      setPatients(patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [db]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'consultations'),
        where('date', '>=', reportConfig.dateRange.start),
        where('date', '<=', reportConfig.dateRange.end)
      );
      
      const consultationsSnapshot = await getDocs(q);
      const consultationsData = consultationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter consultations based on config
      const filteredConsultations = consultationsData.filter(consultation => {
        if (reportConfig.filters.patientId && consultation.patientId !== reportConfig.filters.patientId) return false;
        if (reportConfig.filters.pathology && !consultation.reasons?.includes(reportConfig.filters.pathology)) return false;
        if (reportConfig.filters.technique && !consultation.techniques?.some((t: any) => 
          (typeof t === 'string' ? t : t.name) === reportConfig.filters.technique
        )) return false;
        if (reportConfig.filters.anatomicalArea && !consultation.anatomicalAreas?.includes(reportConfig.filters.anatomicalArea)) return false;
        return true;
      });

      setConsultations(filteredConsultations);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportConfig.title || 'rapport'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    let content = `Rapport: ${reportConfig.title}\n`;
    content += `Période: ${formatDate(reportConfig.dateRange.start)} - ${formatDate(reportConfig.dateRange.end)}\n\n`;

    consultations.forEach(consultation => {
      const patient = patients.find(p => p.id === consultation.patientId);
      
      if (reportConfig.sections.patientInfo && patient) {
        content += `Patient: ${patient.lastName} ${patient.firstName}\n`;
      }
      
      content += `Date: ${formatDate(consultation.date)}\n`;
      
      if (reportConfig.sections.consultationHistory) {
        content += `Motif: ${consultation.reasons?.join(', ') || ''}\n`;
        content += `Notes: ${consultation.notes || ''}\n`;
      }
      
      if (reportConfig.sections.techniques) {
        content += `Techniques: ${consultation.techniques?.map((t: any) => 
          typeof t === 'string' ? t : t.name
        ).join(', ') || ''}\n`;
        content += `Zones traitées: ${consultation.anatomicalAreas?.join(', ') || ''}\n`;
      }
      
      if (reportConfig.sections.evolution) {
        content += `Évolution: ${consultation.evolution || ''}\n`;
      }
      
      if (reportConfig.sections.recommendations) {
        content += `Recommandations: ${consultation.recommendations || ''}\n`;
      }
      
      content += '\n---\n\n';
    });

    return content;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Rapports personnalisés
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration du rapport</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du rapport
              </label>
              <input
                type="text"
                value={reportConfig.title}
                onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Rapport d'activité mensuel..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={reportConfig.dateRange.start}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={reportConfig.dateRange.end}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient
              </label>
              <select
                value={reportConfig.filters.patientId || ''}
                onChange={(e) => setReportConfig(prev => ({
                  ...prev,
                  filters: { ...prev.filters, patientId: e.target.value || undefined }
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Tous les patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.lastName} {patient.firstName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sections à inclure
              </label>
              
              <div className="space-y-2">
                {Object.entries(reportConfig.sections).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          [key]: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {key === 'patientInfo' && 'Informations patient'}
                      {key === 'consultationHistory' && 'Historique des consultations'}
                      {key === 'techniques' && 'Techniques utilisées'}
                      {key === 'evolution' && 'Évolution'}
                      {key === 'recommendations' && 'Recommandations'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <Filter className="w-5 h-5 mr-2" />
                <span>{loading ? 'Génération...' : 'Générer le rapport'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Aperçu du rapport</h3>
            {consultations.length > 0 && (
              <button
                onClick={downloadReport}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                <span>Télécharger</span>
              </button>
            )}
          </div>

          {consultations.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-100 pb-2">
                <span>
                  {consultations.length} consultation{consultations.length > 1 ? 's' : ''}
                </span>
                <span>{formatDate(reportConfig.dateRange.start)} - {formatDate(reportConfig.dateRange.end)}</span>
              </div>

              <div className="space-y-4">
                {consultations.map(consultation => (
                  <div key={consultation.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{consultation.patientName}</span>
                      <span className="text-sm text-gray-500">{formatDate(consultation.date)}</span>
                    </div>

                    {reportConfig.sections.consultationHistory && (
                      <>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Motif:</span> {consultation.reasons?.join(', ')}
                        </p>
                        {consultation.notes && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Notes:</span> {consultation.notes}
                          </p>
                        )}
                      </>
                    )}

                    {reportConfig.sections.techniques && (
                      <>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {consultation.techniques?.map((technique: any, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                            >
                              {typeof technique === 'string' ? technique : technique.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {consultation.anatomicalAreas?.map((area: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-md"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {reportConfig.sections.evolution && consultation.evolution && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Évolution:</span> {consultation.evolution}
                      </p>
                    )}

                    {reportConfig.sections.recommendations && consultation.recommendations && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Recommandations:</span> {consultation.recommendations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mb-4" />
              <p>Générez un rapport pour voir l'aperçu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;