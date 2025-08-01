# URL Shortener Full-Stack Application

A complete URL shortener application with React frontend and Node.js backend, featuring comprehensive logging and analytics.

## Features

### Backend (Node.js/Express)
- ✅ **Create Short URL** - POST `/shorturls`
- ✅ **Get URL Statistics** - GET `/shorturls/:shortcode`
- ✅ **URL Redirection** - GET `/:shortcode`
- ✅ **Mandatory Logging Middleware** - Comprehensive request/response logging
- ✅ **Input Validation** - URL format and shortcode validation
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Security Headers** - Helmet.js integration
- ✅ **CORS Configuration** - Frontend integration
- ✅ **Error Handling** - Comprehensive error management

### Frontend (React)
- ✅ **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ✅ **URL Shortening Form** - Create short URLs with custom options
- ✅ **Analytics Dashboard** - Detailed click statistics and analytics
- ✅ **Copy to Clipboard** - Easy sharing functionality
- ✅ **Real-time Feedback** - Toast notifications
- ✅ **Responsive Design** - Works on all devices
- ✅ **Routing** - React Router for navigation

## API Endpoints

### Create Short URL
```http
POST /shorturls
Content-Type: application/json

{
  "url": "https://very-long-url.com/path",
  "validity": 30,
  "shortcode": "custom123"
}
```

### Get URL Statistics
```http
GET /shorturls/:shortcode
```

### Redirect to Original URL
```http
GET /:shortcode
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Install Dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client && npm install
   cd ..
   ```

2. **Start the Application**
   ```bash
   # Start both backend and frontend (recommended)
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only
   cd client && npm start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## Project Structure

```
fullstack/
├── server/
│   ├── index.js              # Main server file
│   ├── middleware/
│   │   └── logging.js        # Mandatory logging middleware
│   ├── routes/
│   │   └── shortUrlRoutes.js # API routes
│   ├── controllers/
│   │   └── shortUrlController.js # Business logic
│   ├── services/
│   │   └── shortUrlService.js    # Core URL shortening logic
│   └── logs/                 # Application logs
├── client/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js     # Navigation header
│   │   │   ├── UrlShortener.js # Main shortening form
│   │   │   └── UrlStats.js   # Analytics dashboard
│   │   ├── App.js            # Main React app
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Tailwind CSS
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── postcss.config.js     # PostCSS configuration
├── package.json              # Backend dependencies
└── README.md                 # This file
```

## Logging

The application uses a **mandatory custom logging middleware** as specified in the requirements:

- **Request Logging**: All incoming requests are logged with details
- **Response Logging**: Response times and status codes are tracked
- **Error Logging**: Comprehensive error tracking with stack traces
- **File Rotation**: Logs are automatically rotated to prevent disk space issues
- **Multiple Log Levels**: Error, info, and debug logs are separated

Log files are stored in `server/logs/`:
- `error.log` - Error-level logs
- `combined.log` - All logs
- `requests.log` - Detailed request/response logs

## Key Features Implementation

### 1. URL Shortening
- Validates URL format
- Generates unique shortcodes (6 characters)
- Supports custom shortcodes
- Default 30-minute validity
- Maximum 24-hour validity

### 2. Analytics
- Tracks total clicks
- Records click timestamps
- Captures IP addresses
- Stores user agents
- Tracks referrers
- Coarse location detection

### 3. Security
- Rate limiting (100 requests per 15 minutes)
- Input validation
- Security headers (Helmet.js)
- CORS configuration
- Error handling

### 4. Frontend Features
- Modern, responsive UI
- Real-time form validation
- Copy-to-clipboard functionality
- Toast notifications
- Analytics dashboard
- Mobile-friendly design

## Testing the Application

1. **Create a Short URL**
   - Go to http://localhost:3000
   - Enter a long URL
   - Optionally set validity and custom shortcode
   - Click "Create Short URL"

2. **Test Redirection**
   - Copy the generated short URL
   - Paste in browser or click the link
   - Should redirect to the original URL

3. **View Analytics**
   - Click "View Stats" on the created URL
   - See detailed click analytics
   - View click history and details

4. **API Testing**
   - Health check: http://localhost:5000/health
   - Create URL: `POST http://localhost:5000/shorturls`
   - Get stats: `GET http://localhost:5000/shorturls/:shortcode`

## Environment Variables

The application can be configured with environment variables:

```bash
PORT=5000                    # Backend port (default: 5000)
NODE_ENV=development         # Environment (development/production)
BASE_URL=http://localhost:5000 # Base URL for short links
```

## Development

### Backend Development
```bash
npm run server  # Start with nodemon for auto-reload
```

### Frontend Development
```bash
cd client
npm start      # Start React development server
```

### Full Stack Development
```bash
npm run dev    # Start both backend and frontend
```

## Production Deployment

1. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start Backend**
   ```bash
   npm start
   ```

3. **Configure Environment**
   - Set `NODE_ENV=production`
   - Configure `BASE_URL` for your domain
   - Set up proper logging paths

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend: Change `PORT` environment variable
   - Frontend: React will automatically suggest alternative port

2. **CORS Errors**
   - Ensure backend is running on port 5000
   - Check CORS configuration in `server/index.js`

3. **Logging Issues**
   - Check `server/logs/` directory exists
   - Verify write permissions

4. **Frontend Not Loading**
   - Ensure all dependencies are installed
   - Check for JavaScript errors in browser console

## API Documentation

### Request Examples

**Create Short URL:**
```bash
curl -X POST http://localhost:5000/shorturls \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "validity": 60,
    "shortcode": "custom123"
  }'
```

**Get Statistics:**
```bash
curl http://localhost:5000/shorturls/custom123
```

**Health Check:**
```bash
curl http://localhost:5000/health
```

## License

MIT License - feel free to use this project for educational or commercial purposes. 