import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { ExpenseInsert, Category } from '../../types';
import { CATEGORIES } from '../../lib/utils';
import toast from 'react-hot-toast';

interface ReceiptUploadProps {
  onAdd: (expense: ExpenseInsert) => Promise<boolean>;
}

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export default function ReceiptUpload({ onAdd }: ReceiptUploadProps) {
  const { user } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Other');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback(async (f: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Only JPG, PNG, and WebP images are accepted.');
      return;
    }

    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);

    // Upload to Supabase Storage
    if (!user) return;
    setUploading(true);
    try {
      const ext = f.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `receipts/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, f, { contentType: f.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('receipts').getPublicUrl(path);
      setReceiptUrl(data.publicUrl);
      toast.success('Receipt uploaded!');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload receipt. Please try again.');
      setPreview(null);
      setFile(null);
    } finally {
      setUploading(false);
    }
  }, [user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  }, [validateAndSetFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setReceiptUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!description.trim()) return;

    setSaving(true);
    const success = await onAdd({
      amount: numAmount,
      description: description.trim(),
      category,
      input_method: 'receipt',
      receipt_url: receiptUrl,
    });

    if (success) {
      clearFile();
      setAmount('');
      setDescription('');
      setCategory('Other');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 text-crimson-400 bg-crimson-500/10 border border-crimson-500/20 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drop zone */}
      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-lime-400 bg-lime-400/5'
              : 'border-obsidian-700 hover:border-obsidian-600 hover:bg-obsidian-900/50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-obsidian-800 flex items-center justify-center">
            <Upload size={20} className="text-obsidian-400" />
          </div>
          <div className="text-center">
            <p className="text-obsidian-300 font-500 text-sm">Drop your receipt here</p>
            <p className="text-obsidian-600 text-xs mt-1">JPG, PNG, WebP up to {MAX_SIZE_MB}MB</p>
          </div>
          <span className="text-xs text-obsidian-500 bg-obsidian-800 px-3 py-1.5 rounded-lg">
            or click to browse
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-obsidian-700">
          <img
            src={preview}
            alt="Receipt preview"
            className="w-full max-h-48 object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-obsidian-950/60 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
                <span className="text-xs text-obsidian-300">Uploading...</span>
              </div>
            </div>
          )}
          {receiptUrl && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-obsidian-950/80 backdrop-blur-sm rounded-lg px-2 py-1">
              <ImageIcon size={11} className="text-lime-400" />
              <span className="text-xs text-lime-400">Uploaded</span>
            </div>
          )}
          <button
            onClick={clearFile}
            className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center hover:bg-crimson-500/20 transition-colors"
          >
            <X size={13} className="text-obsidian-300" />
          </button>
        </div>
      )}

      {/* Form (shown after upload) */}
      {receiptUrl && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <p className="text-xs text-obsidian-500">Enter the details from your receipt:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="input-field"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="input-field appearance-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field"
              placeholder="What was this receipt for?"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving || !amount || !description}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-obsidian-950 border-t-transparent animate-spin" />
            ) : (
              <>
                <Plus size={16} strokeWidth={2.5} />
                Save Expense
              </>
            )}
          </button>
        </form>
      )}

      {/* File selected but not uploaded yet — waiting for upload */}
      {file && !receiptUrl && !uploading && !error && (
        <p className="text-xs text-obsidian-500 text-center">Preparing upload...</p>
      )}
    </div>
  );
}
