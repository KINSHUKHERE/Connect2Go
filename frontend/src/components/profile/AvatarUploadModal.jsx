import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Link as LinkIcon, 
  Trash2, 
  Check, 
  AlertCircle, 
  X,
  RefreshCw
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
  },
  {
    id: 'music-7',
    name: 'Music & Jamming',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'minimal-8',
    name: 'Minimalist Vector',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
  }
];

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
  const [uploadedPublicId, setUploadedPublicId] = useState(currentPublicId || null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  // Sync preview when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentAvatar || getSafeAvatar(userName));
      setUploadedPublicId(currentPublicId || null);
      setErrorMessage(null);
      setIsUploading(false);
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

    setIsUploading(true);

    try {
      // 1. Instant client-side base64 preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);

      // 2. Attempt backend Cloudinary upload if available
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.success && data?.url) {
            setPreviewUrl(data.url);
            setUploadedPublicId(data.public_id || null);
          }
        }
      } catch (backendErr) {
        // Backend upload optional - local base64 preview is already loaded
        console.info('Backend upload deferred to local image data:', backendErr.message);
      }
    } catch (err) {
      setErrorMessage('Failed to read image file. Please try another photo.');
    } finally {
      setIsUploading(false);
    }
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
    setUploadedPublicId(null);
    setErrorMessage(null);
  };

  const handleSave = () => {
    if (!previewUrl) {
      setErrorMessage('Please select or upload an avatar first.');
      return;
    }
    onSaveAvatar(previewUrl, uploadedPublicId);
    onClose();
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
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Avatar"
      subtitle="Upload a photo or choose an avatar to display on your profile and navbar."
      maxWidth="max-w-md"
    >
      <div className="space-y-5 py-2 text-left">
        
        {/* Live Preview Card */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="relative group">
            <img
              src={getSafeAvatar(userName, previewUrl)}
              alt={userName}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/30 shadow-md bg-white"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              title="Click to choose new photo"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span>Browse</span>
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Active preview" />
          </div>

          <div className="text-center mt-2.5">
            <p className="text-xs font-bold text-dark-text">{userName}</p>
            <p className="text-[11px] text-dark-muted">Live Preview (Navbar & Profile)</p>
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
            <span>Upload</span>
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
            <span>Web URL</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragOver 
                  ? 'border-brand-500 bg-brand-50/50' 
                  : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-dark-text">
                Click to browse or drag & drop photo
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP or GIF (Up to 10MB)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <p className="text-[11px] font-semibold text-slate-500">
              Pick a curated persona matching your favorite activities:
            </p>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = previewUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPreviewUrl(preset.url);
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
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <span className="text-[9px] font-semibold text-dark-text mt-1 truncate w-full text-center">
                      {preset.name.split(' ')[0]}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 rounded-full text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-2 animate-in fade-in duration-150">
            <label className="block text-[11px] font-bold text-dark-muted">
              Paste Image Link
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 h-10 px-3 bg-slate-50 border border-border rounded-xl text-xs text-dark-text placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs font-bold">
                Preview
              </Button>
            </div>
          </form>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset to default avatar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Default</span>
            </button>

            {onRemoveAvatar && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 py-1.5 px-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Remove avatar and delete permanently from Cloudinary"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
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
              className="text-xs font-bold shadow-xs px-4"
            >
              {isUploading ? 'Uploading...' : 'Save Avatar'}
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
export default AvatarUploadModal;
