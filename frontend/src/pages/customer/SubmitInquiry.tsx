import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CustomerLayout } from '../../layouts/CustomerLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { leadsApi } from '../../services/leadsApi';
import { CheckCircle2, User, MapPin, Building, Maximize, IndianRupee, Clock, Briefcase, Landmark, MessageSquare, Send } from 'lucide-react';

export function SubmitInquiry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: '',
    propertyRequirement: '',
    propertyType: '',
    bhkOrSize: '',
    budget: '',
    buyingTimeline: '',
    purpose: '',
    financing: '',
    customerMessage: ''
  });

  useEffect(() => {
    if (user?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user?.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        property_requirement: formData.propertyRequirement,
        property_type: formData.propertyType || undefined,
        bhk_or_size: formData.bhkOrSize || undefined,
        budget: formData.budget,
        buying_timeline: formData.buyingTimeline,
        purpose: formData.purpose || undefined,
        financing: formData.financing || undefined,
        customer_message: formData.customerMessage,
        customer_id: user?.id || 'unknown'
      };
      
      await leadsApi.createLead(payload);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/inquiries');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1a1e2d] text-white p-6 md:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B14] via-[#0A0B14]/80 to-transparent"></div>
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 flex items-center gap-3">
              <Send className="w-6 h-6 text-[#8b5cf6]" />
              Submit Inquiry
            </h1>
            <p className="text-gray-400 text-sm max-w-md">
              Provide details about what you're looking for, and our team will match you with the best options.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {success ? (
            <div className="py-16 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-sm border border-green-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Inquiry Submitted!</h3>
              <p className="text-gray-500">We've received your requirements. Redirecting to your inquiries...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Basic Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" /> Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-white text-gray-900 border-gray-200 focus-visible:ring-[#8b5cf6] shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" /> Location (City/Area)
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Nagpur, IT Park"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-white text-gray-900 border-gray-200 focus-visible:ring-[#8b5cf6] shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Property Specifications */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Property Specifications</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="propertyRequirement" className="text-gray-700 font-medium">Property Requirement</Label>
                  <Input
                    id="propertyRequirement"
                    name="propertyRequirement"
                    placeholder="e.g., 2BHK Apartment, Commercial Office"
                    value={formData.propertyRequirement}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="bg-white text-gray-900 border-gray-200 focus-visible:ring-[#8b5cf6] shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-gray-700 font-medium flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" /> Property Type
                    </Label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="flex h-11 w-full rounded-md border border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all"
                      disabled={isLoading}
                    >
                      <option value="">Select type</option>
                      <option value="appartment">Appartment</option>
                      <option value="individual house">Individual House</option>
                      <option value="villa">Villa</option>
                      <option value="flat">Flat</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bhkOrSize" className="text-gray-700 font-medium flex items-center gap-2">
                      <Maximize className="w-4 h-4 text-gray-400" /> BHK / Size
                    </Label>
                    <Input
                      id="bhkOrSize"
                      name="bhkOrSize"
                      placeholder="e.g., 2 BHK or 1500 sqft"
                      value={formData.bhkOrSize}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="bg-white text-gray-900 border-gray-200 focus-visible:ring-[#8b5cf6] shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Financials & Timeline */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Financials & Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-gray-700 font-medium flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-400" /> Budget
                    </Label>
                    <Input
                      id="budget"
                      name="budget"
                      placeholder="e.g., 50-60 Lakhs"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-white text-gray-900 border-gray-200 focus-visible:ring-[#8b5cf6] shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyingTimeline" className="text-gray-700 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" /> Buying Timeline
                    </Label>
                    <Input
                      id="buyingTimeline"
                      name="buyingTimeline"
                      placeholder="e.g., Within 3 months"
                      value={formData.buyingTimeline}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-white text-gray-900 border-gray-200 focus-visible:ring-[#8b5cf6] shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="purpose" className="text-gray-700 font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" /> Purpose
                    </Label>
                    <select
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="flex h-11 w-full rounded-md border border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all"
                      disabled={isLoading}
                    >
                      <option value="">Select purpose</option>
                      <option value="Self-use">Self-use</option>
                      <option value="Investment">Investment</option>
                      <option value="Rental">Rental</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="financing" className="text-gray-700 font-medium flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-gray-400" /> Financing
                    </Label>
                    <select
                      id="financing"
                      name="financing"
                      value={formData.financing}
                      onChange={handleChange}
                      className="flex h-11 w-full rounded-md border border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all"
                      disabled={isLoading}
                    >
                      <option value="">Select financing</option>
                      <option value="Cash">Cash</option>
                      <option value="Loan">Loan</option>
                      <option value="Not decided">Not decided</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Additional Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Additional Comments</h3>
                <div className="space-y-2">
                  <Label htmlFor="customerMessage" className="text-gray-700 font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" /> Tell us what you're looking for...
                  </Label>
                  <Textarea
                    id="customerMessage"
                    name="customerMessage"
                    placeholder="I'm looking for a 2BHK in Nagpur with close proximity to schools and a park..."
                    className="min-h-[140px] bg-white text-gray-900 border-gray-200 focus-visible:ring-[#8b5cf6] shadow-sm resize-y"
                    value={formData.customerMessage}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto px-8 h-12 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all font-medium flex items-center justify-center gap-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Inquiry
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

