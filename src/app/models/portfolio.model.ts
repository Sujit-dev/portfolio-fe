export interface WorkExperience {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate?: string; // undefined means current
  responsibilities: string[];
  technologies: string[];
  icon?: string;
  logoUrl?: string; // Company logo URL
}

export interface PortfolioItem {
  id: number;
  title: string;
  company: string;
  role: string;
  category: string;
  imageUrl: string;
  description?: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
  responsibilities?: string[];
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  year: string;
  percentage?: string;
  icon?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  profileImage?: string;
  workExperience: WorkExperience[];
  education: Education[];
  portfolio: PortfolioItem[];
  socialLinks: SocialLink[];
  contact: {
    email: string;
    phone: string;
    address?: string;
  };
}

