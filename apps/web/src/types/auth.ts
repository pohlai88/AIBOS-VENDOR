export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  organizationName: string;
  role: "vendor" | "company";
  tenantSlug?: string;
  tenantName?: string;
}

export interface AuthResponse {
  success: true;
  user: {
    id: string;
    email: string;
    role: string;
  };
  token?: string;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type AuthApiResponse = AuthResponse | AuthErrorResponse;

// Type guard
export function isAuthSuccess(
  response: AuthApiResponse
): response is AuthResponse {
  return response.success === true;
}

export function isAuthError(
  response: AuthApiResponse
): response is AuthErrorResponse {
  return response.success === false;
}
