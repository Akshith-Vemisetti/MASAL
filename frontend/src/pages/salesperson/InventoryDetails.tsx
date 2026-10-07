import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, MapPin, IndianRupee, Sparkles, Building2, Copy, Download, RefreshCw, CheckCircle2, Users, X, AlertTriangle, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (id) {
      fetchInventory(id);
    }
  }, [id]);

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

      ctx.fillStyle = '#8B5CF6';
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

  const fetchInventory = async (inventoryId: string) => {
    try {
      const data = await inventoryApi.getInventory(inventoryId);
      setInventory(data);
    } catch (err: any) {
      setError('Failed to fetch inventory details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    setDeleting(true);
    try {
      await inventoryApi.deleteInventory(id!, user!.id);
      navigate('/salesperson/inventory');
    } catch (err: any) {
      setError('Failed to delete inventory.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-white py-8">Loading details...</div>;
  if (error || !inventory) return <div className="text-red-400 py-8">{error || 'Inventory not found'}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/salesperson/inventory')} className="p-2 hover:bg-surface rounded-full text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                {inventory.listing_type}
              </span>
              <span className="text-text-muted text-sm">{inventory.property_type}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{inventory.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/salesperson/inventory/${id}/edit`)} className="border-border text-white">
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} disabled={deleting} className="border-red-500/50 text-red-500 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Section */}
          <Card className="overflow-hidden bg-surface/50 border-border/50 p-1">
            {inventory.images && inventory.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-2 h-64 md:h-96">
                  <img src={`${API_ORIGIN}${inventory.images[0]}`} alt="Main Property" className="w-full h-full object-cover rounded-md" />
                </div>
                {inventory.images.slice(1, 3).map((img: string, idx: number) => (
                  <div key={idx} className="h-32 md:h-48">
                    <img src={`${API_ORIGIN}${img}`} alt="Property" className="w-full h-full object-cover rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-muted bg-surface rounded-md">
                <Building2 className="w-12 h-12 mb-2 opacity-50" />
                <span>No images uploaded</span>
              </div>
            )}
          </Card>

          {/* Details Card */}
          <Card className="p-6 bg-surface/50 border-border/50">
            <h2 className="text-xl font-semibold text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-text-muted text-sm mb-1">Price</p>
                <div className="flex items-center text-primary font-bold">
                  <IndianRupee className="w-4 h-4" />
                  <span>{inventory.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">BHK</p>
                <p className="text-white font-medium">{inventory.bhk}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Area</p>
                <p className="text-white font-medium">{inventory.area} sqft</p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Location</p>
                <p className="text-white font-medium line-clamp-1" title={`${inventory.location.locality}, ${inventory.location.city}`}>
                  {inventory.location.locality}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border/50 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-text-secondary">Furnishing</span>
                <span className="text-white font-medium">{inventory.furnishing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Parking</span>
                <span className="text-white font-medium">{inventory.parking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Floor</span>
                <span className="text-white font-medium">{inventory.floor || '-'}/{inventory.total_floors || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Possession</span>
                <span className="text-white font-medium">{inventory.possession_status}</span>
              </div>
            </div>

            {inventory.key_highlights && (
              <div className="mb-6">
                <h3 className="text-text-secondary font-medium mb-2">Key Highlights</h3>
                <p className="text-white text-sm bg-surface p-3 rounded-md border border-border/50">
                  {inventory.key_highlights}
                </p>
              </div>
            )}

            {inventory.description && (
              <div>
                <h3 className="text-text-secondary font-medium mb-2">Description</h3>
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {inventory.description}
                </p>
              </div>
            )}
          </Card>

          {/* AI Match Leads Section */}
          <Card className="p-6 bg-surface/50 border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">✨ Top Lead Recommendations</h2>
                  {rematchStatus && (
                    <p className={`text-sm mt-1 ${rematchStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                      {rematchStatus}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rematching ? (
                  <Button onClick={handleCancelRematch} variant="outline" size="sm" className="border-red-500/50 text-red-500 hover:bg-red-500/10 group" title="Cancel Matching">
                    <div className="relative w-4 h-4 mr-2 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin absolute group-hover:opacity-0 transition-opacity" />
                      <X className="w-4 h-4 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    Agent is matching...
                  </Button>
                ) : (
                  <Button onClick={handleRematchLeads} variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                    <RefreshCw className="w-4 h-4 mr-2" /> 🔄 Re-match Leads
                  </Button>
                )}
              </div>
            </div>

            {inventory.ai_lead_matches?.recommendations?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {inventory.ai_lead_matches.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-surface rounded-lg p-4 border border-border/50 hover:border-purple-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-white">{rec.lead_name}</h3>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-semibold">
                        {rec.match_score}% Match
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">{rec.why_match}</p>

                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-medium text-white mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-400" /> Matches
                        </h4>
                        <ul className="space-y-1.5 pl-5.5">
                          {rec.matching_factors.map((factor: string, i: number) => (
                            <li key={i} className="text-text-secondary flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span> {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {rec.concerns && rec.concerns.length > 0 && (
                        <div>
                          <h4 className="font-medium text-white mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400" /> Concerns
                          </h4>
                          <ul className="space-y-1.5 pl-5.5">
                            {rec.concerns.map((concern: string, i: number) => (
                              <li key={i} className="text-text-secondary flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span> {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-3 border-t border-border/50">
                        <div className="text-purple-400 font-medium mb-1">Recommended Action:</div>
                        <p className="text-white text-sm">{rec.recommended_action}</p>
                      </div>

                      <div className="pt-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/salesperson/leads')} className="text-xs">
                          View Lead
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-surface rounded-lg border border-border/50 text-text-muted">
                {rematching ? "Matching in progress..." : "No lead recommendations available for this property. Click Re-match to find matches."}
              </div>
            )}

            {inventory.ai_lead_matches?.generated_at && (
              <div className="mt-4 text-right text-xs text-text-muted">
                Last matched: {new Date(inventory.ai_lead_matches.generated_at.endsWith('Z') ? inventory.ai_lead_matches.generated_at : inventory.ai_lead_matches.generated_at + 'Z').toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: AI Marketing Placeholder & Amenities */}
        <div className="space-y-6">

          {/* FUTURE AI FEATURE PLACEHOLDER */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary/20 blur-2xl w-24 h-24 rounded-full"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Marketing Post</h2>
                </div>
              </div>
              {marketingPost && (
                <Button variant="outline" size="sm" onClick={handleGenerateMarketing} disabled={generatingMarketing} className="border-primary/50 text-primary hover:bg-primary/20">
                  <RefreshCw className={`w-4 h-4 mr-2 ${generatingMarketing ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              )}
            </div>

            {!marketingPost ? (
              <div className="relative z-10">
                <p className="text-sm text-text-secondary mb-6">
                  Automatically generate highly converting social media posts, captions, and hashtag strategies for this property using AI.
                </p>

                {marketingError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md">
                    {marketingError}
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary-hover text-white transition-colors"
                  onClick={handleGenerateMarketing}
                  disabled={generatingMarketing}
                >
                  {generatingMarketing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating your marketing post...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Marketing Post
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="relative z-10 space-y-6 animate-in fade-in duration-500">
                {/* Image Preview with HTML Overlay */}
                <div className="relative rounded-lg overflow-hidden border border-border/50 group">
                  <img src={marketingPost.image_base64} alt="Marketing" className="w-full aspect-square object-cover" />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded w-max mb-3 uppercase tracking-wider">
                      {inventory.listing_type}
                    </span>
                    <div className="text-white text-3xl font-bold mb-1 shadow-black drop-shadow-md">
                      ₹{inventory.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-white text-xl font-bold shadow-black drop-shadow-md">
                      {inventory.bhk} {inventory.property_type}
                    </div>
                    <div className="text-gray-300 text-sm shadow-black drop-shadow-md">
                      {inventory.location.locality}, {inventory.location.city}
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" onClick={downloadImage} className="bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-text-secondary">Caption</h3>
                    <button
                      onClick={() => copyToClipboard(marketingPost.caption, 'caption')}
                      className="text-xs flex items-center text-primary hover:text-primary-hover transition-colors"
                    >
                      {copiedCaption ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiedCaption ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-surface/80 p-3 rounded-md border border-border/50 text-sm text-white whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {marketingPost.caption}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-text-secondary">Hashtags</h3>
                    <button
                      onClick={() => copyToClipboard(marketingPost.hashtags.join(' '), 'hashtags')}
                      className="text-xs flex items-center text-primary hover:text-primary-hover transition-colors"
                    >
                      {copiedHashtags ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiedHashtags ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {marketingPost.hashtags.map((tag: string, idx: number) => (
                      <span key={idx} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </Card>

          {/* Amenities List */}
          {inventory.amenities && inventory.amenities.length > 0 && (
            <Card className="p-6 bg-surface/50 border-border/50">
              <h2 className="text-lg font-semibold text-white mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {inventory.amenities.map((amenity: string) => (
                  <span key={amenity} className="px-3 py-1 bg-surface border border-border rounded-full text-xs text-text-secondary">
                    {amenity}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Location Details */}
          <Card className="p-6 bg-surface/50 border-border/50">
            <h2 className="text-lg font-semibold text-white mb-4">Location Map</h2>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-medium">{inventory.location.locality}, {inventory.location.city}</p>
                {inventory.location.address && (
                  <p className="text-text-secondary text-xs mt-1">{inventory.location.address}</p>
                )}
              </div>
            </div>
            <div className="w-full h-32 bg-surface rounded-md border border-border flex items-center justify-center text-text-muted text-xs">
              Map View Placeholder
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
