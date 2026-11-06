'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link2,
  Trash2,
  Check,
  Camera,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  showPhoto: boolean;
  onPhotoChange: (url: string, show: boolean) => void;
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  photoUrl,
  showPhoto,
  onPhotoChange,
}: PhotoUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [urlInput, setUrlInput] = useState(photoUrl || '');
  const [previewError, setPreviewError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setUrlInput(dataUrl);
        setPreviewError(false);
        onPhotoChange(dataUrl, true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      onPhotoChange('', showPhoto);
      return;
    }
    setPreviewError(false);
    onPhotoChange(trimmed, true);
  };

  const handleRemove = () => {
    setUrlInput('');
    setPreviewError(false);
    onPhotoChange('', false);
  };

  const toggleShowPhoto = () => {
    onPhotoChange(photoUrl, !showPhoto);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Profile Picture
              </h2>
              <p className="text-[11px] text-zinc-500">
                Upload a headshot or paste an image link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Current Avatar Preview & Status */}
          <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
            <div className="relative shrink-0">
              {photoUrl && !previewError ? (
                <img
                  src={photoUrl}
                  alt="Avatar preview"
                  onError={() => setPreviewError(true)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {photoUrl ? 'Photo set' : 'No photo uploaded'}
                </span>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Show Photo Toggle */}
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={showPhoto}
                  onChange={toggleShowPhoto}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 border-zinc-300 dark:border-zinc-600"
                />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Display photo on templates that support it
                </span>
              </label>
            </div>
          </div>

          {/* 2-Option Tabs: Upload vs Link */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Option 1: Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Option 2: Paste Link</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/20'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Click to browse or drag and drop
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  PNG, JPG, or WEBP up to 5MB
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Link */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                Image Web Address (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setPreviewError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply</span>
                </button>
              </div>

              {previewError && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Image URL could not be loaded. Please check the URL.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

