
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, IndianRupee } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { inventoryApi } from '../../services/inventoryApi';
import { useAuth } from '../../context/AuthContext';

export function InventoryList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [user]);

  const fetchInventory = async () => {
    try {
      const data = await inventoryApi.getMyInventory(user!.id);
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white py-8">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Inventory</h1>
          <p className="text-text-secondary">Manage your property listings.</p>
        </div>
        <Button
          onClick={() => navigate('/salesperson/inventory/add')}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
      </div>

      {inventory.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-border/50 bg-surface/50">
          <Building2 className="w-12 h-12 text-text-muted mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No properties in your inventory yet.</h2>
          <p className="text-text-secondary mb-6">Add your first property to start marketing it.</p>
          <Button onClick={() => navigate('/salesperson/inventory/add')} className="bg-primary">
            + Add Your First Property
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <Card key={item.id} className="overflow-hidden border-border/50 hover:border-border transition-colors flex flex-col">
              <div className="h-48 bg-surface border-b border-border/50 relative">
                {item.images && item.images.length > 0 ? (
                  <img src={`http://127.0.0.1:8005${item.images[0]}`} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Building2 className="w-8 h-8 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium border border-white/10">
                  {item.listing_type}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-semibold text-white line-clamp-1 flex-1" title={item.title}>{item.title}</h3>
                </div>
                <div className="text-sm text-text-secondary flex items-center gap-1.5 mb-3 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {item.location.locality}, {item.location.city}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-primary font-bold">
                    <IndianRupee className="w-4 h-4" />
                    <span>{item.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="bg-surface rounded p-2 text-center border border-border/50 text-text-secondary">
                    <span className="block font-medium text-white">{item.bhk}</span>
                  </div>
                  <div className="bg-surface rounded p-2 text-center border border-border/50 text-text-secondary">
                    <span className="block font-medium text-white">{item.area} <span className="text-xs font-normal">sqft</span></span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs text-text-muted">{item.possession_status}</span>
                  <Link to={`/salesperson/inventory/${item.id}`} className="text-sm font-medium text-primary hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
