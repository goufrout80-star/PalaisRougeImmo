'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import type { UploadFolder } from '@/lib/cloudinary';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: UploadFolder;
}

export default function ImageUpload({ images, onChange, folder = 'properties' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const publicIds = useRef<Map<string, string>>(new Map());
  const dragIndex = useRef<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            newUrls.push(data.url);
            if (data.publicId) publicIds.current.set(data.url, data.publicId);
            continue;
          }
        }

        const base64 = await fileToBase64(file);
        newUrls.push(base64);
      } catch {
        const base64 = await fileToBase64(file);
        newUrls.push(base64);
      }
    }

    onChange([...images, ...newUrls]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = useCallback(async (index: number) => {
    const url = images[index];
    const publicId = publicIds.current.get(url);

    if (publicId) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });
      } catch {
        console.warn('[ImageUpload] Cloudinary delete failed for', publicId);
      }
      publicIds.current.delete(url);
    }

    onChange(images.filter((_, i) => i !== index));
  }, [images, onChange]);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(dropIndex, 0, moved);
    dragIndex.current = null;
    onChange(reordered);
  };

  return (
    <div>
      {/* Image Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
        {images.map((img, i) => (
          <div
            key={img + i}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, i)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[var(--border)] group cursor-grab active:cursor-grabbing"
          >
            <Image src={img} alt="" fill className="object-cover" sizes="150px" />

            {/* Drag handle */}
            <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-white drop-shadow" />
            </div>

            {/* Principal badge on first image */}
            {i === 0 && (
              <div className="absolute bottom-1.5 left-1.5 bg-[var(--rouge)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                Principal
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-[var(--rouge)] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-[4/3] rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--gold-light)] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-[var(--gold-light)] animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-[var(--noir)]" />
              <span className="text-[10px] text-[var(--stone)]">Ajouter</span>
            </>
          )}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-[10px] text-[var(--stone)]">{images.length} images • JPG, PNG, WebP • Max 10MB • Glissez pour réordonner</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
