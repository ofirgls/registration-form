import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDatabase() {
    try {
        const db = await open({
            filename: 'database.db',
            driver: sqlite3.Database
        });
        return db;
    } catch (error) {
        console.error('Error opening database:', error);
        throw error;
    }
}