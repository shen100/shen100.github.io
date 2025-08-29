import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function writeAllCompanies() {
    const dataDir = path.join(__dirname, 'data');
    const fileNames = fs.readdirSync(dataDir);
    const jsonFiles = fileNames
        .filter(fileName => {
            return path.extname(fileName) === '.json' && fileName !== 'all.json';
        })
        .sort((a, b) => a > b ? -1 : 1);

    const tsCodeMap = {};
    const items = [];
    let fields;
    for (const fileName of jsonFiles) {
        const filePath = path.join(dataDir, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
            let data = JSON.parse(fileContent);
            data = data.data;
            if (!fields) {
                fields = data.fields;
            }
            data.items.forEach(item => {
                let ts_code = item[0];
                if (!tsCodeMap[ts_code]) {
                    items.push(item);
                    tsCodeMap[ts_code] = true;
                }
            });
        } catch (error) {
            console.error(`解析文件 ${fileName} 出错:`, error);
        }
    }

    fs.writeFileSync(path.join(dataDir, 'all.json'), JSON.stringify({
        fields: fields,
        items: items
    }, null, 2), 'utf-8');

    console.log(`已生成 all.json 文件，包含 ${items.length} 条数据。`);
}

writeAllCompanies();
