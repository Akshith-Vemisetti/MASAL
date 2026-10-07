import { fetchApi } from './api';

export const inventoryApi = {
  createInventory: async (data: any) =>
    fetchApi('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyInventory: async (salespersonId: string) =>
    fetchApi(`/inventory/my?${new URLSearchParams({ salesperson_id: salespersonId })}`),

  getInventory: async (inventoryId: string) =>
    fetchApi(`/inventory/${encodeURIComponent(inventoryId)}`),

  updateInventory: async (inventoryId: string, data: any, salespersonId: string) =>
    fetchApi(
      `/inventory/${encodeURIComponent(inventoryId)}?${new URLSearchParams({ salesperson_id: salespersonId })}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    ),

  deleteInventory: async (inventoryId: string, salespersonId: string) =>
    fetchApi(
      `/inventory/${encodeURIComponent(inventoryId)}?${new URLSearchParams({ salesperson_id: salespersonId })}`,
      { method: 'DELETE' },
    ),

  uploadImage: async (file: File) =>
    new Promise<{ url: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          if (typeof reader.result !== 'string') {
            throw new Error('Unable to read the selected image.');
          }
          const result = await fetchApi('/inventory/upload', {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              data: reader.result,
            }),
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    }),

  generateMarketingPost: async (inventoryId: string) =>
    fetchApi(`/inventory/${encodeURIComponent(inventoryId)}/marketing-post`, {
      method: 'POST',
    }),

  matchLeads: async (salespersonId: string, signal?: AbortSignal) =>
    fetchApi(`/inventory/match-leads?${new URLSearchParams({ salesperson_id: salespersonId })}`, {
      method: 'POST',
      signal,
    }),

  rematchLeads: async (inventoryId: string, salespersonId: string, signal?: AbortSignal) =>
    fetchApi(`/inventory/${encodeURIComponent(inventoryId)}/rematch-leads?${new URLSearchParams({ salesperson_id: salespersonId })}`, {
      method: 'POST',
      signal,
    }),
};
