import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CustomerLayout } from '../../layouts/CustomerLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { leadsApi } from '../../services/leadsApi';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Submit Inquiry</h1>
          <p className="text-text-secondary text-lg">
            Provide details about what you're looking for, and our AI will match you with the best options.
          </p>
        </div>

        <Card className="bg-surface border-border">
          <CardContent className="pt-6">
            {success ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-medium text-white">Inquiry Submitted!</h3>
                <p className="text-text-secondary">Redirecting to your inquiries...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (City/Area)</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g., Nagpur, IT Park"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyRequirement">Property Requirement</Label>
                      <Input
                        id="propertyRequirement"
                        name="propertyRequirement"
                        placeholder="e.g., 2BHK Apartment, Commercial Office"
                        value={formData.propertyRequirement}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleChange as any}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bhkOrSize">BHK / Size</Label>
                      <Input
                        id="bhkOrSize"
                        name="bhkOrSize"
                        placeholder="e.g., 2 BHK or 1500 sqft"
                        value={formData.bhkOrSize}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <select
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange as any}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                        disabled={isLoading}
                      >
                        <option value="">Select purpose</option>
                        <option value="Self-use">Self-use</option>
                        <option value="Investment">Investment</option>
                        <option value="Rental">Rental</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        name="budget"
                        placeholder="e.g., 50-60 Lakhs"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyingTimeline">Buying Timeline</Label>
                      <Input
                        id="buyingTimeline"
                        name="buyingTimeline"
                        placeholder="e.g., Within 3 months"
                        value={formData.buyingTimeline}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="financing">Financing</Label>
                    <select
                      id="financing"
                      name="financing"
                      value={formData.financing}
                      onChange={handleChange as any}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                      disabled={isLoading}
                    >
                      <option value="">Select financing</option>
                      <option value="Cash">Cash</option>
                      <option value="Loan">Loan</option>
                      <option value="Not decided">Not decided</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerMessage">Tell us what you're looking for...</Label>
                    <Textarea
                      id="customerMessage"
                      name="customerMessage"
                      placeholder="I'm looking for a 2BHK in Nagpur with close proximity to schools..."
                      className="min-h-[120px]"
                      value={formData.customerMessage}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
