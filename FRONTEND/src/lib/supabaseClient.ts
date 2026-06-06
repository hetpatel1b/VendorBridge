// Mock Supabase Client that redirects queries and auth to local Express backend

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
      const res = await fetch('http://localhost:5000/api/v1/db', {
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

  async insert(data: any) {
    try {
      const res = await fetch('http://localhost:5000/api/v1/db', {
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
      const resData = await res.json();
      
      const chain = {
        select: () => ({
          single: () => ({
            then: (cb: any) => cb({ data: resData.data, error: resData.error })
          }),
          then: (cb: any) => cb({ data: resData.data, error: resData.error })
        }),
        then: (cb: any) => cb({ data: resData.data, error: resData.error })
      };
      return chain;
    } catch (err: any) {
      return {
        select: () => ({
          single: () => ({
            then: (cb: any) => cb({ data: null, error: { message: err.message } })
          }),
          then: (cb: any) => cb({ data: null, error: { message: err.message } })
        }),
        then: (cb: any) => cb({ data: null, error: { message: err.message } })
      };
    }
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
      const res = await fetch('http://localhost:5000/api/v1/db', {
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
    signUp: async ({ email, password }: any) => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, first_name: 'Demo', last_name: 'User', role: 'vendor' })
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
        const res = await fetch('http://localhost:5000/api/v1/auth/login', {
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
      return { error: null };
    },

    getSession: async () => {
      if (typeof window === 'undefined') return { data: { session: null }, error: null };
      const sessionStr = localStorage.getItem('mock_supabase_session');
      if (!sessionStr) return { data: { session: null }, error: null };
      try {
        const session = JSON.parse(sessionStr);
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
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
