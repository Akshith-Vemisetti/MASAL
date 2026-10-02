const API_URL = 'http://127.0.0.1:8005/api';

export const inventoryApi = {
  createInventory: async (data: any) => {
    const response = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail ? JSON.stringify(err.detail) : 'Failed to create inventory');
    }
    return response.json();
  },

  getMyInventory: async (salespersonId: string) => {
    const response = await fetch(`${API_URL}/inventory/my?salesperson_id=${salespersonId}`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  getInventory: async (inventoryId: string) => {
    const response = await fetch(`${API_URL}/inventory/${inventoryId}`);
    if (!response.ok) throw new Error('Failed to fetch inventory details');
    return response.json();
  },

  updateInventory: async (inventoryId: string, data: any, salespersonId: string) => {
    const response = await fetch(`${API_URL}/inventory/${inventoryId}?salesperson_id=${salespersonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update inventory');
    return response.json();
  },

  deleteInventory: async (inventoryId: string, salespersonId: string) => {
    const response = await fetch(`${API_URL}/inventory/${inventoryId}?salesperson_id=${salespersonId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete inventory');
    return response.json();
  },

  uploadImage: async (file: File) => {
    return new Promise<{url: string}>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const response = await fetch(`${API_URL}/inventory/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              data: reader.result
            }),
          });
          if (!response.ok) throw new Error('Failed to upload image');
          resolve(await response.json());
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = error => reject(error);
    });
  },

  generateMarketingPost: async (inventoryId: string) => {
    const response = await fetch(`${API_URL}/inventory/${inventoryId}/marketing-post`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail ? JSON.stringify(err.detail) : 'Failed to generate marketing post');
    }
    return response.json();
  }
};
