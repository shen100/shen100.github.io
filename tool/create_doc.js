import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES 模块中 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ************************************************************
// 创建文档，改这 3 个变量即可，然后 node create_doc.js             
const bookId = 4;               // 文档集ID                                   
const bookName = '备忘';         // 文档集名称                           
const chapterName = '键盘设置'; // 章节名称                     
// ************************************************************

const chapterId = Date.now();
const bookPath = path.join(__dirname, `../public/data/docs/${bookId}`);
const imagePath = path.join(__dirname, `../public/image/docs/${bookId}`);
const chapterPath = path.join(bookPath, 'chapter');
const chapterContentPath = path.join(bookPath, 'chapter', chapterId + '.md');
const infoPath = path.join(bookPath, 'info.json');

let chapterData = {
    "bookId": bookId,
    "_id": Date.now(),
    "parentId": 0,
    "title": chapterName
};

let infoJSON = {
    "code": 0,
    "data": {
        "title": bookName,
        "list": [
            chapterData
        ]
    }
};
let infoContent = JSON.stringify(infoJSON, null, 4);

let chapterContent = `---
theme: channing-cyan
---
# ${chapterName}
`;

try {
    try {
        const infoOldContent = fs.readFileSync(infoPath, 'utf8');
        let infoOldJson = JSON.parse(infoOldContent);
        infoOldJson.data.list.push(chapterData);
        infoContent = JSON.stringify(infoOldJson, null, 4);
        fs.writeFileSync(infoPath, infoContent, 'utf8');
        fs.writeFileSync(chapterContentPath, chapterContent, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            fs.mkdirSync(chapterPath, { recursive: true }); // recursive: true 会自动创建所有必要的父目录
            console.log(`创建目录: ${chapterPath}`);
            
            fs.mkdirSync(imagePath, { recursive: true });
            console.log(`创建目录: ${imagePath}`);

            fs.writeFileSync(infoPath, infoContent, 'utf8');
            fs.writeFileSync(chapterContentPath, chapterContent, 'utf8');
            console.log(`创建文件: ${infoPath}`);
        } else {
            // 其他读取错误
            console.error('读取文件时出错:', err);
        }
    }
} catch (error) {
    console.error('创建目录或文件时出错:', error);
}

