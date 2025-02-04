# Aci Sant'Antonio Library - Search System

A free and open-source search system for the catalog of the Municipal Library of Aci Sant'Antonio (Sicily, Italy), created to support the library in its mission of spreading culture and promoting reading.

## 🌟 Features

- 🔍 Full-text search across the entire catalog
- 📚 Specific search by title, author, year, and inventory number
- ⚡ Fast and responsive interface
- 📱 Responsive design for all devices
- 🔄 Automatic weekly catalog updates
- 🌐 Automatic deployment to GitHub Pages
- ♿ Optimized accessibility

## 🛠 Tech Stack

- Vanilla JavaScript (no frameworks)
- Tailwind CSS for styling
- lunr.js for full-text search
- SheetJS for Excel file processing
- GitHub Actions for automation and deployment

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Silverkron/library-search

# Enter directory
cd biblioteca-acisantantonio

# Install dependencies
npm install

# Run locally
npm run dev
```

## 🔄 Update Pipeline

The system updates automatically every week following this process:

1. Downloads the new Excel file from the configured source
2. Converts the file to an optimized JSON
3. Creates a Pull Request with the new data
4. After approval, automatically updates the site

### Pipeline Configuration

1. Configure GitHub secrets:
    - `EXCEL_URL`: Catalog Excel file URL

2. Enable GitHub Pages:
    - Settings > Pages
    - Select `gh-pages` branch
    - Save configuration

### Manual Update

```bash
# Generate new JSON from Excel data
npm run transform

# Commit and push
git commit -am "update: library data"
git push origin main
```

## 📁 Project Structure

```
/
├── .github/workflows/    # Automation pipeline
├── file/                # Catalog Excel file
├── public/              # Static files and JSON
├── scripts/             # Transformation scripts
└── index.html          # User interface
```

## 🤝 Contributing

Contributions are welcome! If you want to improve the project:

1. Fork the repository
2. Create a branch for your changes
   ```bash
   git checkout -b feature/MyFeature
   ```
3. Commit your changes
   ```bash
   git commit -am 'feat: add a new feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/MyFeature
   ```
5. Open a Pull Request

## 📄 License

This project is released under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Acknowledgments

Special thanks to the Municipal Library of Aci Sant'Antonio for making this project possible and for their commitment to spreading culture in the community.

## 🔗 Useful Links
- [Live Demo](https://Silverkron.github.io/library-search)
- [Aci Sant'Antonio Library](https://www.comune.acisantantonio.ct.it/biblioteca)

## 🏛 About the Library

The Municipal Library of Aci Sant'Antonio is located in Sicily, Italy. This project is part of their digital transformation initiative, aiming to make their catalog more accessible to the community and researchers worldwide.

---

Made with ❤️ for the Aci Sant'Antonio community
