import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'mock-key';

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.json');

function readDb() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading local db:', err);
        return {};
    }
}

function writeDb(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing local db:', err);
        return false;
    }
}

class MockQueryBuilder {
    constructor(table, db) {
        this.table = table;
        this.db = db;
        this.data = [...(db[table] || [])];
        this.filters = [];
        this.singleRow = false;
        this.limitVal = null;
        this.orderVal = null;
        this.rangeVal = null;
    }

    select(fields, options) {
        if (options && options.count) {
            this.countRequest = options.count;
        }
        return this;
    }

    eq(field, value) {
        this.data = this.data.filter(row => row[field] === value);
        return this;
    }

    ilike(field, pattern) {
        const searchStr = pattern.replace(/%/g, '').toLowerCase();
        this.data = this.data.filter(row => String(row[field] || '').toLowerCase().includes(searchStr));
        return this;
    }

    in(field, values) {
        this.data = this.data.filter(row => Array.isArray(values) && values.includes(row[field]));
        return this;
    }

    order(column, options = {}) {
        const ascending = options.ascending !== false;
        this.orderVal = { column, ascending };
        return this;
    }

    range(from, to) {
        this.rangeVal = { from, to };
        return this;
    }

    single() {
        this.singleRow = true;
        return this;
    }

    async then(onfulfilled) {
        if (this.orderVal) {
            const { column, ascending } = this.orderVal;
            this.data.sort((a, b) => {
                const valA = a[column];
                const valB = b[column];
                if (valA === valB) return 0;
                if (valA == null) return 1;
                if (valB == null) return -1;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return ascending ? valA - valB : valB - valA;
                }
                return ascending 
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
            });
        }

        const totalCount = this.data.length;

        if (this.rangeVal) {
            const { from, to } = this.rangeVal;
            this.data = this.data.slice(from, to + 1);
        }

        let result = this.singleRow ? (this.data[0] || null) : this.data;

        if (this.singleRow && !this.data[0]) {
            return onfulfilled({
                data: null,
                error: { message: `No row found in ${this.table}` },
                count: null
            });
        }

        return onfulfilled({
            data: result,
            error: null,
            count: totalCount
        });
    }
}

class MockMutationBuilder {
    constructor(table, actionType, values) {
        this.table = table;
        this.actionType = actionType;
        this.values = values;
        this.filters = [];
        this.singleRow = false;
    }

    eq(field, value) {
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

    async then(onfulfilled) {
        const db = readDb();
        if (!db[this.table]) db[this.table] = [];

        let affectedRows = [];

        if (this.actionType === 'update') {
            db[this.table] = db[this.table].map(row => {
                let match = true;
                this.filters.forEach(filter => {
                    if (row[filter.field] !== filter.value) match = false;
                });
                if (match) {
                    const updated = { ...row, ...this.values, updated_at: new Date().toISOString() };
                    affectedRows.push(updated);
                    return updated;
                }
                return row;
            });
            writeDb(db);
            return onfulfilled({
                data: this.singleRow ? (affectedRows[0] || null) : affectedRows,
                error: affectedRows.length === 0 ? { message: 'Not found' } : null
            });
        }

        if (this.actionType === 'delete') {
            db[this.table] = db[this.table].filter(row => {
                let match = true;
                this.filters.forEach(filter => {
                    if (row[filter.field] !== filter.value) match = false;
                });
                if (match) {
                    affectedRows.push(row);
                    return false;
                }
                return true;
            });
            writeDb(db);
            return onfulfilled({
                data: affectedRows,
                error: null
            });
        }
    }
}

class MockSupabaseClient {
    auth = {
        signUp: async ({ email, password }) => {
            if (process.env.USE_REAL_SUPABASE === 'true') {
                try {
                    const { data, error } = await realSupabase.auth.signUp({ email, password });
                    if (!error && data && data.user) {
                        return { data, error: null };
                    }
                    console.warn("Real Supabase signup failed, trying local DB fallback. Error:", error?.message);
                } catch (err) {
                    console.warn("Real Supabase signup failed with exception, trying local DB fallback:", err.message);
                }
            }

            const db = readDb();
            const existing = db.users.find(u => u.email === email);
            if (existing) {
                return { data: { user: null }, error: { message: 'User already exists in local DB' } };
            }

            const newUser = {
                id: crypto.randomUUID(),
                email,
                password,
                first_name: '',
                last_name: '',
                role: 'vendor',
                is_active: true,
                created_at: new Date().toISOString()
            };

            db.users.push(newUser);
            writeDb(db);

            return {
                data: {
                    user: {
                        id: newUser.id,
                        email: newUser.email
                    }
                },
                error: null
            };
        },

        signInWithPassword: async ({ email, password }) => {
            if (process.env.USE_REAL_SUPABASE === 'true') {
                try {
                    const { data, error } = await realSupabase.auth.signInWithPassword({ email, password });
                    if (!error && data && data.session) {
                        const currentDb = readDb();
                        const existingProfile = currentDb.users.find(u => u.id === data.user.id);
                        if (!existingProfile) {
                            currentDb.users.push({
                                id: data.user.id,
                                email: data.user.email,
                                first_name: 'Supabase',
                                last_name: 'User',
                                role: 'vendor',
                                is_active: true,
                                created_at: new Date().toISOString()
                            });
                            writeDb(currentDb);
                        }
                        return { data, error: null };
                    }
                    console.warn("Real Supabase login failed, trying local DB fallback. Error:", error?.message);
                } catch (err) {
                    console.warn("Real Supabase login failed with exception:", err.message);
                }
            }

            const db = readDb();
            const user = db.users.find(u => u.email === email && u.password === password);
            if (!user) {
                return { data: { session: null }, error: { message: 'Invalid credentials' } };
            }

            const mockToken = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');

            return {
                data: {
                    user: {
                        id: user.id,
                        email: user.email
                    },
                    session: {
                        access_token: `mock_jwt_${mockToken}`
                    }
                },
                error: null
            };
        },

        getUser: async (token) => {
            if (token && token.startsWith('mock_jwt_')) {
                try {
                    const base64 = token.replace('mock_jwt_', '');
                    const userPayload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
                    const db = readDb();
                    const user = db.users.find(u => u.id === userPayload.id);

                    if (!user) {
                        return { data: { user: null }, error: { message: 'User not found in local DB' } };
                    }

                    return {
                        data: {
                            user: {
                                id: user.id,
                                email: user.email
                            }
                        },
                        error: null
                    };
                } catch (err) {
                    return { data: { user: null }, error: { message: 'Failed to decode mock token' } };
                }
            }

            if (process.env.USE_REAL_SUPABASE === 'true') {
                try {
                    const { data, error } = await realSupabase.auth.getUser(token);
                    if (!error && data && data.user) {
                        return { data, error: null };
                    }
                    return { data: { user: null }, error };
                } catch (err) {
                    return { data: { user: null }, error: { message: err.message } };
                }
            }

            return { data: { user: null }, error: { message: 'Invalid or expired token (local mode)' } };
        }
    };

    from(table) {
        const db = readDb();
        return {
            select: (fields, options) => {
                return new MockQueryBuilder(table, db).select(fields, options);
            },
            insert: (records) => {
                const execute = async () => {
                    const currentDb = readDb();
                    if (!currentDb[table]) currentDb[table] = [];
                    const rowsToInsert = Array.isArray(records) ? records : [records];
                    const inserted = [];
                    
                    rowsToInsert.forEach(row => {
                        const existingIdx = row.id ? currentDb[table].findIndex(r => r.id === row.id) : -1;
                        if (existingIdx > -1) {
                            currentDb[table][existingIdx] = {
                                ...currentDb[table][existingIdx],
                                ...row,
                                updated_at: new Date().toISOString()
                            };
                            inserted.push(currentDb[table][existingIdx]);
                        } else {
                            const newRow = {
                                id: row.id || crypto.randomUUID(),
                                created_at: new Date().toISOString(),
                                ...row
                            };
                            currentDb[table].push(newRow);
                            inserted.push(newRow);
                        }
                    });
                    
                    writeDb(currentDb);
                    return {
                        data: Array.isArray(records) ? inserted : inserted[0],
                        error: null
                    };
                };
                
                const promise = execute();
                promise.select = (fields) => {
                    const selectPromise = promise.then(res => ({
                        data: res.data,
                        error: res.error
                    }));
                    selectPromise.single = () => {
                        return selectPromise.then(res => ({
                            data: Array.isArray(res.data) ? res.data[0] : res.data,
                            error: res.error
                        }));
                    };
                    return selectPromise;
                };
                return promise;
            },
            update: (values) => {
                return new MockMutationBuilder(table, 'update', values);
            },
            delete: () => {
                return new MockMutationBuilder(table, 'delete');
            }
        };
    }
}

export const supabase = new MockSupabaseClient();
