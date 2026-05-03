import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "@/providers/trpc";
import { useTranslation } from "react-i18next";
import { Loader2, Sparkles, X, Check, TrendingUp, ImagePlus } from "lucide-react";

export default function CreateListing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Figures");
  const [condition, setCondition] = useState("New");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const createListing = trpc.marketplace.create.useMutation({
    onSuccess: () => navigate("/marketplace"),
    onError: (e) => setError(e.message),
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length < 3) { setTrends([]); return; }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/trpc/ai.trends?input=${encodeURIComponent(JSON.stringify({ query: title }))}`);
        if (res.ok) {
          const json = await res.json();
          setTrends(json.result?.data?.trends || []);
        }
      } catch {}
      setIsSearching(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [title]);

  const generateWithAI = async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/trpc/ai.listingSuggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, condition }),
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.result?.data;
        if (data) {
          setDescription(data.description);
          setPrice(data.suggestedPrice.toFixed(2));
          setCategory(data.category);
          setCondition(data.condition);
        }
      }
    } catch {}
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    if (!title || !price) { setError("Fill required fields"); return; }
    createListing.mutate({ title, description, category, condition, price: parseFloat(price), images });
  };

  const conditions = ["New", "Like New", "Used", "For Parts"];
  const categories = ["Figures", "Trading Cards", "3D Prints", "Apparel", "Accessories", "Other"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">List an Item</h1>
        <p className="text-gray-500 mb-8">Step {step} of 3</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">What are you selling?</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Figma Hatsune Miku #300" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500" />
              {isSearching && <div className="flex items-center gap-2 text-sm text-gray-400 mt-2"><Loader2 className="w-4 h-4 animate-spin" /> Searching trends...</div>}
            </div>

            {trends.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-3"><TrendingUp className="w-5 h-5" /><span className="font-medium">Market Trends</span></div>
                {trends.map((t: any, i: number) => (
                  <div key={i} className="flex justify-between bg-white p-3 rounded-lg mb-2">
                    <div><p className="font-medium text-sm">{t.title}</p><p className="text-xs text-gray-400">from {t.source}</p></div>
                    <div className="text-right"><p className="font-bold text-green-600">${t.avgPrice}</p><p className="text-xs text-gray-400">${t.minPrice} - ${t.maxPrice}</p></div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={generateWithAI} disabled={!title || isGenerating} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Auto-Generate with AI</>}
            </button>

            <button onClick={() => setStep(2)} disabled={!title} className="w-full py-3 bg-red-600 text-white rounded-lg disabled:opacity-50">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Condition</label>
              <div className="grid grid-cols-2 gap-3">
                {conditions.map(c => (
                  <button key={c} onClick={() => setCondition(c)} className={`p-3 rounded-lg border text-center ${condition === c ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Price (USD)</label>
              <div className="relative"><span className="absolute left-4 top-3 text-gray-400">$</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-8 pr-4 py-3 border rounded-lg" placeholder="0.00" /></div>
              {trends[0] && <p className="text-xs text-gray-400 mt-1">Market avg: ${trends[0].avgPrice}</p>}
            </div>
            <div>
              <label className="block font-medium mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe your item..." className="w-full px-4 py-3 border rounded-lg" />
              <button onClick={generateWithAI} disabled={isGenerating} className="mt-2 text-sm text-purple-600 flex items-center gap-1"><Sparkles className="w-4 h-4" /> {isGenerating ? "Generating..." : "Regenerate with AI"}</button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border rounded-lg">Back</button>
              <button onClick={() => setStep(3)} disabled={!price} className="flex-1 py-3 bg-red-600 text-white rounded-lg disabled:opacity-50">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Photos</label>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-red-400">
                  <ImagePlus className="w-8 h-8 text-gray-400 mb-1" /><span className="text-xs text-gray-400">Add Photo</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = e.target.files; if (!files) return; Array.from(files).forEach(file => { const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result) setImages(prev => [...prev, ev.target!.result as string]); }; reader.readAsDataURL(file); }); }} />
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3">Preview</h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-lg">{title}</h4>
                <p className="text-red-600 font-bold text-xl mt-1">${price}</p>
                <p className="text-sm text-gray-400 mt-1">{category} &middot; {condition}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{description}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border rounded-lg">Back</button>
              <button onClick={handleSubmit} disabled={createListing.isPending} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {createListing.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Listing...</> : <><Check className="w-5 h-5" /> List Item</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
