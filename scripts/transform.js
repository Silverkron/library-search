const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

async function getExcelFileUrl() {
    const postData = '--AZazAZ\n&name="protocollo=https&ser=www.comune.acisantantonio.ct.it&en=e1080&MESSA=PUBBLICA&DSK=0000QT010255F&FORM=xls&PAGINA="\n--AZazAZ--';
    
    const options = {
        hostname: 'www.comune.acisantantonio.ct.it',
        path: '/EG0/EGDOCVISJS.HBL',
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.PATH) {
                        resolve(response.PATH);
                    } else {
                        reject(new Error('No PATH found in response'));
                    }
                } catch (error) {
                    reject(new Error('Invalid JSON response: ' + error.message));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

async function downloadExcelFile(url) {
    const fileDir = path.join(__dirname, '..', 'file');
    const fileName = 'downloaded_books.xls';
    const filePath = path.join(fileDir, fileName);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
    }
    
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(filePath);
            
            res.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filePath);
            });
            
            fileStream.on('error', (error) => {
                fs.unlink(filePath, () => {}); // Delete partial file
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Read Excel file and transform to optimized JSON
async function transformExcelToJson() {
    try {
        // Get Excel file URL from API
        console.log('Fetching Excel file URL from API...');
        const excelUrl = await getExcelFileUrl();
        console.log(`Excel file URL: ${excelUrl}`);
        
        // Download Excel file
        console.log('Downloading Excel file...');
        const excelPath = await downloadExcelFile(excelUrl);
        console.log(`Excel file downloaded: ${excelPath}`);

        // Read Excel file
        const workbook = XLSX.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Transform and optimize data
        const optimizedData = data.map(book => ({
            id: book['Numero Inventario'],
            title: book['TITOLO'],
            author: book['AUTORE'],
            year: book['ANNO'],
            publisher: book['Casa Editrice']
        })).filter(book => book.id && book.title); // Remove books without ID or title

        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, '..', 'public');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save JSON
        fs.writeFileSync(
            path.join(outputDir, 'books.json'),
            JSON.stringify(optimizedData),
            'utf8'
        );

        console.log(`Transformation completed. Generated ${optimizedData.length} records.`);
    } catch (error) {
        console.error('Error during transformation:', error.message);
        process.exit(1);
    }
}

transformExcelToJson().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
});
