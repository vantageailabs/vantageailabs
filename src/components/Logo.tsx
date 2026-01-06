import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  linkToHome?: boolean;
}

const Logo = ({ className = "", linkToHome = true }: LogoProps) => {
  const logoContent = (
    <div className={`font-display font-bold text-xl ${className}`}>
      <span className="text-gradient-primary">Vantage</span> AI Labs
    </div>
  );

  if (linkToHome) {
    return <Link to="/">{logoContent}</Link>;
  }

  return logoContent;
};

export default Logo;
