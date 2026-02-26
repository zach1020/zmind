export type ClipType =
  | "article"
  | "video"
  | "image"
  | "bookmark"
  | "note"
  | "quote"
  | "music"
  | "tool"
  | "price"
  | "website";

export interface Clip {
  id: string;
  title: string;
  url: string | null;
  source: string | null;
  type: ClipType;
  content: string | null;
  excerpt: string | null;
  author: string | null;
  favicon_url: string | null;
  thumbnail_url: string | null;
  archive_path: string | null;
  price: string | null;
  favorited: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface ClipTag {
  clip_id: string;
  tag_id: string;
}

export interface ChatConversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  referenced_clip_ids: string[];
  created_at: string;
}
