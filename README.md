# LearnCode AI Frontend

Front end for LearnCode AI website built using React + TypeScript + Vite.

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

### Required Environment Variables

- `VITE_API_URL`: Backend API URL (e.g., `http://localhost:5000/api` for development)

### Example Configuration

For development:

```
VITE_API_URL=http://localhost:5000/api
```

For production:

```
VITE_API_URL=https://your-production-domain.com/api
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`
