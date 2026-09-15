# Library ACI Sant'Antonio Search - Development Guidelines

## Commands
- `npm install` - Install dependencies
- `npm run transform` - Transform Excel data to JSON
- `npm run serve` - Run development server
- `npm run dev` - Run transform and serve together
- `npm run build` - Build project (alias for transform)

## Project Structure
- `/file/` - Input Excel files (*.xls)
- `/public/` - Static files and generated JSON
- `/scripts/` - Data transformation scripts

## Code Style Guidelines
- **JavaScript**: Vanilla JS only, no frameworks
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: camelCase for variables/functions, descriptive names
- **Error Handling**: Try/catch with specific error messages
- **Functions**: Small, focused functions with clear purpose
- **DOM**: Use semantic HTML elements and proper ARIA attributes
- **Comments**: Add comments for complex logic only
- **SEO**: Maintain metadata and accessibility attributes

## Data Flow
1. Excel files (*.xls) in `/file/` directory
2. Transformed to JSON via `scripts/transform.js`
3. Served from `/public/books.json`
4. Queried by front-end search implementation