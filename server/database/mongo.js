import { MongoClient } from 'mongodb';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

let db;

export async function init() {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB');

        db = client.db('mytrade');

    } catch (error) {
        console.error('❌ 错误:', error);
        process.exit(-1, error.message);
    }
}

export function getDB() {
    return db;
}