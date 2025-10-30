export interface Influencer {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  mainPlatform: "Instagram" | "TikTok" | "YouTube" | "Snapchat" | "Facebook";
  followers: number;
  engagementRate: number;
  niche: string;
  location: string;
  verified: boolean;
  bio: string;
  priceRange: string;
  priceIndex: "accessible" | "standard" | "premium";
  category: "Fashion & Lifestyle" | "Technology & Gadgets" | "Fitness & Wellness" | "Food & Culinary" | "Beauty & Makeup" | "Travel & Adventure";
  collaborationScore: number;
}

export interface Brand {
  id: string;
  companyName: string;
  logo: string;
  industry: string;
  description: string;
  verified: boolean;
  activeCampaigns: number;
  website?: string;
  phone?: string;
  address?: string;
  rating?: number;
  userId?: string;
}

export interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  amount: number;
  currency: string;
}

export interface Campaign {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  userId?: string;
  status: "proposed" | "active" | "completed" | "draft";
  budget: number;
  currency?: string;
  startDate: string;
  endDate?: string;
  description: string;
  platform: string;
  platforms?: string[];
  engagement?: number;
  impressions?: number;
  payments?: number[];
  engagedInfluencers?: string[];
  collaborators?: Collaborator[];
  objectives?: string;
  requirements?: string;
  hashtags?: string;
}

export const mockInfluencers: Influencer[] = [
  {
    id: "1",
    username: "@sarahstyle",
    fullName: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    mainPlatform: "Instagram",
    followers: 245000,
    engagementRate: 4.8,
    niche: "Fashion & Lifestyle",
    location: "Paris, France",
    verified: true,
    bio: "Fashion influencer sharing daily style inspiration and sustainable fashion tips.",
    priceRange: "$500 - $2,000",
    priceIndex: "standard",
    category: "Fashion & Lifestyle",
    collaborationScore: 4.6,
  },
  {
    id: "2",
    username: "@techmark",
    fullName: "Mark Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    mainPlatform: "YouTube",
    followers: 892000,
    engagementRate: 6.2,
    niche: "Technology & Gadgets",
    location: "San Francisco, USA",
    verified: true,
    bio: "Tech reviewer and gadget enthusiast. Honest reviews of the latest tech.",
    priceRange: "$2,000 - $5,000",
    priceIndex: "premium",
    category: "Technology & Gadgets",
    collaborationScore: 4.9,
  },
  {
    id: "3",
    username: "@fitnessfiona",
    fullName: "Fiona Martinez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    mainPlatform: "TikTok",
    followers: 567000,
    engagementRate: 7.5,
    niche: "Fitness & Wellness",
    location: "Dubai, UAE",
    verified: true,
    bio: "Certified personal trainer. Daily workout routines and nutrition tips.",
    priceRange: "$1,000 - $3,000",
    priceIndex: "standard",
    category: "Fitness & Wellness",
    collaborationScore: 4.8,
  },
  {
    id: "4",
    username: "@foodie_alex",
    fullName: "Alex Thompson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    mainPlatform: "Instagram",
    followers: 178000,
    engagementRate: 5.3,
    niche: "Food & Culinary",
    location: "London, UK",
    verified: false,
    bio: "Food enthusiast exploring the best restaurants and recipes around the world.",
    priceRange: "$300 - $1,500",
    priceIndex: "accessible",
    category: "Food & Culinary",
    collaborationScore: 4.2,
  },
  {
    id: "5",
    username: "@beautybylayla",
    fullName: "Layla Ahmed",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    mainPlatform: "Instagram",
    followers: 423000,
    engagementRate: 6.8,
    niche: "Beauty & Makeup",
    location: "Cairo, Egypt",
    verified: true,
    bio: "Makeup artist and beauty blogger. Tutorials, reviews, and beauty hacks.",
    priceRange: "$800 - $2,500",
    priceIndex: "standard",
    category: "Beauty & Makeup",
    collaborationScore: 4.7,
  },
  {
    id: "6",
    username: "@travel_emma",
    fullName: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    mainPlatform: "YouTube",
    followers: 312000,
    engagementRate: 4.9,
    niche: "Travel & Adventure",
    location: "Sydney, Australia",
    verified: true,
    bio: "Travel vlogger exploring hidden gems and sharing travel tips worldwide.",
    priceRange: "$600 - $2,000",
    priceIndex: "standard",
    category: "Travel & Adventure",
    collaborationScore: 4.5,
  },
];

export const mockBrands: Brand[] = [
  {
    id: "1",
    companyName: "StyleHub",
    logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200",
    industry: "Fashion",
    description: "Modern fashion brand for the contemporary lifestyle. We create timeless pieces that blend comfort with style.",
    verified: true,
    activeCampaigns: 5,
    website: "https://www.stylehub.com",
    phone: "+33 1 42 86 82 00",
    address: "123 Avenue des Champs-Élysées, 75008 Paris, France",
    rating: 4.7,
    userId: "brand_stylehub_001",
  },
  {
    id: "2",
    companyName: "TechNova",
    logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200",
    industry: "Technology",
    description: "Innovative tech solutions for everyday life. Leading the future of smart devices and IoT technology.",
    verified: true,
    activeCampaigns: 8,
    website: "https://www.technova.io",
    phone: "+1 (415) 555-0123",
    address: "456 Silicon Valley Blvd, San Francisco, CA 94105, USA",
    rating: 4.9,
    userId: "brand_technova_002",
  },
  {
    id: "3",
    companyName: "FitLife Pro",
    logo: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=200",
    industry: "Fitness",
    description: "Premium fitness equipment and nutrition products. Empowering your fitness journey with quality gear.",
    verified: true,
    activeCampaigns: 3,
    website: "https://www.fitlifepro.com",
    phone: "+971 4 123 4567",
    address: "789 Sheikh Zayed Road, Dubai Marina, UAE",
    rating: 4.5,
    userId: "brand_fitlife_003",
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Collection Launch",
    brandId: "1",
    brandName: "StyleHub",
    status: "active",
    budget: 5000,
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    description: "Promote our new summer collection with authentic lifestyle content.",
    platform: "Instagram",
    engagement: 45000,
    impressions: 892000,
    payments: [1500, 1200, 800],
    engagedInfluencers: ["1", "5"],
  },
  {
    id: "2",
    name: "Smart Watch Review Campaign",
    brandId: "2",
    brandName: "TechNova",
    status: "proposed",
    budget: 3500,
    startDate: "2025-02-01",
    description: "Honest review of our latest smartwatch featuring health tracking.",
    platform: "YouTube",
    payments: [],
    engagedInfluencers: [],
  },
  {
    id: "3",
    name: "30-Day Fitness Challenge",
    brandId: "3",
    brandName: "FitLife Pro",
    status: "completed",
    budget: 4200,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    description: "Create engaging workout content using our equipment.",
    platform: "TikTok",
    engagement: 128000,
    impressions: 1250000,
    payments: [2000, 1500, 700],
    engagedInfluencers: ["3"],
  },
];
