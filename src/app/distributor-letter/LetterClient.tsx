'use client'

import { 
  FileCheck, 
  Download, 
  Calendar, 
  ShieldCheck,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react'

export default function LetterClient({ dict }: { dict: any }) {
  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="animate-slide-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark leading-tight">{dict.letter.title}</h1>
        <p className="text-dark-500 mt-1 md:mt-2 font-medium text-sm md:text-base">{dict.letter.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Status Card */}
        <div className="space-y-6">
          <section className="card !p-6 md:!p-10 border-success/20 bg-success-bg/20">
            <div className="flex items-center justify-between mb-6 md:mb-10">
              <div className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-success text-white shadow-lg shadow-success/20">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <span className="badge-active text-[10px] md:text-xs">
                {dict.letter.activeVerified}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black mb-2 text-dark tracking-tight">{dict.letter.statusTitle}</h2>
            <p className="text-dark-500 mb-6 md:mb-10 font-medium leading-relaxed text-sm md:text-base">{dict.letter.statusDescription}</p>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10">
              <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-white border border-border shadow-sm">
                <p className="text-[9px] md:text-[10px] text-dark-300 font-black uppercase tracking-widest mb-1.5 md:mb-2">{dict.letter.issuedOn}</p>
                <div className="flex items-center gap-2 font-bold text-dark text-sm md:text-base">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-brand-500" />
                  Jan 01, 2026
                </div>
              </div>
              <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-white border border-border shadow-sm">
                <p className="text-[9px] md:text-[10px] text-dark-300 font-black uppercase tracking-widest mb-1.5 md:mb-2">{dict.letter.expiresOn}</p>
                <div className="flex items-center gap-2 font-bold text-dark text-sm md:text-base">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-warning" />
                  Dec 31, 2026
                </div>
              </div>
            </div>

            <button className="btn-primary w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] !text-base md:!text-lg !font-black !gap-3 md:!gap-4">
              <Download className="w-5 h-5 md:w-6 md:h-6" />
              {dict.letter.downloadPdf}
            </button>
          </section>

          <section className="card !p-5 md:!p-8 flex items-start gap-4 md:gap-5 border-warning/10">
            <div className="p-2.5 md:p-3 rounded-xl bg-warning-bg text-warning flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-bold text-warning text-base md:text-lg mb-0.5 md:mb-1">{dict.letter.noticeTitle}</h3>
              <p className="text-xs md:text-sm text-dark-500 font-medium leading-relaxed">
                {dict.letter.noticeDescription}
              </p>
            </div>
          </section>
        </div>

        {/* Preview / Instructions */}
        <div className="card !p-6 md:!p-10 relative overflow-hidden flex flex-col items-center justify-center text-center bg-surface-2">
          <div className="absolute top-0 right-0 p-4 md:p-6">
             <ExternalLink className="w-6 h-6 md:w-8 md:h-8 text-dark-100" />
          </div>
          
          <div className="w-full aspect-[1/1.4] bg-white border border-border shadow-2xl rounded-xl md:rounded-2xl p-6 md:p-10 flex flex-col gap-4 md:gap-8 scale-95 md:scale-90 opacity-90 pointer-events-none group-hover:scale-100 transition-transform duration-700">
             <div className="flex justify-between items-start border-b border-border-2 pb-4 md:pb-8">
                <div className="w-24 md:w-40 h-6 md:h-10 bg-surface-2 rounded-lg animate-pulse" />
                <div className="text-right space-y-2 md:space-y-3">
                   <div className="w-20 md:w-32 h-2.5 md:h-3 bg-surface-2 rounded-full ml-auto" />
                   <div className="w-24 md:w-40 h-2.5 md:h-3 bg-surface-2 rounded-full ml-auto" />
                </div>
             </div>
             
             <div className="space-y-4 md:space-y-6 text-left">
                <div className="h-6 md:h-8 w-3/4 bg-surface-2 rounded-lg" />
                <div className="space-y-2 md:space-y-3">
                   <div className="h-2.5 md:h-3.5 w-full bg-border-2 rounded-full" />
                   <div className="h-2.5 md:h-3.5 w-full bg-border-2 rounded-full" />
                   <div className="h-2.5 md:h-3.5 w-5/6 bg-border-2 rounded-full" />
                </div>
             </div>

             <div className="mt-auto pt-8 md:pt-16 border-t border-border-2 flex flex-col items-center gap-4 md:gap-6">
                <div className="w-20 h-20 md:w-32 md:h-32 border-2 md:border-4 border-dashed border-border-2 rounded-full flex items-center justify-center">
                   <FileText className="w-8 h-8 md:w-14 md:h-14 text-dark-100" />
                </div>
                <div className="w-40 md:w-56 h-3 md:h-4 bg-surface-2 rounded-full" />
             </div>
          </div>

          <p className="mt-6 md:mt-10 text-[10px] md:text-sm text-dark-300 font-bold uppercase tracking-widest italic">{dict.letter.preview}</p>
        </div>
      </div>
    </div>
  )
}
