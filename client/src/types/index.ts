export interface User {
  id: number;
  username: string;
  nickname: string;
}

export interface City {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export interface Attraction {
  id: number;
  city_id: number;
  name: string;
  description: string;
  image_url: string;
  address: string;
}

export interface GuideAttraction {
  id: number;
  attraction_id: number;
  sort_order: number;
  photo_url: string | null;
  comment: string | null;
  attraction_name: string;
  attraction_description: string;
  attraction_address: string;
}

export interface Guide {
  id: number;
  user_id: number;
  title: string;
  city_id: number;
  city_name: string;
  visibility: 'public' | 'private';
  username: string;
  nickname: string;
  created_at: string;
  updated_at: string;
  attractions?: GuideAttraction[];
}
