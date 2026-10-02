import { fetchApi } from './api';

export const leadsApi = {
  createLead: async (leadData: any) => {
    return fetchApi('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },
  getMyLeads: async (customerId: string) => {
    return fetchApi(`/leads/my?customer_id=${customerId}`);
  },
  getAllLeads: async () => {
    return fetchApi('/leads');
  },
  getLead: async (leadId: string) => {
    return fetchApi(`/leads/${leadId}`);
  },
  analyzeLead: async (leadId: string) => {
    return fetchApi(`/leads/${leadId}/analyze`, {
      method: 'POST'
    });
  },
  analyzeAllPendingLeads: async () => {
    return fetchApi('/leads/analyze-all', {
      method: 'POST'
    });
  },
  chatWithAI: async (data: { messages: any[], mode: string, lead_id?: string }) => {
    return fetchApi('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
