const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function findExcelFile() {
    const fileDir = path.join(__dirname, '..', 'file');

    // Check if directory exists
    if (!fs.existsSync(fileDir)) {
        throw new Error('Directory "file" not found');
    }

    // Look for .xls files in directory
    const files = fs.readdirSync(fileDir);
    const excelFile = files.find(file => file.endsWith('.xls'));

    if (!excelFile) {
        throw new Error('No .xls file found in "file" directory');
    }

    return path.join(fileDir, excelFile);
}

// Read Excel file and transform to optimized JSON
function transformExcelToJson() {
    try {
        // Find Excel file
        const excelPath = findExcelFile();
        console.log(`Excel file found: ${excelPath}`);

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

transformExcelToJson();
