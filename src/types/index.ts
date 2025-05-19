export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
  medicalHistory?: string;
  notes?: string;
  lastConsultation?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  reason: string;
  notes: string;
  techniques: {
    category: 'active' | 'passive' | 'manual' | 'respiratory' | 'instrumental' | 'complementary';
    name: string;
    description?: string;
    targetGroups?: string[];
    purpose?: string;
  }[];
  anatomicalAreas: string[];
  recommendations: string;
  evolution: string;
  nextSessionNotes: string;
  createdAt: any;
  updatedAt: any;
}

export interface BillingSettings {
  id: string;
  rates: {
    consultation: {
      cabinet: number;
      domicile: number;
    };
    majorations: {
      dimanche: number;
      nuit: number;
      ferie: number;
    };
    indemnites: {
      deplacement: number;
      kilometrique: number;
    };
  };
  conventionnement: 'secteur1' | 'secteur2';
  updatedAt: any;
}

export interface ConsultationBilling {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'cabinet' | 'domicile';
  baseRate: number;
  majorations: {
    type: 'dimanche' | 'nuit' | 'ferie';
    amount: number;
  }[];
  indemnites: {
    type: 'deplacement' | 'kilometrique';
    amount: number;
    details?: {
      distance?: number;
    };
  }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: 'carte' | 'especes' | 'cheque' | 'tiers_payant';
  paymentDate?: string;
  createdAt: any;
  updatedAt: any;
}