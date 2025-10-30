export type ID = string;

export type UserRole = "brand" | "influencer";

export interface User {
  id: ID;
  role: UserRole;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  address?: string;
  website?: string;
  bio?: string;
  sector?: string;
  avatar_url?: string;
  default_currency?: string;
  rating_avg?: number;
  instagram_url?: string;
  tiktok_url?: string;
  facebook_url?: string;
  snapchat_url?: string;
  primary_platform?: "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Snapchat";
  followers_count?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Campaign {
  id: ID;
  owner_user_id: ID;
  name: string;
  brand_name: string;
  description: string;
  revenue_amount: number;
  revenue_currency: string;
  start_date?: string;
  status: "active" | "closed";
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type CampaignPlatform = {
  campaign_id: ID;
  platform: "Instagram" | "TikTok" | "Facebook" | "Snapchat";
};

export interface Collaborator {
  id: ID;
  campaign_id: ID;
  first_name: string;
  last_name: string;
  phone?: string;
  agreed_amount: number;
  currency: string;
  ad_status: "Active" | "Terminée";
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Conversation {
  id: ID;
  user_a_id: ID;
  user_b_id: ID;
  last_message_at?: string;
  unread_a?: number;
  unread_b?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Message {
  id: ID;
  conversation_id: ID;
  sender_id: ID;
  content: string;
  attachment_id?: ID | null;
  created_at: string;
  read_at?: string | null;
  deleted_at?: string | null;
}

export interface Attachment {
  id: ID;
  file_name: string;
  mime_type: string;
  size: number;
  storage_url: string;
  created_at: string;
}

export interface Rating {
  id: ID;
  campaign_id: ID;
  rater_user_id: ID;
  ratee_user_id: ID;
  score: number;
  comment?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: ID;
  user_id: ID;
  action: string;
  entity: string;
  entity_id: ID;
  created_at: string;
}

export interface Database {
  users: User[];
  campaigns: Campaign[];
  campaign_platforms: CampaignPlatform[];
  collaborators: Collaborator[];
  conversations: Conversation[];
  messages: Message[];
  attachments: Attachment[];
  ratings: Rating[];
  audit_logs: AuditLog[];
}
