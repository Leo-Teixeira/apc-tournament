export type User = {
  id: number;
  user_login: string;
  user_pass: string;
  user_nicename: string;
  user_email: string;
  user_url: string;
  user_registered: string; // ISO string format: 'YYYY-MM-DD HH:mm:ss'
  user_activation_key: string;
  user_status: number;
  display_name: string;
  pseudo_winamax: string;
  photo_url: string | null;
};
