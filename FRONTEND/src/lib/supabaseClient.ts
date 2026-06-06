// Mock Supabase Client that redirects queries and auth to local Express backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class MockQueryBuilder {
  private table: string;
  private filters: any[] = [];
  private orderVal: any = null;
  private limitVal: number | null = null;
  private singleRow = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields?: string) {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: 'eq', value });
    return this;
  }

  ilike(field: string, pattern: string) {
    this.filters.push({ field, operator: 'ilike', value: pattern });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ field, operator: 'in', value: values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderVal = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(val: number) {
    this.limitVal = val;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  async then(onfulfilled: (res: any) => void) {
    try {
      const res = await fetch(`${API_URL}/api/v1/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MockSupabaseClient.getAccessToken()}`
        },
        body: JSON.stringify({
          table: this.table,
          action: 'select',
          filters: this.filters,
          order: this.orderVal,
          limit: this.limitVal,
          single: this.singleRow
        })
      });
      const data = await res.json();
      return onfulfilled(data);
    } catch (err: any) {
      return onfulfilled({ data: null, error: { message: err.message } });
    }
  }

  insert(data: any) {
    const execute = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/db`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MockSupabaseClient.getAccessToken()}`
          },
          body: JSON.stringify({
            table: this.table,
            action: 'insert',
            data
          })
        });
        return await res.json();
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    };

    const promise = execute();

    // Attach select method directly to the promise
    (promise as any).select = () => {
      const selectPromise = promise.then(res => ({
        data: res.data,
        error: res.error
      }));
      (selectPromise as any).single = () => {
        return selectPromise.then(res => ({
          data: Array.isArray(res.data) ? res.data[0] : res.data,
          error: res.error
        }));
      };
      return selectPromise;
    };

    return promise as any;
  }
}

class MockMutationBuilder {
  private table: string;
  private actionType: 'update' | 'delete';
  private values: any;
  private filters: any[] = [];
  private singleRow = false;

  constructor(table: string, actionType: 'update' | 'delete', values?: any) {
    this.table = table;
    this.actionType = actionType;
    this.values = values;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: 'eq', value });
    return this;
  }

  select() {
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  async then(onfulfilled: (res: any) => void) {
    try {
      const res = await fetch(`${API_URL}/api/v1/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MockSupabaseClient.getAccessToken()}`
        },
        body: JSON.stringify({
          table: this.table,
          action: this.actionType,
          data: this.values,
          filters: this.filters,
          single: this.singleRow
        })
      });
      const data = await res.json();
      return onfulfilled(data);
    } catch (err: any) {
      return onfulfilled({ data: null, error: { message: err.message } });
    }
  }
}

class MockSupabaseClient {
  static listeners: Array<(event: string, session: any) => void> = [];

  static getAccessToken() {
    if (typeof window === 'undefined') return '';
    const sessionStr = localStorage.getItem('mock_supabase_session');
    if (!sessionStr) return '';
    try {
      const session = JSON.parse(sessionStr);
      return session?.access_token || '';
    } catch {
      return '';
    }
  }

  auth = {
    signUp: async ({ email, password, first_name, last_name, role }: any) => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            first_name: first_name || 'Demo', 
            last_name: last_name || 'User', 
            role: role || 'vendor' 
          })
        });
        const data = await res.json();
        if (data.success) {
          return supabase.auth.signInWithPassword({ email, password });
        }
        return { data: { user: null }, error: { message: data.error || 'Failed to sign up' } };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },

    signInWithPassword: async ({ email, password }: any) => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          const session = {
            access_token: data.token,
            user: {
              id: data.user.id,
              email: data.user.email
            }
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('mock_supabase_session', JSON.stringify(session));
          }
          
          MockSupabaseClient.listeners.forEach(listener => listener('SIGNED_IN', session));

          return { data: { session, user: session.user }, error: null };
        }
        return { data: { session: null, user: null }, error: { message: data.error || 'Invalid credentials' } };
      } catch (err: any) {
        return { data: { session: null, user: null }, error: { message: err.message } };
      }
    },

    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_supabase_session');
      }
      MockSupabaseClient.listeners.forEach(listener => listener('SIGNED_OUT', null));
      return { error: null as any };
    },

    getSession: async () => {
      if (typeof window === 'undefined') return { data: { session: null }, error: null as any };
      const sessionStr = localStorage.getItem('mock_supabase_session');
      if (!sessionStr) return { data: { session: null }, error: null as any };
      try {
        const session = JSON.parse(sessionStr);
        return { data: { session }, error: null as any };
      } catch {
        return { data: { session: null }, error: null as any };
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      MockSupabaseClient.listeners.push(callback);
      supabase.auth.getSession().then(({ data: { session } }) => {
        callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              MockSupabaseClient.listeners = MockSupabaseClient.listeners.filter(l => l !== callback);
            }
          }
        }
      };
    }
  };

  from(table: string) {
    return {
      select: (fields?: string) => new MockQueryBuilder(table).select(fields),
      insert: (data: any) => new MockQueryBuilder(table).insert(data),
      update: (data: any) => new MockMutationBuilder(table, 'update', data),
      delete: () => new MockMutationBuilder(table, 'delete')
    };
  }
}

export const supabase = new MockSupabaseClient();
