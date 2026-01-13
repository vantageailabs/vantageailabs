import founderPhoto from "@/assets/founder-photo.jpg";
import vantageIcon from "@/assets/vantage-icon.png";

const BusinessCard = () => {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-8">
      {/* Business Card */}
      <div className="w-[700px] h-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Photo & Branding */}
        <div className="w-[40%] relative bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center p-6 border-r border-gray-100">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl mb-3">
            <img 
              src={founderPhoto} 
              alt="Zach" 
              className="w-full h-full object-cover object-top"
            />
          </div>
          <img 
            src={vantageIcon} 
            alt="Vantage AI Solutions" 
            className="w-28 mb-1"
          />
          <p className="text-primary/70 text-[10px] tracking-wider uppercase font-medium">AI Automation Agency</p>
        </div>

        {/* Right Side - Info & QR */}
        <div className="w-[60%] flex flex-col justify-between p-5">
          {/* Name & Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Zach Goodson</h1>
            <p className="text-primary text-sm font-semibold mb-3">Founder & AI Consultant</p>
            
            {/* Tagline */}
            <p className="text-gray-700 text-sm font-medium mb-3">
              Stop Leaving <span className="italic text-green-600 font-semibold">Money</span> on the Table Every Year
            </p>

            {/* Bullet Points */}
            <ul className="space-y-1 text-gray-600 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Custom AI Solutions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Process Automation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Software Built for You
              </li>
            </ul>
          </div>

          {/* Contact Info & QR */}
          <div className="flex items-end justify-between">
            <div className="space-y-1 text-gray-600 text-xs">
              <p className="flex items-center gap-2">
                <span className="text-primary">✉</span>
                zach@vantageaisolutions.com
              </p>
              <p className="flex items-center gap-2">
                <span className="text-primary">🌐</span>
                vantageaisolutions.com
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="w-20 h-20 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-[10px] text-center px-1">QR Code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
