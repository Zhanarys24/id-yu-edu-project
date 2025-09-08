export type LoginResponse = {
  id?: string | number;
  email?: string;
  name?: string;
  role?: string;
  position?: string;
  avatarUrl?: string;
  token?: string;
  [key: string]: any;
};

export const AuthApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Login failed');
    }
    const contentType = res.headers.get('content-type') || '';
    return contentType.includes('application/json') ? (res.json() as Promise<LoginResponse>) : ({ raw: await res.text() } as any);
  },
  profile: async (): Promise<{ username?: string; first_name?: string; last_name?: string; image?: string; [k: string]: any }> => {
    const res = await fetch('/api/auth/profile', { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Profile failed (${res.status})`);
    }
    return res.json();
  },
  changePassword: async (current_password: string, new_password: string) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password }),
      cache: 'no-store',
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Change password service invalid response');
    }
    const data = await res.json();
    if (!res.ok) {
      const backendMsg = data?.detail || data?.message || '';
      throw new Error(backendMsg || `Change password failed (${res.status})`);
    }
    return data;
  },
};


