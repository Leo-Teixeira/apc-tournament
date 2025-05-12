import { QuarterRanking } from "./quarter_ranking.types";
import { Registration } from "./registration.types";

export type WPUser = {
  ID: number;
  user_login: string;
  user_pass: string;
  user_nicename: string;
  user_email: string;
  user_url: string;
  user_registered: string;
  user_activation_key: string;
  user_status: number;
  display_name: string;
  pseudo_winamax: string;
  photo_url?: string;
  quarter_ranking?: QuarterRanking[];
  registration?: Registration[];
};