export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  token?: string;
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const storeUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
  if (user.token) {
    localStorage.setItem('token', user.token);
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
