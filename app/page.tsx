import Image from "next/image";
import ResumeConverterForm from '@/components/ResumeConverterForm';

export default function HomePage() {
  return (
    <main className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8 bg-[#0f1115]">
      
      {/* --- BRAND HEADER --- */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        {/* Logo Section - Ensure your image is in the /public folder */}
        <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-omega-gold/30 p-1 bg-omega-900 shadow-[0_0_30px_rgba(197,160,89,0.15)]">
              <Image 
                src="/logo-objective-omega.png" 
                alt="Objective Omega Logo" 
                fill
                className="object-cover rounded-full"
              />
            </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white uppercase mb-4">
          Objective <span className="text-omega-gold">Omega</span>
        </h1>
        <div className="h-1 w-24 bg-omega-gold mx-auto rounded-full mb-6"></div>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          <span className="text-omega-gold font-semibold">Tactical Translation.</span> Convert your service record into a boardroom-ready resume using precision AI.
        </p>
      </div>

      {/* --- MAIN APP CONTAINER --- */}
      <div className="max-w-5xl mx-auto">
        <ResumeConverterForm />
      </div>

      {/* --- FOOTER --- */}
      <div className="max-w-3xl mx-auto mt-12 text-center border-t border-gray-800 pt-8">
        <p className="text-xs text-gray-500">
          ⚠️ <strong>OPSEC WARNING:</strong> Ensure all classified data is redacted prior to upload. 
          This tool is an automated writing assistant, not legal counsel.
        </p>
      </div>
    </main>
  );
}