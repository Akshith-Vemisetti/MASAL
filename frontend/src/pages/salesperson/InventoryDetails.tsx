import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MapPin, Sparkles, Building2,
  Copy, Download, RefreshCw, CheckCircle2, Users, AlertTriangle,
  Loader2, Share2, Home, MessageSquare, BedDouble, Square, Car, Calendar, Info
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { inventoryApi } from '../../services/inventoryApi';
import { API_ORIGIN } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function InventoryDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [marketingPost, setMarketingPost] = useState<any>(null);
  const [generatingMarketing, setGeneratingMarketing] = useState(false);
  const [marketingError, setMarketingError] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const [rematching, setRematching] = useState(false);
  const [rematchStatus, setRematchStatus] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchInventory = useCallback(async (inventoryId: string) => {
    try {
      const data = await inventoryApi.getInventory(inventoryId);
      setInventory(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch inventory details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchInventory(id);
    }
  }, [id, fetchInventory]);

  const handleRematchLeads = async () => {
    if (!id || !user?.id) return;
    setRematching(true);
    setRematchStatus(null);
    abortControllerRef.current = new AbortController();

    try {
      const data = await inventoryApi.rematchLeads(id, user.id, abortControllerRef.current.signal);
      setInventory(data);
      setRematchStatus('✓ Property rematch successful!');
      setTimeout(() => setRematchStatus(null), 3000);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message.includes('aborted')) {
        setRematchStatus('Rematch cancelled.');
      } else {
        const errorMsg = err.message || 'Failed to rematch leads.';
        if (errorMsg.toLowerCase().includes('token limit')) {
          alert('Sorry, token limit exceeded. Please try again later.');
        } else {
          setRematchStatus(`Error: ${errorMsg}`);
        }
      }
      setTimeout(() => setRematchStatus(null), 5000);
    } finally {
      setRematching(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelRematch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleGenerateMarketing = async () => {
    if (!id) return;
    setGeneratingMarketing(true);
    setMarketingError(null);
    try {
      const data = await inventoryApi.generateMarketingPost(id);
      setMarketingPost(data);
    } catch (err: any) {
      setMarketingError(err.message || 'Failed to generate marketing post');
    } finally {
      setGeneratingMarketing(false);
    }
  };

  const copyToClipboard = (text: string, type: 'caption' | 'hashtags') => {
    navigator.clipboard.writeText(text);
    if (type === 'caption') {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  const downloadImage = () => {
    if (!marketingPost?.image_base64) return;
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const padding = 40;

      const gradient = ctx.createLinearGradient(0, canvas.height - 300, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 300, canvas.width, 300);

      ctx.fillStyle = '#6C5DD3';
      ctx.beginPath();
      ctx.roundRect(padding, canvas.height - 200, 150, 40, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(inventory.listing_type.toUpperCase(), padding + 20, canvas.height - 173);

      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`₹${inventory.price.toLocaleString('en-IN')}`, padding, canvas.height - 110);

      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`${inventory.bhk} ${inventory.property_type}`, padding, canvas.height - 70);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#E5E7EB';
      ctx.fillText(`${inventory.location.locality}, ${inventory.location.city}`, padding, canvas.height - 40);

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketing-${inventory.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
    };
    img.src = marketingPost.image_base64;
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    setDeleting(true);
    try {
      await inventoryApi.deleteInventory(id!, user!.id);
      navigate('/salesperson/inventory');
    } catch (err: any) {
      console.error(err);
      setError('Failed to delete inventory.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FB]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5DD3]" />
      </div>
    );
  }

  if (error || !inventory) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 flex flex-col items-center max-w-md text-center shadow-sm">
          <AlertTriangle className="w-10 h-10 mb-3 text-red-500" />
          <h2 className="text-lg font-bold mb-2">Error Loading Property</h2>
          <p>{error || 'Inventory not found'}</p>
          <Button className="mt-4 bg-[#6C5DD3] text-white" onClick={() => navigate('/salesperson/inventory')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#2b2b2b] p-4 lg:p-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate('/salesperson/inventory')}
            className="flex items-center text-[#6C5DD3] font-medium text-sm hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inventory
          </button>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Property Details</h1>
          <p className="text-sm text-[#5a607f]">View and manage property information and AI matches.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="bg-white border-[#e4e4e4] text-[#5a607f] hover:bg-gray-50 hover:text-[#2b2b2b]"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share Property
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/salesperson/inventory/${id}/edit`)}
            className="bg-white border-[#6C5DD3] text-[#6C5DD3] hover:bg-[#6C5DD3]/10"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-white border-red-200 text-red-500 hover:bg-red-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">

          {/* Images Section */}
          <Card className="overflow-hidden bg-white border border-[#e4e4e4] shadow-sm rounded-2xl p-2 relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#6C5DD3] text-white shadow-sm uppercase tracking-wider">
                {inventory.listing_type}
              </span>
            </div>

            {inventory.images && inventory.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-2 aspect-[4/3] md:aspect-auto md:h-[400px]">
                  <img src={`${API_ORIGIN}${inventory.images[0]}`} alt="Main Property" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="hidden md:flex flex-col gap-2 h-[400px]">
                  {inventory.images.length > 1 ? (
                    <img src={`${API_ORIGIN}${inventory.images[1]}`} alt="Property" className="w-full h-1/2 object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-1/2 bg-gray-100 rounded-xl" />
                  )}
                  {inventory.images.length > 2 ? (
                    <div className="w-full h-1/2 relative rounded-xl overflow-hidden group cursor-pointer">
                      <img src={`${API_ORIGIN}${inventory.images[2]}`} alt="Property" className="w-full h-full object-cover" />
                      {inventory.images.length > 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl group-hover:bg-black/60 transition-colors">
                          +{inventory.images.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-1/2 bg-gray-100 rounded-xl" />
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[#5a607f] bg-gray-50 rounded-xl">
                <Building2 className="w-12 h-12 mb-2 opacity-50 text-[#6C5DD3]" />
                <span className="font-medium">No images uploaded</span>
              </div>
            )}
          </Card>

          {/* Main Info Box */}
          <div className="px-2">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">{inventory.title}</h1>
                <div className="flex items-center text-[#5a607f] mb-4 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-1.5 text-[#6C5DD3]" />
                  {inventory.location.locality}, {inventory.location.city}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                    {inventory.property_type}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                    {inventory.possession_status}
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-3xl font-bold text-[#6C5DD3] flex items-center md:justify-end">
                  ₹{inventory.price.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-[#5a607f] mt-1 font-medium">
                  ₹{inventory.area ? Math.round(inventory.price / inventory.area).toLocaleString('en-IN') : 0} / sqft
                </div>
              </div>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-6 border-y border-[#e4e4e4] my-6">
              <div className="flex flex-col">
                <span className="text-xs text-[#5a607f] mb-1 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5" /> BHK
                </span>
                <span className="font-bold text-[#2b2b2b]">{inventory.bhk}</span>
              </div>
              <div className="flex flex-col border-l border-[#e4e4e4] pl-4">
                <span className="text-xs text-[#5a607f] mb-1 flex items-center gap-1.5">
                  <Square className="w-3.5 h-3.5" /> Area
                </span>
                <span className="font-bold text-[#2b2b2b]">{inventory.area} sqft</span>
              </div>
              <div className="flex flex-col border-l border-[#e4e4e4] pl-4">
                <span className="text-xs text-[#5a607f] mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> Furnishing
                </span>
                <span className="font-bold text-[#2b2b2b]">{inventory.furnishing}</span>
              </div>
              <div className="flex flex-col border-l md:border-none lg:border-solid lg:border-[#e4e4e4] pl-4 md:pl-0 lg:pl-4">
                <span className="text-xs text-[#5a607f] mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Floor
                </span>
                <span className="font-bold text-[#2b2b2b]">{inventory.floor || '-'}/{inventory.total_floors || '-'}</span>
              </div>
              <div className="flex flex-col border-l border-[#e4e4e4] pl-4">
                <span className="text-xs text-[#5a607f] mb-1 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" /> Parking
                </span>
                <span className="font-bold text-[#2b2b2b]">{inventory.parking}</span>
              </div>
              <div className="flex flex-col border-l border-[#e4e4e4] pl-4">
                <span className="text-xs text-[#5a607f] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Possession
                </span>
                <span className="font-bold text-[#2b2b2b] line-clamp-1" title={inventory.possession_status}>{inventory.possession_status}</span>
              </div>
            </div>

            {/* Amenities */}
            {inventory.amenities && inventory.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inventory.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-[#5a607f] bg-white p-3 rounded-lg border border-[#e4e4e4]">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {inventory.description && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">Description</h3>
                <div className="text-sm text-[#5a607f] whitespace-pre-wrap leading-relaxed bg-white p-6 rounded-xl border border-[#e4e4e4]">
                  {inventory.description}
                </div>
              </div>
            )}

            {/* AI Marketing Analysis Placeholder (Coming Soon or Dummy, requested by UI ref but generated in right column actually) */}
            {/* Since the screenshot showed "AI Marketing Analysis" on the left, we can put the generated marketing here if it exists, or just a coming soon placeholder if we prefer. The current codebase has the generator on the right. Let's keep generator on the right as a button, and if generated, show on the right. */}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">

          {/* Key Highlights */}
          {inventory.key_highlights && (
            <Card className="p-6 bg-white border border-[#e4e4e4] shadow-sm rounded-2xl">
              <h3 className="text-md font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C5DD3]" /> Key Highlights
              </h3>
              <div className="bg-[#F4F7FB] p-4 rounded-xl text-sm text-[#5a607f] leading-relaxed border border-[#e4e4e4]">
                {inventory.key_highlights}
              </div>
            </Card>
          )}

          {/* AI Match Leads Section */}
          <Card className="p-0 overflow-hidden bg-white border border-[#e4e4e4] shadow-sm rounded-2xl flex flex-col">
            <div className="p-5 border-b border-[#e4e4e4] bg-gradient-to-r from-[#F4F7FB] to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6C5DD3]/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#6C5DD3]" />
                </div>
                <h2 className="text-md font-bold text-[#1a1a2e]">Top Lead Recommendations</h2>
              </div>
              {rematching ? (
                <button onClick={handleCancelRematch} className="text-[#6C5DD3] hover:text-[#5b4eb3] p-1 group relative">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </button>
              ) : (
                <button onClick={handleRematchLeads} className="text-[#5a607f] hover:text-[#6C5DD3] p-1 transition-colors bg-white rounded-md shadow-sm border border-[#e4e4e4]">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="p-5 flex-1 max-h-[600px] overflow-y-auto">
              {rematchStatus && (
                <div className={`text-xs mb-4 p-2 rounded-md ${rematchStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {rematchStatus}
                </div>
              )}

              {inventory.ai_lead_matches?.recommendations?.length > 0 ? (
                <div className="space-y-4">
                  {inventory.ai_lead_matches.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-[#e4e4e4] hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#6C5DD3] to-[#4c3ab8]"></div>

                      <div className="flex justify-between items-start mb-2 pl-2">
                        <h3 className="font-bold text-[#1a1a2e]">{rec.lead_name}</h3>
                        <div className="bg-[#e6f4ea] text-[#1e8e3e] px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                          {rec.match_score}% Match
                        </div>
                      </div>

                      <p className="text-xs text-[#5a607f] mb-3 pl-2 break-words whitespace-pre-wrap">
                        {rec.why_match}
                      </p>

                      <div className="pl-2 space-y-1 mb-4">
                        {rec.matching_factors?.map((factor: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-[#5a607f]">
                            <CheckCircle2 className="w-3 h-3 text-[#1e8e3e] mt-0.5 shrink-0" />
                            <span className="break-words">{factor}</span>
                          </div>
                        ))}
                        {rec.concerns?.map((concern: string, i: number) => (
                          <div key={`c-${i}`} className="flex items-start gap-1.5 text-xs text-[#5a607f]">
                            <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                            <span className="break-words">{concern}</span>
                          </div>
                        ))}
                      </div>

                      {rec.recommended_action && (
                        <div className="pl-2 mb-4">
                          <div className="bg-[#6C5DD3]/5 border border-[#6C5DD3]/20 rounded-md p-2 flex gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#6C5DD3] shrink-0 mt-0.5" />
                            <p className="text-xs text-[#1a1a2e] font-medium break-words">
                              {rec.recommended_action}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pl-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/salesperson/leads/${rec.lead_id}`)} className="flex-1 h-8 text-xs bg-white border-[#e4e4e4] text-[#2b2b2b] hover:bg-gray-50">
                          View Lead
                        </Button>
                        <Button size="sm" className="h-8 w-8 p-0 bg-[#6C5DD3]/10 hover:bg-[#6C5DD3]/20 text-[#6C5DD3] shrink-0">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-[#5a607f] text-sm flex flex-col items-center">
                  <Info className="w-8 h-8 text-gray-300 mb-2" />
                  {rematching ? "Finding the best leads for this property..." : "No matches found yet. Click refresh to find potential buyers."}
                </div>
              )}
            </div>
          </Card>

          {/* AI Marketing Post Generator */}
          <Card className="p-6 bg-gradient-to-br from-[#6C5DD3]/5 to-transparent border border-[#e4e4e4] shadow-sm rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C5DD3]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#6C5DD3]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-md font-bold text-[#1a1a2e]">AI Marketing Copy</h2>
                  <p className="text-xs text-[#5a607f]">Generate social media ready posts.</p>
                </div>
              </div>

              {!marketingPost ? (
                <div>
                  {marketingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                      {marketingError}
                    </div>
                  )}
                  <Button
                    className="w-full bg-[#6C5DD3] hover:bg-[#5b4eb3] text-white shadow-sm shadow-[#6C5DD3]/20 transition-all font-medium"
                    onClick={handleGenerateMarketing}
                    disabled={generatingMarketing}
                  >
                    {generatingMarketing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Magic...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Generate New Marketing Copy</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Generated Image Preview */}
                  <div className="relative rounded-xl overflow-hidden shadow-sm group">
                    {(!marketingPost.image_base64 || marketingPost.image_base64 === "" || marketingPost.image_base64.includes("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+BAwAG/gM1l+cGEAAAAABJRU5ErkJggg==")) && (
                      <div className="absolute top-2 left-2 right-2 bg-orange-100/90 backdrop-blur-sm text-orange-800 text-xs p-2.5 rounded-lg z-20 border border-orange-200 shadow-sm flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">API Issue from Backend</span>
                          Image generation failed due to token limits or server error. Showing default property image instead.
                        </div>
                      </div>
                    )}
                    <img 
                      src={marketingPost.image_base64 && !marketingPost.image_base64.includes("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+BAwAG/gM1l+cGEAAAAABJRU5ErkJggg==") ? marketingPost.image_base64 : (inventory.images && inventory.images.length > 0 ? `${API_ORIGIN}${inventory.images[0]}` : 'https://placehold.co/600x600?text=No+Image+Available')} 
                      alt="Marketing" 
                      className="w-full aspect-square object-cover" 
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <div className="text-white font-bold text-xl drop-shadow-md">₹{inventory.price.toLocaleString('en-IN')}</div>
                      <div className="text-white/90 text-sm drop-shadow-md">{inventory.bhk} {inventory.property_type}</div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={downloadImage} className="w-8 h-8 bg-white/90 rounded-md flex items-center justify-center text-[#2b2b2b] hover:bg-white shadow-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Generated Caption */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2b2b2b]">Caption</span>
                      <button onClick={() => copyToClipboard(marketingPost.caption, 'caption')} className="text-[#6C5DD3] hover:text-[#5b4eb3] text-xs font-medium flex items-center">
                        {copiedCaption ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} {copiedCaption ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-[#e4e4e4] text-xs text-[#5a607f] whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {marketingPost.caption}
                    </div>
                  </div>

                  {/* Generated Hashtags */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2b2b2b]">Hashtags</span>
                      <button onClick={() => copyToClipboard(marketingPost.hashtags.join(' '), 'hashtags')} className="text-[#6C5DD3] hover:text-[#5b4eb3] text-xs font-medium flex items-center">
                        {copiedHashtags ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} {copiedHashtags ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {marketingPost.hashtags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-[#6C5DD3]/10 text-[#6C5DD3] px-2 py-1 rounded-md font-medium">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleGenerateMarketing} disabled={generatingMarketing} className="w-full text-xs bg-white border-[#e4e4e4] text-[#5a607f]">
                    <RefreshCw className={`w-3 h-3 mr-1.5 ${generatingMarketing ? 'animate-spin' : ''}`} /> Regenerate
                  </Button>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
