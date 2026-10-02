import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Image as ImageIcon } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { inventoryApi } from '../../services/inventoryApi';
import { API_ORIGIN } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Office', 'Shop', 'Commercial Space', 'Other'];
const listingTypes = ['For Sale', 'For Rent'];
const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Not Applicable'];
const furnishingOptions = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished', 'Not Applicable'];
const parkingOptions = ['No Parking', '1 Parking', '2 Parking', 'Multiple'];
const possessionOptions = ['Ready to Move', 'Under Construction', 'Immediately Available', 'Available From Date'];
const amenitiesList = ['Lift', 'Security', 'Gym', 'Swimming Pool', 'Power Backup', 'CCTV', 'Clubhouse', 'Garden', "Children's Play Area", 'Parking', 'Gated Community'];

export function AddInventory() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    property_type: 'Apartment',
    listing_type: 'For Sale',
    location: { city: '', locality: '', address: '' },
    price: '',
    bhk: '2 BHK',
    area: '',
    furnishing: 'Unfurnished',
    floor: '',
    total_floors: '',
    parking: '1 Parking',
    possession_status: 'Ready to Move',
    amenities: [] as string[],
    key_highlights: '',
    description: '',
    images: [] as string[]
  });
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchInventory(id);
    }
  }, [id, isEdit]);

  const fetchInventory = async (inventoryId: string) => {
    try {
      const data = await inventoryApi.getInventory(inventoryId);
      setFormData({
        ...data,
        price: data.price.toString(),
        area: data.area.toString(),
        floor: data.floor?.toString() || '',
        total_floors: data.total_floors?.toString() || ''
      });
    } catch (err: any) {
      setError('Failed to fetch inventory details.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locField = name.split('.')[1];
      setFormData(prev => ({ ...prev, location: { ...prev.location, [locField]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setError(null);
    try {
      const files = Array.from(e.target.files);
      const newImageUrls: string[] = [];
      for (const file of files) {
        const res = await inventoryApi.uploadImage(file);
        newImageUrls.push(res.url);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
    } catch (err: any) {
      setError('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.title || !formData.location.city || !formData.location.locality || !formData.price || !formData.area) {
      setError('Please fill all required fields.');
      return;
    }
    
    const priceNum = parseFloat(formData.price);
    const areaNum = parseFloat(formData.area);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(areaNum) || areaNum <= 0) {
      setError('Price and Area must be positive numbers.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: priceNum,
        area: areaNum,
        floor: formData.floor ? parseInt(formData.floor) : null,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
        salesperson_id: user!.id
      };

      if (isEdit) {
        await inventoryApi.updateInventory(id!, payload, user!.id);
      } else {
        await inventoryApi.createInventory(payload);
      }
      navigate('/salesperson/inventory');
    } catch (err: any) {
      setError(err.message || 'Failed to save inventory.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/salesperson/inventory')} className="p-2 hover:bg-surface rounded-full text-text-secondary hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{isEdit ? 'Edit Property' : 'Add New Property'}</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-surface/50 border-border/50 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Property Title *</label>
            <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Spacious 2 BHK Apartment in Manish Nagar" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Property Type *</label>
              <select name="property_type" value={formData.property_type} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white">
                {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Listing Type *</label>
              <select name="listing_type" value={formData.listing_type} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white">
                {listingTypes.map(lt => <option key={lt} value={lt}>{lt}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">City *</label>
              <Input name="location.city" value={formData.location.city} onChange={handleInputChange} placeholder="City" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Locality *</label>
              <Input name="location.locality" value={formData.location.locality} onChange={handleInputChange} placeholder="Locality / Area" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
              <Input name="location.address" value={formData.location.address} onChange={handleInputChange} placeholder="Full address" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Price (₹) *</label>
              <Input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g. 5500000" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">BHK *</label>
              <select name="bhk" value={formData.bhk} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white">
                {bhkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Built-up Area (sqft) *</label>
              <Input type="number" name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g. 1200" required />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-surface/50 border-border/50 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Property Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Furnishing</label>
              <select name="furnishing" value={formData.furnishing} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white">
                {furnishingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Floor</label>
              <Input type="number" name="floor" value={formData.floor} onChange={handleInputChange} placeholder="Floor No." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Total Floors</label>
              <Input type="number" name="total_floors" value={formData.total_floors} onChange={handleInputChange} placeholder="Total" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Parking</label>
              <select name="parking" value={formData.parking} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white">
                {parkingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Possession Status</label>
            <select name="possession_status" value={formData.possession_status} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white">
              {possessionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${formData.amenities.includes(amenity) ? 'bg-primary/20 text-primary border-primary/50' : 'bg-background text-text-secondary border-border hover:border-text-muted'}`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Key Highlights</label>
            <textarea name="key_highlights" value={formData.key_highlights} onChange={handleInputChange} rows={2} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Close to schools, hospitals and major IT hubs." />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Detailed Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Full property description..." />
          </div>
        </Card>

        <Card className="p-6 bg-surface/50 border-border/50 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Property Images</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.images.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-md overflow-hidden group border border-border">
                <img src={`${API_ORIGIN}${url}`} alt="Property" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-background cursor-pointer hover:border-primary/50 transition-colors text-text-muted hover:text-primary">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Add Images'}</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/salesperson/inventory')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> {isEdit ? 'Save Changes' : 'Save Property'}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
