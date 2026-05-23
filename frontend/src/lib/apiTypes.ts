export type SyncUserResponse = {
  success: boolean;
  message?: string;
  credentials_email_sent?: boolean;
  user?: {
    id: number;
    email: string;
    role?: string;
    clerk_id?: string;
    must_change_password?: boolean;
    [key: string]: unknown;
  };
};
