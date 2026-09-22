import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Link as LinkIcon, 
  Trash2, 
  Check, 
  AlertCircle, 
  X,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Award,
  Zap
} from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { getSafeAvatar } from '../../utils/imageUtils.js';

// Curated avatar presets for rapid selection
const AVATAR_PRESETS = [
  {
    id: 'sports-1',
    name: 'Sports & Athletics',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'fitness-2',
    name: 'Fitness & Cardio',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-3',
    name: 'Campus Study',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'coder-4',
    name: 'Tech & Coding',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'traveler-5',
    name: 'Outdoors & Travel',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'gamer-6',
    name: 'Gaming & Fun',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80'
  }
];

// Curated Frame Overlay Styles
const AVATAR_FRAMES = [
  {
    id: 'none',
    name: 'No Frame',
    ringClass: 'ring-2 ring-slate-200',
    badge: null,
    gradient: 'from-slate-100 to-slate-200'
  },
  {
    id: 'emerald',
    name: 'Emerald Verified',
    ringClass: 'ring-4 ring-emerald-500 shadow-lg shadow-emerald-500/20',
    badge: '✓',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'gold',
    name: 'Gold Champion',
    ringClass: 'ring-4 ring-amber-400 shadow-lg shadow-amber-500/20',
    badge: '★',
    gradient: 'from-amber-400 to-yellow-500'
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    ringClass: 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-500/30',
    badge: '⚡',
    gradient: 'from-cyan-400 to-fuchsia-500'
  },
  {
    id: 'sports',
    name: 'Sports Athletic',
    ringClass: 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/20',
    badge: '🏸',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'party',
    name: 'Confetti Party',
    ringClass: 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/20',
    badge: '✨',
    gradient: 'from-purple-500 to-pink-500'
  }
];

/**
 * Composite photo with chosen frame on canvas to produce a framed image Data URI
 */
async function createFramedPhoto(photoUrl, frameId, width = 400, height = 400) {
  return new Promise((resolve) => {
    if (frameId === 'none') {
      resolve(photoUrl);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = (width / 2) - 16;

      // Draw circular cropped photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const aspect = img.width / img.height;
      let drawW = width;
      let drawH = height;
      let drawX = 0;
      let drawY = 0;
      if (aspect > 1) {
        drawW = height * aspect;
        drawX = (width - drawW) / 2;
      } else {
        drawH = width / aspect;
        drawY = (height - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Draw Selected Frame Ring
      ctx.lineWidth = 12;
      let grad;
      if (frameId === 'emerald') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#059669');
      } else if (frameId === 'gold') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.5, '#fbbf24');
        grad.addColorStop(1, '#d97706');
      } else if (frameId === 'neon') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.5, '#3b82f6');
        grad.addColorStop(1, '#ec4899');
      } else if (frameId === 'sports') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(1, '#1d4ed8');
      } else if (frameId === 'party') {
        grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#f43f5e');
      }

      if (grad) {
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      resolve(canvas.toDataURL('image/jpeg', 0.90));
    };
    img.onerror = () => resolve(photoUrl);
    img.src = photoUrl;
  });
}

export function AvatarUploadModal({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  currentPublicId,
  userName = 'User', 
  onSaveAvatar,
  onRemoveAvatar
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || '');
  const [selectedFrame, setSelectedFrame] = useState('emerald');
  const [uploadedPublicId, setUploadedPublicId] = useState(currentPublicId || null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  
  // Uploading & Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('Uploading image...');
  const [errorMessage, setErrorMessage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [rawFile, setRawFile] = useState(null);

  const fileInputRef = useRef(null);

  // Sync preview when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentAvatar || getSafeAvatar(userName));
      setUploadedPublicId(currentPublicId || null);
      setSelectedFrame('emerald');
      setErrorMessage(null);
      setIsUploading(false);
      setRawFile(null);
    }
  }, [isOpen, currentAvatar, currentPublicId, userName]);

  // Handle local file selection
  const processFile = async (file) => {
    if (!file) return;
    setErrorMessage(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size is too large (maximum 10MB allowed).');
      return;
    }

    setRawFile(file);

    // Instant client-side preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      setErrorMessage('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }
    setPreviewUrl(trimmed);
    setRawFile(null);
    setUploadedPublicId(null);
    setErrorMessage(null);
  };

  // Main Save Handler: Composite Frame -> Upload to Server -> Progress Loader -> Update State
  const handleSave = async () => {
    if (!previewUrl) {
      setErrorMessage('Please select or upload a photo first.');
      return;
    }

    setIsUploading(true);
    setUploadStatusText('Stage 1/3: Compositing photo & frame overlay...');

    try {
      // 1. Composite photo with selected frame ring using Canvas
      const framedDataUrl = await createFramedPhoto(previewUrl, selectedFrame);

      setUploadStatusText('Stage 2/3: Uploading photo to cloud storage...');

      let finalUrl = framedDataUrl;
      let finalPublicId = null;

      // 2. Upload to backend / Cloudinary
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

        let uploadBody;
        let isFormData = false;

        if (rawFile && selectedFrame === 'none') {
          const formData = new FormData();
          formData.append('image', rawFile);
          uploadBody = formData;
          isFormData = true;
        } else {
          // Convert framed base64 Data URL to Blob for upload
          const blobRes = await fetch(framedDataUrl);
          const blob = await blobRes.blob();
          const formData = new FormData();
          formData.append('image', blob, 'avatar_framed.jpg');
          uploadBody = formData;
          isFormData = true;
        }

        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: uploadBody,
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.success && data?.url) {
            finalUrl = data.url;
            finalPublicId = data.public_id || null;
          }
        }
      } catch (backendErr) {
        console.warn('Server upload notice:', backendErr.message);
      }

      setUploadStatusText('Stage 3/3: Saving profile & updating navbar...');
      await new Promise(r => setTimeout(r, 600));

      if (onSaveAvatar) {
        await onSaveAvatar(finalUrl, finalPublicId);
      }

      onClose();
    } catch (err) {
      setErrorMessage('Failed to process image upload. Please try another photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (onRemoveAvatar) {
      await onRemoveAvatar();
    }
    onClose();
  };

  const handleResetToDefault = () => {
    const defaultDicebear = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || 'User')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    setPreviewUrl(defaultDicebear);
    setRawFile(null);
    setSelectedFrame('none');
    setErrorMessage(null);
  };

  const currentFrameObj = AVATAR_FRAMES.find(f => f.id === selectedFrame) || AVATAR_FRAMES[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={isUploading ? undefined : onClose}
      title="Upload Profile Picture"
      subtitle="Upload your photo, select a frame, and save to your profile."
      maxWidth="max-w-md"
    >
      <div className="space-y-5 py-2 text-left relative">

        {/* Full-Screen / Modal Uploading Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 rounded-2xl animate-in fade-in duration-200 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Upload className="w-6 h-6 text-brand-600 animate-bounce" />
              </div>
            </div>

            <h3 className="text-sm font-extrabold text-dark-text tracking-tight">
              Uploading Profile Photo
            </h3>
            <p className="text-xs font-semibold text-brand-700 mt-1 max-w-xs leading-relaxed animate-pulse">
              {uploadStatusText}
            </p>
            <p className="text-[11px] text-dark-faint mt-3">
              Please wait while your photo & frame are saved...
            </p>
          </div>
        )}
        
        {/* Step 1 & 2 Preview Card with Live Frame Ring */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="relative group">
            <img
              src={getSafeAvatar(userName, previewUrl)}
              alt={userName}
              className={`w-28 h-28 rounded-full object-cover bg-white transition-all duration-200 ${currentFrameObj.ringClass}`}
            />

            {currentFrameObj.badge && (
              <span className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r ${currentFrameObj.gradient} text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-md`}>
                {currentFrameObj.badge}
              </span>
            )}

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              title="Click to choose photo"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span>Change Photo</span>
            </div>
          </div>

          <div className="text-center mt-3">
            <p className="text-xs font-bold text-dark-text">{userName}</p>
            <p className="text-[11px] text-brand-700 font-semibold mt-0.5">
              Frame Active: <span className="underline">{currentFrameObj.name}</span>
            </p>
          </div>
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-white text-dark-text shadow-xs' : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('presets'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'presets' ? 'bg-white text-dark-text shadow-xs' : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'url' ? 'bg-white text-dark-text shadow-xs' : 'text-dark-muted hover:text-dark-text'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>URL</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Upload Photo Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragOver 
                  ? 'border-brand-500 bg-brand-50/50' 
                  : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-dark-text">
                Click to browse or drag & drop photo
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP or GIF (Up to 10MB)
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Choose Frame Selection Matrix */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <p className="text-xs font-bold text-dark-text flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>2. Select Avatar Frame</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_FRAMES.map((frame) => {
              const isSelected = selectedFrame === frame.id;
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => setSelectedFrame(frame.id)}
                  className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected 
                      ? 'border-brand-500 ring-2 ring-brand-500/40 bg-brand-50/40' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${frame.gradient} flex items-center justify-center text-[10px] text-white font-bold shrink-0`}>
                    {frame.badge || '•'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-dark-text truncate">{frame.name}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = previewUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPreviewUrl(preset.url);
                      setRawFile(null);
                      setErrorMessage(null);
                    }}
                    className={`relative p-1 rounded-2xl border transition-all flex flex-col items-center group ${
                      isSelected 
                        ? 'border-brand-500 ring-2 ring-brand-500/40 bg-brand-50/30' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <span className="text-[9px] font-semibold text-dark-text mt-1 truncate w-full text-center">
                      {preset.name.split(' ')[0]}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-500 rounded-full text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-2 animate-in fade-in duration-150">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 h-9 px-3 bg-slate-50 border border-border rounded-xl text-xs text-dark-text placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs font-bold">
                Preview
              </Button>
            </div>
          </form>
        )}

        {/* Action Footer: Save Button with Loader */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reset to default avatar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isUploading}
              className="text-xs font-bold shadow-xs px-5 flex items-center gap-1.5 min-w-[120px] justify-center"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>3. Save Avatar</span>
              )}
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
export default AvatarUploadModal;
