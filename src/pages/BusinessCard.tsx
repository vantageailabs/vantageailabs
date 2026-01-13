import founderPhoto from "@/assets/founder-photo.jpg";
import vantageIcon from "@/assets/vantage-icon.png";

const BusinessCard = () => {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-8">
      {/* Business Card */}
      <div className="w-[700px] h-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Photo & Branding */}
        <div className="w-[45%] relative bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex flex-col items-center justify-center p-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-500/50 shadow-xl mb-4">
            <img 
              src={founderPhoto} 
              alt="Zach" 
              className="w-full h-full object-cover object-top"
            />
          </div>
          <img 
            src={vantageIcon} 
            alt="Vantage AI Solutions" 
            className="w-32 mb-2"
          />
          <p className="text-amber-400/80 text-xs tracking-wider uppercase">AI Automation Agency</p>
        </div>

        {/* Right Side - Info & QR */}
        <div className="w-[55%] flex flex-col justify-between p-6">
          {/* Name & Title */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Zach Goodson</h1>
            <p className="text-amber-400 text-lg font-medium">Founder & AI Consultant</p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-gray-300 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-amber-400">✉</span>
              zach@vantageaisolutions.com
            </p>
            <p className="flex items-center gap-2">
              <span className="text-amber-400">🌐</span>
              vantageaisolutions.com
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex items-end justify-end">
            <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center px-2">QR Code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
