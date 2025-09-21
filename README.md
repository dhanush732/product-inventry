# Product Inventory Management System

A comprehensive product inventory management system built with Astro.js, TypeScript, React islands, TailwindCSS, Zod validation & Vitest tests. The application follows Domain Driven Design principles for robust product and cart management.

## Features

- **Authentication System**:
  - Secure login with default admin credentials
  - Client-side authentication using localStorage
  - Protected routes for admin access
  - Remember me functionality

- **Dark Mode Support**:
  - System preference detection
  - Manual toggle between light and dark themes
  - Persistent theme preference using localStorage
  - Full TailwindCSS dark mode styling

- **Product Management**:
  - Product listing and detailed views
  - Domain Driven Design architecture
  - Robust error handling
  - Type safety with Zod validation

- **Cart Functionality**:
  - Add and remove products from cart
  - Adjust quantities
  - Persistent cart storage
  - Checkout process

- **Technical Features**:
  - Astro.js for fast, static-first pages
  - React islands for interactive components
  - TailwindCSS for responsive design
  - Docker containerization
  - Comprehensive testing with Vitest

## Project Structure

```plaintext
src/
  domain/         # Core business entities and rules
  application/    # Application services and use cases
  components/     # Reusable UI components
  infrastructure/ # External services implementation
  layouts/        # Page layouts and templates
  pages/          # Astro pages and API routes
  styles/         # Global CSS styles
  utils/          # Utility functions
```

## Getting Started

### Login Credentials

- **Username**: admin
- **Password**: admin123

### Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

### Testing

```bash
npm run test
```

Coverage output in `coverage/`.

## Docker

Build and run:

```bash
docker build -t product-inventory .
docker run -p 4321:4321 product-inventory
```

## API Endpoints

### Products

```http
GET /api/products
GET /api/products/[id]
POST /api/products
PUT /api/products/[id]
DELETE /api/products/[id]
```

## Future Enhancements

- Add user management with different permission levels
- Implement server-side authentication
- Add more detailed product categories and filtering
- Create reports and analytics dashboard
- Add inventory alerts and notifications

## License

MIT
