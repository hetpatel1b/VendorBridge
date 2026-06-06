import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../lib/database.json');

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

router.post('/', (req, res) => {
    const { table, action, data, filters, order, limit, single } = req.body;
    
    if (!table) {
        return res.status(400).json({ error: 'Missing table parameter' });
    }

    const db = readDb();
    if (!db[table]) {
        db[table] = [];
    }

    let tableData = [...db[table]];

    if (action === 'select') {
        // Apply filters
        if (filters && Array.isArray(filters)) {
            filters.forEach(filter => {
                const { field, operator, value } = filter;
                if (operator === 'eq') {
                    tableData = tableData.filter(row => row[field] === value);
                } else if (operator === 'ilike') {
                    const searchStr = String(value).replace(/%/g, '').toLowerCase();
                    tableData = tableData.filter(row => String(row[field]).toLowerCase().includes(searchStr));
                } else if (operator === 'in') {
                    tableData = tableData.filter(row => Array.isArray(value) && value.includes(row[field]));
                }
            });
        }

        // Apply ordering
        if (order) {
            const { column, ascending } = order;
            tableData.sort((a, b) => {
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

        // Apply single or limit
        if (single) {
            return res.json({ data: tableData[0] || null, error: null });
        }
        if (limit) {
            tableData = tableData.slice(0, parseInt(limit));
        }

        return res.json({ data: tableData, error: null });
    }

    if (action === 'insert') {
        const rowsToInsert = Array.isArray(data) ? data : [data];
        const inserted = [];
        rowsToInsert.forEach(row => {
            const newRow = { 
                id: row.id || crypto.randomUUID(), 
                created_at: new Date().toISOString(),
                ...row 
            };
            db[table].push(newRow);
            inserted.push(newRow);
        });
        writeDb(db);
        return res.json({ data: Array.isArray(data) ? inserted : inserted[0], error: null });
    }

    if (action === 'update') {
        let updatedCount = 0;
        const updatedRows = [];
        db[table] = db[table].map(row => {
            let match = true;
            if (filters && Array.isArray(filters)) {
                filters.forEach(filter => {
                    const { field, operator, value } = filter;
                    if (operator === 'eq' && row[field] !== value) {
                        match = false;
                    }
                });
            } else {
                match = false;
            }
            if (match) {
                const updatedRow = { ...row, ...data, updated_at: new Date().toISOString() };
                updatedCount++;
                updatedRows.push(updatedRow);
                return updatedRow;
            }
            return row;
        });

        if (updatedCount > 0) {
            writeDb(db);
        }

        return res.json({ data: single ? (updatedRows[0] || null) : updatedRows, error: null });
    }

    if (action === 'delete') {
        let deletedCount = 0;
        db[table] = db[table].filter(row => {
            let match = true;
            if (filters && Array.isArray(filters)) {
                filters.forEach(filter => {
                    const { field, operator, value } = filter;
                    if (operator === 'eq' && row[field] !== value) {
                        match = false;
                    }
                });
            } else {
                match = false;
            }
            if (match) {
                deletedCount++;
                return false;
            }
            return true;
        });

        if (deletedCount > 0) {
            writeDb(db);
        }

        return res.json({ data: { count: deletedCount }, error: null });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
});

export default router;
