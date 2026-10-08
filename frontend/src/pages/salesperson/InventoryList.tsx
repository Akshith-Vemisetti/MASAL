
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Search, MoreVertical, Sparkles, Loader2, Bed, Maximize, Building2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { inventoryApi } from '../../services/inventoryApi';
import { API_ORIGIN } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function InventoryList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'All' | 'For Sale' | 'For Rent'>('All');
  const [propertyType, setPropertyType] = useState('All Types');
  const [listingType, setListingType] = useState('All');
  const [possessionStatus, setPossessionStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');

  const fetchInventory = useCallback(async () => {
    try {
      const data = await inventoryApi.getMyInventory(user!.id);
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [user, fetchInventory]);

  const handleMatchLeads = async () => {
    if (!user?.id) return;
    setMatching(true);
    setMatchStatus(null);
    abortControllerRef.current = new AbortController();
    
    try {
      await inventoryApi.matchLeads(user.id, abortControllerRef.current.signal);
      setMatchStatus('✓ Lead matching updated successfully!');
      fetchInventory();
      setTimeout(() => setMatchStatus(null), 3000);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message.includes('aborted')) {
        setMatchStatus('Matching cancelled.');
      } else {
        const errorMsg = err.message || 'Failed to match leads.';
        if (errorMsg.toLowerCase().includes('token limit')) {
           alert('Sorry, token limit exceeded. Please try again later.');
        } else {
           setMatchStatus(`Error: ${errorMsg}`);
        }
      }
      setTimeout(() => setMatchStatus(null), 5000);
    } finally {
      setMatching(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelMatch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const filteredInventory = useMemo(() => {
    let result = inventory;

    // Tabs
    if (selectedTab !== 'All') {
      result = result.filter(item => item.listing_type === selectedTab);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.location.locality.toLowerCase().includes(q) ||
        item.property_type.toLowerCase().includes(q)
      );
    }

    // Property Type Filter
    if (propertyType !== 'All Types') {
      result = result.filter(item => item.property_type === propertyType);
    }

    // Listing Type Filter (Dropdown)
    if (listingType !== 'All') {
      result = result.filter(item => item.listing_type === listingType);
    }
    
    // Possession Status Filter
    if (possessionStatus !== 'All') {
      result = result.filter(item => item.possession_status === possessionStatus);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'Newest First') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'Oldest First') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'Price: High to Low') {
        return b.price - a.price;
      }
      if (sortBy === 'Price: Low to High') {
        return a.price - b.price;
      }
      return 0;
    });

    return result;
  }, [inventory, selectedTab, searchQuery, propertyType, listingType, possessionStatus, sortBy]);

  const counts = useMemo(() => {
    return {
      all: inventory.length,
      sale: inventory.filter(i => i.listing_type === 'For Sale').length,
      rent: inventory.filter(i => i.listing_type === 'For Rent').length
    };
  }, [inventory]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FB]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5DD3]" />
      </div>
    );
  }

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTab('All');
    setPropertyType('All Types');
    setListingType('All');
    setPossessionStatus('All');
    setSortBy('Newest First');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-8 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Inventory Management</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage and track all your properties</p>
        </div>
        <div className="flex items-center gap-3">
          {matchStatus && (
            <div className={`text-sm font-medium ${matchStatus.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {matchStatus}
            </div>
          )}
          {matching ? (
             <Button
               onClick={handleCancelMatch}
               variant="outline"
               className="border-red-500 text-red-500 hover:bg-red-50 rounded-lg h-10 px-4"
             >
               <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Matching...
             </Button>
          ) : (
            <Button
              onClick={handleMatchLeads}
              className="bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-gray-50 flex items-center gap-2 shadow-sm rounded-lg h-10 px-4 font-medium"
            >
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" /> AI Match Leads
            </Button>
          )}
          <Button
            onClick={() => navigate('/salesperson/inventory/add')}
            className="bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white flex items-center gap-2 shadow-sm rounded-lg h-10 px-5 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] mb-6">
        {[
          { label: 'All Properties', count: counts.all, val: 'All' },
          { label: 'For Sale', count: counts.sale, val: 'For Sale' },
          { label: 'For Rent', count: counts.rent, val: 'For Rent' }
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setSelectedTab(tab.val as any)}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
              selectedTab === tab.val
                ? 'border-[#6C5DD3] text-[#6C5DD3]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by property name, location or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] transition-all text-sm shadow-sm placeholder:text-[#94A3B8]"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm font-medium text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] shadow-sm appearance-none cursor-pointer min-w-[130px]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
          >
            <option>Property Type</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Independent House</option>
            <option>Commercial Space</option>
            <option>Plot</option>
          </select>

          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm font-medium text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] shadow-sm appearance-none cursor-pointer min-w-[120px]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
          >
            <option>Listing Type</option>
            <option>For Sale</option>
            <option>For Rent</option>
          </select>

          <select
            value={possessionStatus}
            onChange={(e) => setPossessionStatus(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm font-medium text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] shadow-sm appearance-none cursor-pointer min-w-[120px]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
          >
            <option>Possession</option>
            <option>Ready to Move</option>
            <option>Under Construction</option>
            <option>Immediately Available</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm font-medium text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] shadow-sm appearance-none cursor-pointer min-w-[130px]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
          >
            <option>Sort By: Newest</option>
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Price: High to Low</option>
            <option>Price: Low to High</option>
          </select>
          
          {(searchQuery || selectedTab !== 'All' || propertyType !== 'All Types' || listingType !== 'All' || possessionStatus !== 'All' || sortBy !== 'Newest First') && (
             <button 
               onClick={clearFilters}
               className="text-[#EF4444] text-sm font-medium hover:text-red-700 whitespace-nowrap ml-2 flex items-center"
             >
               Clear Filters <X className="w-3.5 h-3.5 ml-1" />
             </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredInventory.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-[#E2E8F0] shadow-sm mt-8">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4 border border-[#E2E8F0]">
            <Search className="w-8 h-8 text-[#94A3B8]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2 tracking-tight">No properties found</h2>
          <p className="text-[#64748B] mb-6 max-w-sm text-sm">We couldn't find any properties matching your current filters. Try adjusting them or clear filters.</p>
          <Button onClick={clearFilters} variant="outline" className="border-[#E2E8F0] text-[#475569] hover:bg-gray-50">
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => {
            const isSale = item.listing_type === 'For Sale';
            
            // Format price smartly
            let displayPrice = '';
            if (item.price >= 10000000) {
                displayPrice = `₹ ${(item.price / 10000000).toFixed(2)} Cr`;
            } else if (item.price >= 100000) {
                displayPrice = `₹ ${(item.price / 100000).toFixed(2)} Lac`;
            } else {
                displayPrice = `₹ ${item.price.toLocaleString('en-IN')}`;
            }

            return (
              <div key={item.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
                {/* Image Header */}
                <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={`${API_ORIGIN}${item.images[0]}`} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F1F5F9] text-[#94A3B8] text-sm">
                      No Image Available
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className={`px-2.5 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wide shadow-sm ${
                      isSale ? 'bg-[#10B981]' : 'bg-[#8B5CF6]'
                    }`}>
                      {isSale ? 'FOR SALE' : 'FOR RENT'}
                    </div>
                  </div>
                  {/* Actions Dropdown Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded flex items-center justify-center text-[#475569] hover:text-[#0F172A] shadow-sm transition-colors border border-white/20" onClick={(e) => { e.preventDefault(); alert("Coming Soon"); }}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {/* Bottom Gradient for text legibility if needed, but the design keeps it clean */}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[#0F172A] text-base mb-1.5 line-clamp-1 tracking-tight" title={item.title}>
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center text-[#64748B] text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1.5 text-[#94A3B8] shrink-0" />
                    <span className="line-clamp-1">{item.location.locality}, {item.location.city}</span>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm font-medium text-[#475569] mb-4">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-[#94A3B8]" />
                      {item.bhk}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize className="w-4 h-4 text-[#94A3B8]" />
                      {item.area} sq.ft
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#94A3B8]" />
                      <span className="truncate max-w-[80px]" title={item.property_type}>{item.property_type}</span>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[#E2E8F0] mb-4"></div>

                  {/* Footer - Price & Possession */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="font-bold text-[#0F172A] text-lg">
                      {displayPrice} <span className="text-sm font-medium text-[#64748B]">{isSale ? '' : '/mo'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        item.possession_status === 'Ready to Move' || item.possession_status === 'Immediately Available'
                          ? 'bg-[#10B981]' 
                          : 'bg-[#F59E0B]'
                      }`}></div>
                      <span className="text-[13px] font-medium text-[#64748B]">
                        {item.possession_status}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/salesperson/inventory/${item.id}`} 
                    className="mt-auto block w-full text-center py-2.5 rounded-lg border border-[#6C5DD3] text-[#6C5DD3] hover:bg-[#6C5DD3] hover:text-white font-semibold text-sm transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


