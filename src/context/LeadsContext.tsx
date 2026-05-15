import { createContext, useContext, useState, ReactNode } from 'react';

export type LeadType = 'buyer' | 'seller';
export type LeadStatus = 'new' | 'in_progress' | 'done';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: LeadType;
  comment: string;
  status: LeadStatus;
  createdAt: Date;
}

interface LeadsContextType {
  leads: Lead[];
  addLead: (data: Omit<Lead, 'id' | 'status' | 'createdAt'>) => void;
  updateStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string) => void;
}

const LeadsContext = createContext<LeadsContextType | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);

  const addLead = (data: Omit<Lead, 'id' | 'status' | 'createdAt'>) => {
    const lead: Lead = {
      ...data,
      id: `lead-${Date.now()}`,
      status: 'new',
      createdAt: new Date(),
    };
    setLeads(prev => [lead, ...prev]);
  };

  const updateStatus = (id: string, status: LeadStatus) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));

  const deleteLead = (id: string) =>
    setLeads(prev => prev.filter(l => l.id !== id));

  return (
    <LeadsContext.Provider value={{ leads, addLead, updateStatus, deleteLead }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be inside LeadsProvider');
  return ctx;
}
