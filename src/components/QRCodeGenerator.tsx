"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
// import { QRCodeCanvas } from 'qrcode.react'; // Replacing this
import QRCodeStyling, {
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,

  Options
} from 'qr-code-styling';

import { Download, Share2, Type, Link as LinkIcon, Wifi, Mail, Settings2, Image as ImageIcon, Palette, Phone, MessageSquare, UserSquare2, MessageCircle, Shapes, Sparkles, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Types
type Extension = 'png' | 'jpeg' | 'webp' | 'svg';
type QRMode = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'vcard';
type GradientType = 'linear' | 'radial';

// Extended Settings
type QRCodeSettings = {
  data: string;
  width: number;
  height: number;
  image?: string;
  margin: number;
  qrOptions: {
    typeNumber: TypeNumber;
    mode: Mode;
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
    crossOrigin: string;
  };
  dotsOptions: {
    type: DotType;
    color: string;
    gradient?: {
      type: GradientType;
      rotation: number;
      colorStops: { offset: number; color: string }[];
    };
  };
  backgroundOptions: {
    color: string;
    gradient?: {
      type: GradientType;
      rotation: number;
      colorStops: { offset: number; color: string }[];
    };
  };
  cornersSquareOptions: {
    type: CornerSquareType;
    color: string;
  };
  cornersDotOptions: {
    type: CornerDotType;
    color: string;
  };
  // Extra UI state (not directly passed to lib, but used for logic)
  downloadOptions: {
    name: string;
    extension: Extension;
    resolution: number;
  };
};

// ... (State Interfaces kept same)
interface WifiState { ssid: string; password: string; encryption: 'WPA' | 'WEP' | 'nopass'; hidden: boolean; }
interface EmailState { email: string; subject: string; body: string; }
interface PhoneState { number: string; }
interface SmsState { number: string; message: string; }
interface WhatsappState { number: string; message: string; }
interface VCardState { firstName: string; lastName: string; phone: string; email: string; org: string; title: string; website: string; }

// Initial Options
const initialOptions: QRCodeSettings = {
  data: 'https://example.com',
  width: 300,
  height: 300,
  margin: 10,
  qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5, crossOrigin: 'anonymous' },
  dotsOptions: { type: 'rounded', color: '#0f172a' },
  backgroundOptions: { color: '#ffffff' },
  cornersSquareOptions: { type: 'extra-rounded', color: '#0f172a' },
  cornersDotOptions: { type: 'dot', color: '#0f172a' },
  downloadOptions: { name: 'nextqr', extension: 'png', resolution: 1000 }
};

export default function QRCodeGenerator() {
  const [mode, setMode] = useState<QRMode>('url');
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Data States
  const [wifiState, setWifiState] = useState<WifiState>({ ssid: '', password: '', encryption: 'WPA', hidden: false });
  const [emailState, setEmailState] = useState<EmailState>({ email: '', subject: '', body: '' });
  const [phoneState, setPhoneState] = useState<PhoneState>({ number: '' });
  const [smsState, setSmsState] = useState<SmsState>({ number: '', message: '' });
  const [whatsappState, setWhatsappState] = useState<WhatsappState>({ number: '', message: '' });
  const [vCardState, setVCardState] = useState<VCardState>({ firstName: '', lastName: '', phone: '', email: '', org: '', title: '', website: '' });

  // Style States
  const [options, setOptions] = useState<QRCodeSettings>(initialOptions);
  // Main Tabs
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'logo' | 'download'>('content');
  // Design Sub-tabs
  const [designTab, setDesignTab] = useState<'dots' | 'corners' | 'background'>('dots');

  // Initialize
  useEffect(() => {
    setQrCode(new QRCodeStyling(initialOptions));
  }, []);

  // Update Data Logic
  useEffect(() => {
    let newVal = '';
    switch (mode) {
      case 'url': /* handled in input */ break;
      case 'text': /* input */ break;
      case 'wifi':
        newVal = `WIFI:S:${wifiState.ssid};T:${wifiState.encryption};P:${wifiState.password};H:${wifiState.hidden};;`;
        break;
      case 'email':
        newVal = `mailto:${emailState.email}?subject=${encodeURIComponent(emailState.subject)}&body=${encodeURIComponent(emailState.body)}`;
        break;
      case 'phone':
        newVal = `tel:${phoneState.number}`;
        break;
      case 'sms':
        newVal = `smsto:${smsState.number}:${smsState.message}`;
        break;
      case 'whatsapp':
        newVal = `https://wa.me/${whatsappState.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappState.message)}`;
        break;
      case 'vcard':
        newVal = `BEGIN:VCARD\nVERSION:3.0\nN:${vCardState.lastName};${vCardState.firstName}\nFN:${vCardState.firstName} ${vCardState.lastName}\nORG:${vCardState.org}\nTITLE:${vCardState.title}\nTEL:${vCardState.phone}\nEMAIL:${vCardState.email}\nURL:${vCardState.website}\nEND:VCARD`;
        break;
    }
    if (newVal && newVal !== options.data) {
      setOptions(prev => ({ ...prev, data: newVal }));
    }
  }, [mode, wifiState, emailState, phoneState, smsState, whatsappState, vCardState]);

  // Append QR to DOM
  useEffect(() => {
    if (ref.current && qrCode) {
      ref.current.innerHTML = '';
      qrCode.append(ref.current);
    }
  }, [qrCode, ref]);

  // Update Options in Library
  useEffect(() => {
    if (!qrCode) return;
    qrCode.update(options as Partial<Options>);
  }, [qrCode, options]);

  const handleDownload = () => {
    if (!qrCode) return;
    qrCode.update({
      width: options.downloadOptions.resolution,
      height: options.downloadOptions.resolution
    });
    qrCode.download({
      extension: options.downloadOptions.extension,
      name: options.downloadOptions.name
    }).then(() => {
      // Reset preview size
      qrCode.update({
        width: options.width,
        height: options.height
      });
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOptions(prev => ({ ...prev, image: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for deep updates
  const updateOption = (section: keyof QRCodeSettings, key: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
  };

  // Logo Processing Helper
  const processLogo = (dataUrl: string, shape: string, autoTrim: boolean) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      if (autoTrim) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Dynamic background detection from top-left pixel
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];
        const bgA = data[3];

        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        let found = false;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

            // Difference threshold
            const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) + Math.abs(a - bgA);

            // Considered "Content" if:
            // 1. Pixel is visible (alpha > 20)
            // 2. AND (Background was transparent OR pixel differs from background color)
            const isVisible = a > 20;
            const isBgTransparent = bgA < 20;
            const isDifferent = diff > 40; // Tolerance level

            if (isVisible && (isBgTransparent || isDifferent)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              found = true;
            }
          }
        }

        if (found) {
          const padding = 2;
          sx = Math.max(0, minX - padding);
          sy = Math.max(0, minY - padding);
          sWidth = Math.min(canvas.width, maxX - minX + (padding * 2));
          sHeight = Math.min(canvas.height, maxY - minY + (padding * 2));
        }
      }

      // 2. Create final canvas
      const finalCanvas = document.createElement('canvas');
      const finalSize = Math.max(sWidth, sHeight);
      finalCanvas.width = finalSize;
      finalCanvas.height = finalSize;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return;

      // Circular Mask logic
      if (shape === 'circle') {
        finalCtx.beginPath();
        finalCtx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, Math.PI * 2);
        finalCtx.closePath();
        finalCtx.clip();
      }

      // Draw centered
      const drawX = (finalSize - sWidth) / 2;
      const drawY = (finalSize - sHeight) / 2;
      finalCtx.drawImage(canvas, sx, sy, sWidth, sHeight, drawX, drawY, sWidth, sHeight);

      setOptions(prev => ({
        ...prev,
        image: finalCanvas.toDataURL(),
        imageOptions: {
          ...prev.imageOptions,
          hideBackgroundDots: true,
          margin: 10,
          imageSize: 0.4
        },
        qrOptions: {
          ...prev.qrOptions,
          errorCorrectionLevel: 'H'
        }
      }));
      (window as any).originalLogo = dataUrl;
    };
  };

  const menuItems = [
    { id: 'url', icon: LinkIcon, label: 'Link' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'wifi', icon: Wifi, label: 'WiFi' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
    { id: 'phone', icon: Phone, label: 'Call' },
    { id: 'vcard', icon: UserSquare2, label: 'Contact' },
  ];

  return (
    <div className="w-full h-full max-w-[1600px] flex flex-col md:flex-row gap-6 items-stretch pb-10 md:pb-0">

      {/* LEFT PANEL: Controls */}
      <div className="flex-1 w-full md:w-auto bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-xl shadow-sky-900/5 flex flex-col overflow-hidden h-[600px] md:h-auto">
        {/* Panel Header Tabs */}
        <div className="flex-none px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/40">
          <div className="flex gap-1 bg-slate-100/80 p-1.5 rounded-2xl overflow-x-auto">
            {[
              { id: 'content', label: 'CONTENT', icon: Type },
              { id: 'design', label: 'DESIGN', icon: Palette },
              { id: 'logo', label: 'LOGO', icon: ImageIcon },
              { id: 'download', label: 'EXPORT', icon: Download },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 uppercase",
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <tab.icon size={14} className={activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]"} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-4 gap-2">
                {menuItems.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id as QRMode);
                      if (m.id === 'url') setOptions(s => ({ ...s, data: 'https://' }));
                      if (m.id === 'text') setOptions(s => ({ ...s, data: '' }));
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all duration-200",
                      mode === m.id
                        ? "bg-sky-50 text-sky-600 ring-2 ring-sky-500 font-bold"
                        : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 font-medium"
                    )}
                  >
                    <m.icon size={18} />
                    <span className="text-[10px] uppercase tracking-wide">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <InputSection
                  mode={mode} options={options} setOptions={setOptions}
                  wifiState={wifiState} setWifiState={setWifiState}
                  emailState={emailState} setEmailState={setEmailState}
                  phoneState={phoneState} setPhoneState={setPhoneState}
                  smsState={smsState} setSmsState={setSmsState}
                  whatsappState={whatsappState} setWhatsappState={setWhatsappState}
                  vCardState={vCardState} setVCardState={setVCardState}
                />
              </div>
            </div>
          )}

          {/* DESIGN TAB */}
          {activeTab === 'design' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Sub Menu */}
              <div className="flex gap-2 border-b border-slate-100 pb-2">
                {['dots', 'corners', 'background'].map(sub => (
                  <button key={sub} onClick={() => setDesignTab(sub as any)}
                    className={cn("px-3 py-1 text-xs font-bold uppercase rounded-lg transition-colors", designTab === sub ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-100")}>
                    {sub}
                  </button>
                ))}
              </div>

              {designTab === 'dots' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'].map(t => (
                        <button key={t} onClick={() => updateOption('dotsOptions', 'type', t)}
                          className={cn("py-2 border rounded-lg text-[10px] font-bold uppercase", options.dotsOptions.type === t ? "border-sky-500 bg-sky-50 text-sky-600" : "border-slate-200 bg-white text-slate-500")}>
                          {t.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={options.dotsOptions.color} onChange={(e) => updateOption('dotsOptions', 'color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" />
                      <span className="text-xs font-mono text-slate-500 uppercase">{options.dotsOptions.color}</span>
                    </div>
                  </div>
                </div>
              )}

              {designTab === 'corners' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Square Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['square', 'dot', 'extra-rounded'].map(t => (
                        <button key={t} onClick={() => updateOption('cornersSquareOptions', 'type', t)}
                          className={cn("py-2 border rounded-lg text-[10px] font-bold uppercase", options.cornersSquareOptions.type === t ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-white text-slate-500")}>
                          {t.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Square Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={options.cornersSquareOptions.color} onChange={(e) => updateOption('cornersSquareOptions', 'color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" />
                      <span className="text-xs font-mono text-slate-500 uppercase">{options.cornersSquareOptions.color}</span>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 my-4" />
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dot Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['square', 'dot'].map(t => (
                        <button key={t} onClick={() => updateOption('cornersDotOptions', 'type', t)}
                          className={cn("py-2 border rounded-lg text-[10px] font-bold uppercase", options.cornersDotOptions.type === t ? "border-purple-500 bg-purple-50 text-purple-600" : "border-slate-200 bg-white text-slate-500")}>
                          {t.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dot Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={options.cornersDotOptions.color} onChange={(e) => updateOption('cornersDotOptions', 'color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" />
                      <span className="text-xs font-mono text-slate-500 uppercase">{options.cornersDotOptions.color}</span>
                    </div>
                  </div>
                </div>
              )}

              {designTab === 'background' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={options.backgroundOptions.color} onChange={(e) => updateOption('backgroundOptions', 'color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" />
                      <span className="text-xs font-mono text-slate-500 uppercase">{options.backgroundOptions.color}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOGO TAB */}
          {activeTab === 'logo' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Logo</label>
                <input type="file" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      // Set basic options first
                      setOptions(prev => ({
                        ...prev,
                        image: result, // Default to raw image first
                        imageOptions: {
                          ...prev.imageOptions,
                          hideBackgroundDots: true,
                          margin: 10,
                          imageSize: 0.4
                        },
                        qrOptions: {
                          ...prev.qrOptions,
                          errorCorrectionLevel: 'H'
                        }
                      }));
                      // Store original for re-processing
                      (window as any).originalLogo = result;
                      (window as any).logoShape = 'square'; // Reset shape
                    };
                    reader.readAsDataURL(file);
                  }
                }} accept="image/*" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo Shape</label>
                <div className="flex gap-2">
                  {['square', 'circle'].map(shape => (
                    <button key={shape} onClick={() => {
                      const original = (window as any).originalLogo || options.image;
                      if (!original) return;

                      (window as any).logoShape = shape;

                      if (shape === 'square') {
                        setOptions(p => ({ ...p, image: original }));
                      } else {
                        // Process to circle
                        const img = new Image();
                        img.src = original;
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const size = Math.min(img.width, img.height);
                          canvas.width = size;
                          canvas.height = size;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.beginPath();
                            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                            ctx.closePath();
                            ctx.clip();
                            ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
                            setOptions(p => ({ ...p, image: canvas.toDataURL() }));
                          }
                        };
                      }
                    }}
                      className={cn("flex-1 py-2 border rounded-lg text-[10px] font-bold uppercase transition-all",
                        ((window as any).logoShape || 'square') === shape
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                      )}>
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or URL</label>
                <input type="text" placeholder="https://..." value={options.image || ''} onChange={(e) => setOptions(prev => ({ ...prev, image: e.target.value }))} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs" />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo Size ({options.imageOptions.imageSize}x)</label>
                  <input type="range" min="0.1" max="1" step="0.1" value={options.imageOptions.imageSize} onChange={(e) => updateOption('imageOptions', 'imageSize', parseFloat(e.target.value))} className="w-1/2 accent-sky-500" />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Margin ({options.imageOptions.margin}px)</label>
                  <input type="range" min="0" max="50" step="1" value={options.imageOptions.margin} onChange={(e) => updateOption('imageOptions', 'margin', parseInt(e.target.value))} className="w-1/2 accent-sky-500" />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hide Dots Behind Logo</label>
                  <input type="checkbox" checked={options.imageOptions.hideBackgroundDots} onChange={(e) => updateOption('imageOptions', 'hideBackgroundDots', e.target.checked)} className="w-5 h-5 accent-sky-500 rounded cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* EXPORT TAB */}
          {activeTab === 'download' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution ({options.downloadOptions.resolution}px)</label>
                <input type="range" min="300" max="4000" step="100" value={options.downloadOptions.resolution} onChange={(e) => setOptions(p => ({ ...p, downloadOptions: { ...p.downloadOptions, resolution: parseInt(e.target.value) } }))} className="w-full accent-slate-900" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quiet Zone (Margin)</label>
                <input type="range" min="0" max="50" step="1" value={options.margin} onChange={(e) => setOptions(p => ({ ...p, margin: parseInt(e.target.value) }))} className="w-full accent-slate-900" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Error Correction</label>
                <div className="flex gap-2">
                  {['L', 'M', 'Q', 'H'].map(l => (
                    <button key={l} onClick={() => updateOption('qrOptions', 'errorCorrectionLevel', l)}
                      className={cn("flex-1 py-2 border rounded-lg text-xs font-bold", options.qrOptions.errorCorrectionLevel === l ? "bg-slate-900 text-white" : "bg-white text-slate-500")}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format</label>
                <div className="flex gap-2">
                  {['png', 'svg', 'jpeg', 'webp'].map(f => (
                    <button key={f} onClick={() => setOptions(p => ({ ...p, downloadOptions: { ...p.downloadOptions, extension: f as any } }))}
                      className={cn("flex-1 py-2 border rounded-lg text-xs font-bold uppercase", options.downloadOptions.extension === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500")}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filename</label>
                <input type="text" value={options.downloadOptions.name} onChange={(e) => setOptions(p => ({ ...p, downloadOptions: { ...p.downloadOptions, name: e.target.value } }))} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL: Preview */}
      <div className="w-full md:w-[45%] flex flex-col gap-4 sticky md:relative bottom-4 md:bottom-auto z-30 md:z-auto">
        <div className="flex-1 bg-white/80 md:bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[2rem] shadow-2xl shadow-sky-900/10 md:shadow-emerald-900/5 flex flex-col items-center justify-center relative p-6 md:p-8 order-2 md:order-1 min-h-[400px]">
          <div className="mb-6 md:mb-8 text-center">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Preview</h2>
            <p className="text-slate-500 text-[10px] md:text-xs font-medium uppercase tracking-wider mt-1">Updates in real-time</p>
          </div>

          <div className="relative group w-full max-w-[300px] aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-emerald-400/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div
              ref={ref}
              className="relative bg-white p-4 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 ring-1 ring-slate-100 overflow-hidden w-full h-full flex items-center justify-center"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="h-16 md:h-20 order-1 md:order-2">
          <button onClick={handleDownload} className="w-full h-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg md:text-xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <Download size={24} />
            <span className="uppercase">DOWNLOAD {options.downloadOptions.extension}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Inputs (Compact Version)
// ... Same InputSection logic as before, just slight prop updates ...
function InputSection({
  mode, options, setOptions,
  wifiState, setWifiState,
  emailState, setEmailState,
  phoneState, setPhoneState,
  smsState, setSmsState,
  whatsappState, setWhatsappState,
  vCardState, setVCardState
}: any) {

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition-all outline-none font-medium shadow-sm active:border-sky-500";
  const labelClasses = "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block";

  if (mode === 'url') {
    return (<div><label className={labelClasses}>Website URL</label><input type="url" className={inputClasses} placeholder="https://" value={options.data} onChange={(e) => setOptions((s: any) => ({ ...s, data: e.target.value }))} /></div>);
  }
  if (mode === 'text') {
    return (<div><label className={labelClasses}>Text Content</label><textarea className={cn(inputClasses, "min-h-[120px] resize-none")} placeholder="Type something..." value={options.data} onChange={(e) => setOptions((s: any) => ({ ...s, data: e.target.value }))} /></div>);
  }
  // ... Rest of inputs (wifi, email, etc) remain practically identical to previous step, just mapping updates to options.value or local state 
  // For brevity in this tool call, assume standard inputs similar to previous step are here.
  if (mode === 'wifi') {
    return (
      <div className="space-y-3">
        <div><label className={labelClasses}>SSID</label><input type="text" className={inputClasses} placeholder="Network Name" value={wifiState.ssid} onChange={(e) => setWifiState({ ...wifiState, ssid: e.target.value })} /></div>
        <div><label className={labelClasses}>Encryption</label><select className={cn(inputClasses, "py-2.5")} value={wifiState.encryption} onChange={(e) => setWifiState({ ...wifiState, encryption: e.target.value })}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select></div>
        {wifiState.encryption !== 'nopass' && (<div><label className={labelClasses}>Password</label><input type="text" className={inputClasses} placeholder="Key" value={wifiState.password} onChange={(e) => setWifiState({ ...wifiState, password: e.target.value })} /></div>)}
      </div>
    )
  }
  if (mode === 'email') {
    return (
      <div className="space-y-3">
        <div><label className={labelClasses}>To</label><input type="email" className={inputClasses} placeholder="friend@example.com" value={emailState.email} onChange={(e) => setEmailState({ ...emailState, email: e.target.value })} /></div>
        <div><label className={labelClasses}>Subject</label><input type="text" className={inputClasses} placeholder="Hello" value={emailState.subject} onChange={(e) => setEmailState({ ...emailState, subject: e.target.value })} /></div>
        <div><label className={labelClasses}>Body</label><textarea className={cn(inputClasses, "h-20 resize-none")} placeholder="..." value={emailState.body} onChange={(e) => setEmailState({ ...emailState, body: e.target.value })} /></div>
      </div>
    )
  }
  if (mode === 'phone') {
    return (<div><label className={labelClasses}>Phone Number</label><input type="tel" className={inputClasses} placeholder="+8801..." value={phoneState.number} onChange={(e) => setPhoneState({ ...phoneState, number: e.target.value })} /></div>);
  }
  if (mode === 'whatsapp') {
    return (
      <div className="space-y-3">
        <div><label className={labelClasses}>WhatsApp Number</label><input type="tel" className={inputClasses} placeholder="+8801..." value={whatsappState.number} onChange={(e) => setWhatsappState({ ...whatsappState, number: e.target.value })} /></div>
        <div><label className={labelClasses}>Message</label><textarea className={cn(inputClasses, "h-20 resize-none")} placeholder="Hello..." value={whatsappState.message} onChange={(e) => setWhatsappState({ ...whatsappState, message: e.target.value })} /></div>
      </div>
    );
  }
  if (mode === 'vcard') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 text-center text-[10px] text-emerald-500 font-bold bg-emerald-50 py-1 rounded">VCARD CONTACT</div>
        <div><label className={labelClasses}>First Name</label><input type="text" className={inputClasses} value={vCardState.firstName} onChange={(e) => setVCardState({ ...vCardState, firstName: e.target.value })} /></div>
        <div><label className={labelClasses}>Last Name</label><input type="text" className={inputClasses} value={vCardState.lastName} onChange={(e) => setVCardState({ ...vCardState, lastName: e.target.value })} /></div>
        <div className="col-span-2"><label className={labelClasses}>Phone</label><input type="tel" className={inputClasses} value={vCardState.phone} onChange={(e) => setVCardState({ ...vCardState, phone: e.target.value })} /></div>
        <div className="col-span-2"><label className={labelClasses}>Email</label><input type="email" className={inputClasses} value={vCardState.email} onChange={(e) => setVCardState({ ...vCardState, email: e.target.value })} /></div>
      </div>
    )
  }
  return null;
}

