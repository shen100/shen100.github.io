import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async function() {
    let stocksPoolJSONMap = {};
    let potentialStocksJSONMap = {};
    try {
        let stocksPoolJSONStr = fs.readFileSync(path.join(__dirname, 'json', 'stocks_pool.json'), 'utf-8');
        stocksPoolJSONMap = JSON.parse(stocksPoolJSONStr);

        let potentialStocksJSONStr = fs.readFileSync(path.join(__dirname, 'json', 'potential_stocks.json'), 'utf-8');
        potentialStocksJSONMap = JSON.parse(potentialStocksJSONStr);
        console.log();
    } catch (err) {
        console.log(err);
    }

}())