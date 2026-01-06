import { Link } from "react-router-dom";
import vantageIcon from "@/assets/vantage-icon.png";

interface LogoProps {
  className?: string;
  linkToHome?: boolean;
}

const Logo = ({ className = "", linkToHome = true }: LogoProps) => {
  const logoContent = (
    <div className={`flex items-center gap-2 font-display font-bold text-xl ${className}`}>
      <img src={vantageIcon} alt="Vantage AI Labs" className="h-8 w-8" />
      <span>
        <span className="text-gradient-primary">Vantage</span> AI Labs
      </span>
    </div>
  );

  if (linkToHome) {
    return <Link to="/">{logoContent}</Link>;
  }

  return logoContent;
};

export default Logo;
