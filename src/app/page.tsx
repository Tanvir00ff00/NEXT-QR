import QRCodeGenerator from "@/components/QRCodeGenerator";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#F0F4F8] text-slate-900 selection:bg-sky-200 selection:text-sky-900 flex flex-col relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-sky-50 via-white to-emerald-50 z-0 pointer-events-none fixed"></div>

      {/* Subtle Animated Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse-slow animation-delay-2000"></div>

      {/* App Header */}
      <header className="relative z-20 flex-none h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/50 bg-white/30 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center p-1">
            <img src="/logo.svg" alt="NextQR" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Next<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-600">QR</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-xs shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            v2.1
          </span>
          <span className="opacity-40 hidden sm:inline">|</span>
          <span className="text-xs">Folyntra Tech</span>
        </div>
      </header>

      {/* Main Content Area - Scrollable on mobile, Fixed on desktop if possible */}
      <div className="flex-1 relative z-10 p-4 md:p-6 lg:p-8 flex items-start justify-center">
        <QRCodeGenerator />
      </div>
    </main>
  );
}
