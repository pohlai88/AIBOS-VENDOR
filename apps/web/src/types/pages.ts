import { ReactNode } from "react";

export interface PageProps {
  children?: ReactNode;
}

export interface PublicPageProps extends PageProps {
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface ProtectedPageProps extends PageProps {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
