import { MongoClient } from 'mongodb';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

let db;

async function createIndexes() {
    await db.collection('kline_day').createIndex(
        { stockFullId: 1 },
        { unique: true, background: true }
    );
    await db.collection('stock_detail').createIndex(
        { stockFullId: 1 },
        { unique: true, background: true }
    );
    console.log();
}

export async function init() {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB');

        db = client.db('mytrade');

        await createIndexes();
    } catch (error) {
        console.error('❌ 错误:', error);
        process.exit(-1, error.message);
    }
}

export async function getDB() {
    if (!db) {
        await init();
    }
    return db;
}

export async function close() {
    await client.close();
}