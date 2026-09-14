import React, { useState, useRef, useEffect } from 'react';
import { X, Crop, ZoomIn, ZoomOut, Upload, Link, Check, RefreshCw } from 'lucide-react';

export default function ImageCropModal({
  isOpen = true,
  initialImage = '',
  title = 'Image Crop Editor',
  onClose,
  onCropComplete
}) {
  const [imageSrc, setImageSrc] = useState(initialImage || '');
  const [aspectRatio, setAspectRatio] = useState('16:9'); // 'free', '1:1', '4:3', '16:9', '2.5:1'
  const [zoom, setZoom] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0); // -100 to 100
  const [offsetY, setOffsetY] = useState(0); // -100 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [previewUrl, setPreviewUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileError, setFileError] = useState('');
  const canvasRef = useRef(null);

  // Sync initial image
  useEffect(() => {
    if (initialImage) {
      setImageSrc(initialImage);
    }
  }, [initialImage]);

  // Handle local file selection with validation
  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate File Type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFileError('Invalid file format. Please upload a PNG, JPG, WEBP, or GIF image.');
      return;
    }

    // Validate File Size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size too large. Maximum allowed size is 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setZoom(1.0);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input
  const handleLoadUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setImageSrc(urlInput.trim());
    setZoom(1.0);
    setOffsetX(0);
    setOffsetY(0);
  };

  // Calculate target dimensions based on aspect ratio
  const getTargetDimensions = () => {
    switch (aspectRatio) {
      case '1:1': return { width: 600, height: 600 };
      case '4:3': return { width: 800, height: 600 };
      case '16:9': return { width: 960, height: 540 };
      case '2.5:1': return { width: 1000, height: 400 };
      case 'free':
      default:
        return { width: 800, height: 600 };
    }
  };

  // Draw and generate crop preview
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const { width: targetW, height: targetH } = getTargetDimensions();
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      // Clear background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, targetW, targetH);

      // Compute scaling
      const scaleToCover = Math.max(targetW / img.width, targetH / img.height);
      const drawWidth = img.width * scaleToCover * zoom;
      const drawHeight = img.height * scaleToCover * zoom;

      // Base centered coordinates
      const baseDx = (targetW - drawWidth) / 2;
      const baseDy = (targetH - drawHeight) / 2;

      // Offset shift
      const finalDx = baseDx + (offsetX / 100) * (drawWidth / 2);
      const finalDy = baseDy + (offsetY / 100) * (drawHeight / 2);

      ctx.drawImage(img, finalDx, finalDy, drawWidth, drawHeight);

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPreviewUrl(croppedDataUrl);
    };

    img.onerror = () => {
      setFileError('Could not load image. Please verify image URL or try uploading a local image file.');
    };

    img.src = imageSrc;
  }, [imageSrc, aspectRatio, zoom, offsetX, offsetY]);

  // Touch & Mouse Drag Handlers for Repositioning
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragStart({ x: clientX - offsetX, y: clientY - offsetY });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;

    const newX = Math.max(-100, Math.min(100, clientX - dragStart.x));
    const newY = Math.max(-100, Math.min(100, clientY - dragStart.y));

    setOffsetX(newX);
    setOffsetY(newY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleSaveCrop = () => {
    if (!previewUrl) return;
    onCropComplete(previewUrl);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '10px' }}>
              <Crop size={22} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Crop, resize & adjust aspect ratio before saving
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
            aria-label="Close Crop Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Notification */}
        {fileError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            ⚠️ {fileError}
          </div>
        )}

        {/* Upload & Image URL Selector */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
            <Upload size={16} /> Choose Image File
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>

          <form onSubmit={handleLoadUrl} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Link size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Or paste Image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>Load URL</button>
          </form>
        </div>

        {/* Editor Main Content Area */}
        {imageSrc ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
            {/* Interactive Crop Viewport Canvas */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Drag image to reposition & scale
              </div>
              <div
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                style={{
                  width: '100%',
                  height: '260px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '2px dashed var(--accent-primary)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Crop Viewport"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  />
                )}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600
                }}>
                  Aspect: {aspectRatio}
                </div>
              </div>
            </div>

            {/* Controls & Live Preview Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Aspect Ratio Selector Buttons */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Select Aspect Ratio:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Free', '1:1', '4:3', '16:9', '2.5:1'].map((ratio) => {
                    const normalizedRatio = ratio.toLowerCase() === 'free' ? 'free' : ratio;
                    const isActive = aspectRatio === normalizedRatio;
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(normalizedRatio)}
                        className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}
                      >
                        {ratio}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zoom Controls Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Zoom Level:</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ZoomOut size={16} color="var(--text-dim)" />
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                  />
                  <ZoomIn size={16} color="var(--text-dim)" />
                </div>
              </div>

              {/* Reset Controls */}
              <button
                type="button"
                onClick={() => { setZoom(1.0); setOffsetX(0); setOffsetY(0); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', alignSelf: 'flex-start', padding: '6px 12px' }}
              >
                <RefreshCw size={14} /> Reset Position & Zoom
              </button>

              {/* Final Cropped Preview Thumbnail */}
              {previewUrl && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Cropped Result Preview:
                  </div>
                  <div style={{ width: '100%', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000' }}>
                    <img src={previewUrl} alt="Final Cropped Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '16px',
            border: '2px dashed var(--border-color)'
          }}>
            <Upload size={36} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Image Selected</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Upload a local photo or paste an image URL to begin cropping.
            </p>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
            Cancel
          </button>
          <button
            onClick={handleSaveCrop}
            disabled={!previewUrl}
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', opacity: previewUrl ? 1 : 0.6 }}
          >
            <Check size={18} /> Apply Cropped Image
          </button>
        </div>
      </div>
    </div>
  );
}
