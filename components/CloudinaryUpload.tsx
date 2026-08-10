'use client';

import React, { useEffect, useRef } from 'react';

// ---------- Types ----------
interface CloudinaryWidget {
  open: () => void;
  destroy: () => void;
}

interface CloudinaryResult {
  event: string;
  info: {
    files?: Array<{ secure_url: string }>;
    secure_url?: string;
  };
}

interface CloudinaryUploadProps {
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  children?: React.ReactNode;
}

// Augment global Window interface
declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        config: Record<string, unknown>,
        callback: (error: unknown, result: CloudinaryResult) => void
      ) => CloudinaryWidget;
    };
  }
}

// ---------- Component ----------
const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUpload,
  multiple = true,
  maxFiles = 4,
  children,
}) => {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const scriptLoadedRef = useRef(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

  if (!cloudName) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
  }

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.cloudinary) {
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset: 'electro_store',
            multiple,
            maxFiles,
            folder: 'electro/products',
            sources: ['local', 'url', 'camera'],
            styles: {
              palette: {
                window: '#FFFFFF',
                sourceBg: '#F3F4F6',
                windowBorder: '#D1D5DB',
                tabIcon: '#2563EB',
                inactiveTabIcon: '#9CA3AF',
                menuIcons: '#2563EB',
                link: '#2563EB',
                action: '#2563EB',
                inProgress: '#2563EB',
                complete: '#22C55E',
                error: '#EF4444',
                textDark: '#1F2937',
                textLight: '#FFFFFF',
              },
            },
          },
          (error: unknown, result: CloudinaryResult) => {
            // Log any error for debugging
            if (error) {
              console.error('Cloudinary upload error:', error);
              return;
            }

            // Handle success
            if (result && result.event === 'success') {
              let urls: string[] = [];

              // The response shape can vary:
              // - if `multiple: true`, result.info.files is an array
              // - if `multiple: false`, result.info.secure_url is a string
              // - sometimes result.info is an array itself (depending on widget version)
              if (result.info?.files && Array.isArray(result.info.files)) {
                urls = result.info.files.map((file) => file.secure_url);
              } else if (result.info?.secure_url) {
                urls = [result.info.secure_url];
              } else {
                // fallback: if we can't find URLs, log the structure
                console.warn('Unexpected Cloudinary response structure:', result);
                return;
              }

              if (urls.length > 0) {
                onUpload(urls);
              }
            }
          }
        );
      }
    };
  }, [multiple, maxFiles, onUpload, cloudName]);

  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <div onClick={openWidget} className="cursor-pointer">
      {children || (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
          <p className="text-gray-500">Click to upload images</p>
          <p className="text-xs text-gray-400">Up to {maxFiles} images</p>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;