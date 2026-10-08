import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { inventoryApi } from '../../services/inventoryApi';
import { API_ORIGIN } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Office', 'Shop', 'Commercial Space', 'Other'];
const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Not Applicable'];
const furnishingOptions = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished', 'Not Applicable'];
const parkingOptions = ['No Parking', '1 Parking', '2 Parking', 'Multiple'];
const possessionOptions = ['Ready to Move', 'Under Construction', 'Immediately Available', 'Available From Date'];
const amenitiesList = [
  { id: 'Lift', icon: '🛗' },
  { id: 'Security', icon: '🛡️' },
  { id: 'Swimming Pool', icon: '🏊' },
  { id: 'CCTV', icon: '📹' },
  { id: 'Gym', icon: '🏋️' },
  { id: 'Garden', icon: '🌳' },
  { id: 'Power Backup', icon: '⚡' },
  { id: 'Clubhouse', icon: '🎪' },
  { id: 'Gated Community', icon: '🏘️' },
  { id: 'Parking', icon: '🚗' },
  { id: "Children's Play Area", icon: '🛝' },
  { id: 'Fire Safety', icon: '🧯' }
];

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

  const fetchInventory = useCallback(async (inventoryId: string) => {
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
      console.error(err);
      setError('Failed to fetch inventory details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      fetchInventory(id);
    }
  }, [id, isEdit, fetchInventory]);

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
      console.error(err);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const priceNum = parseFloat(formData.price);
    const areaNum = parseFloat(formData.area);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(areaNum) || areaNum <= 0) {
      setError('Price and Area must be positive numbers.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5DD3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/salesperson/inventory')} 
          className="flex items-center text-[#6C5DD3] font-semibold text-sm hover:text-[#5b4eb3] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Inventory
        </button>
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight mb-2">
          {isEdit ? 'Edit Property' : 'Add New Property'}
        </h1>
        <p className="text-[#64748B] text-sm">
          Fill in the details to list a new property in your inventory.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl shadow-sm mb-6 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-red-500" />
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
            
            {/* LEFT COLUMN: Form Fields */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-10">
              
              {/* Basic Details */}
              <section>
                <h2 className="text-[17px] font-bold text-[#0F172A] mb-5">Basic Details</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Property Title <span className="text-red-500">*</span></label>
                    <Input 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Luxury 3 BHK in Jubilee Hills" 
                      className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#1E293B] mb-2">Listing Type <span className="text-red-500">*</span></label>
                      <div className="flex bg-[#F1F5F9] rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, listing_type: 'For Sale' }))}
                          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                            formData.listing_type === 'For Sale' 
                              ? 'bg-white text-[#6C5DD3] shadow-sm' 
                              : 'text-[#64748B] hover:text-[#1E293B]'
                          }`}
                        >
                          For Sale
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, listing_type: 'For Rent' }))}
                          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                            formData.listing_type === 'For Rent' 
                              ? 'bg-white text-[#6C5DD3] shadow-sm' 
                              : 'text-[#64748B] hover:text-[#1E293B]'
                          }`}
                        >
                          For Rent
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1E293B] mb-2">Property Type <span className="text-red-500">*</span></label>
                      <select 
                        name="property_type" 
                        value={formData.property_type} 
                        onChange={handleInputChange} 
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 h-11 text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
                      >
                        {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#1E293B] mb-2">Price (₹) <span className="text-red-500">*</span></label>
                      <Input 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 15000000" 
                        className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Location Details */}
              <section>
                <h2 className="text-[17px] font-bold text-[#0F172A] mb-5">Location Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">City <span className="text-red-500">*</span></label>
                    <Input 
                      name="location.city" 
                      value={formData.location.city} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Hyderabad" 
                      className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Locality <span className="text-red-500">*</span></label>
                    <Input 
                      name="location.locality" 
                      value={formData.location.locality} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Jubilee Hills" 
                      className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1E293B] mb-2">Full Address <span className="text-red-500">*</span></label>
                  <Input 
                    name="location.address" 
                    value={formData.location.address} 
                    onChange={handleInputChange} 
                    placeholder="Enter complete address" 
                    className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                  />
                </div>
              </section>

              {/* Property Specifications */}
              <section>
                <h2 className="text-[17px] font-bold text-[#0F172A] mb-5">Property Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Area (sq.ft) <span className="text-red-500">*</span></label>
                    <Input 
                      type="number" 
                      name="area" 
                      value={formData.area} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 2400" 
                      className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">BHK <span className="text-red-500">*</span></label>
                    <select 
                      name="bhk" 
                      value={formData.bhk} 
                      onChange={handleInputChange} 
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 h-11 text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
                    >
                      {bhkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Possession Status</label>
                    <select 
                      name="possession_status" 
                      value={formData.possession_status} 
                      onChange={handleInputChange} 
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 h-11 text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
                    >
                      {possessionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Furnishing</label>
                    <select 
                      name="furnishing" 
                      value={formData.furnishing} 
                      onChange={handleInputChange} 
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 h-11 text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
                    >
                      {furnishingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Floor</label>
                    <Input 
                      type="number" 
                      name="floor" 
                      value={formData.floor} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 5" 
                      className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Total Floors</label>
                    <Input 
                      type="number" 
                      name="total_floors" 
                      value={formData.total_floors} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 12" 
                      className="bg-white border-[#E2E8F0] h-11 focus-visible:ring-[#6C5DD3]/20 focus-visible:border-[#6C5DD3]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Car Parking</label>
                    <select 
                      name="parking" 
                      value={formData.parking} 
                      onChange={handleInputChange} 
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 h-11 text-sm font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
                    >
                      {parkingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Amenities */}
              <section>
                <h2 className="text-[17px] font-bold text-[#0F172A] mb-5">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {amenitiesList.map(item => {
                    const isSelected = formData.amenities.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAmenity(item.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all border ${
                          isSelected 
                            ? 'bg-[#F5F3FF] border-[#8B5CF6] text-[#6C5DD3] font-semibold' 
                            : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="truncate">{item.id}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Additional Information */}
              <section>
                <h2 className="text-[17px] font-bold text-[#0F172A] mb-5">Additional Information</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Key Highlights <span className="text-red-500">*</span></label>
                    <textarea 
                      name="key_highlights" 
                      value={formData.key_highlights} 
                      onChange={handleInputChange} 
                      rows={3} 
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] resize-none" 
                      placeholder="e.g. Close to schools, IT hubs, good connectivity..." 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-2">Detailed Description <span className="text-red-500">*</span></label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows={5} 
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] resize-none" 
                      placeholder="Describe the property in detail..." 
                      required
                    />
                  </div>
                </div>
              </section>

            </div>
            
            {/* RIGHT COLUMN: Images */}
            <div className="lg:col-span-5 xl:col-span-4">
              <section className="sticky top-8">
                <h2 className="text-[17px] font-bold text-[#0F172A] mb-5">Property Images</h2>
                
                <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl bg-[#F8FAFC] p-8 text-center flex flex-col items-center justify-center hover:bg-[#F1F5F9] transition-colors relative mb-6">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <UploadCloud className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <p className="text-sm font-semibold text-[#1E293B] mb-1">Drag & drop images here</p>
                  <p className="text-sm text-[#64748B] mb-3">or click to browse</p>
                  <p className="text-xs text-[#94A3B8]">Supported formats: JPG, PNG, WEBP (Max 5MB each)</p>
                  
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    disabled={uploading} 
                  />
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6] mb-2" />
                      <span className="text-sm font-semibold text-[#8B5CF6]">Uploading...</span>
                    </div>
                  )}
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-[#E2E8F0]">
                        <img src={`${API_ORIGIN}${url}`} alt={`Property ${idx+1}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)} 
                          className="absolute top-1.5 right-1.5 bg-white/90 text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#E2E8F0] p-6 lg:p-8 flex justify-end gap-4 bg-[#F8FAFC]/50 rounded-b-2xl mt-auto">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/salesperson/inventory')} 
              disabled={saving}
              className="bg-white border-[#E2E8F0] text-[#475569] hover:bg-gray-50 h-11 px-6 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white shadow-sm h-11 px-8 font-semibold transition-colors" 
              disabled={saving || uploading}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEdit ? 'Save Changes' : 'Add Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

