'use client';

import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  className?: string;
  zoom?: number;
}

export default function GoogleMap({
  latitude = 31.6295,
  longitude = -7.9811,
  address = 'Marrakech, Morocco',
  className = 'h-64 w-full rounded-2xl',
  zoom = 14,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    // Avoid loading the script multiple times (check both window.google and existing tag)
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!(window as unknown as Record<string, unknown>).google && !existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if ((window as unknown as Record<string, unknown>).google) {
      initMap();
    } else if (existingScript) {
      // Script tag exists but not yet loaded — wait for it
      existingScript.addEventListener('load', initMap);
    }

    function initMap() {
      if (!mapRef.current || !(window as unknown as Record<string, unknown>).google) return;

      const google = (window as unknown as Record<string, unknown>).google as {
        maps: {
          Map: new (el: HTMLElement, opts: Record<string, unknown>) => Record<string, unknown>;
          Marker: new (opts: Record<string, unknown>) => Record<string, unknown>;
          LatLng: new (lat: number, lng: number) => unknown;
        };
      };

      const center = new google.maps.LatLng(latitude, longitude);
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#EDEAE5' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#8B1A1A' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#F7F3EE' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#7A7570' }] },
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#1A1A1A' }] },
        ],
      });

      new google.maps.Marker({ position: center, map, title: address });
    }
  }, [apiKey, latitude, longitude, address, zoom]);

  // Fallback when API key is not set
  if (!apiKey) {
    return (
      <div className={`${className} bg-[var(--stone)] border border-[var(--border)] flex items-center justify-center`}>
        <a
          href={`https://maps.google.com/?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center"
        >
          <svg className="w-8 h-8 text-[var(--gold-light)] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-[var(--gold-light)] hover:underline">Ouvrir dans Google Maps</span>
        </a>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
}
