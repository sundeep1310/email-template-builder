# Email Builder

A full-stack web application that allows users to create and customize email templates with a user-friendly interface.

## Features

- Customizable email template creation
- Logo/image upload functionality
- Drag and drop section reordering
- Live preview of email templates
- Responsive design
- Email client compatibility
- Template saving and management

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB
- Multer for file uploads

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sundeep1310/email-template-builder
```

2. Install dependencies:

For the client:
```bash
cd client
npm install
```

For the server:
```bash
cd server
npm install
```

3. Set up environment variables:

Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/email-builder
PORT=5000
```

4. Create uploads directory:
```bash
mkdir server/src/uploads
```

## Running the Application

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure
```
email-template-builder/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
└── server/
    ├── src/
    │   ├── controllers/
    │   │   └── emailController.js
    │   ├── models/
    │   │   └── EmailTemplate.js
    │   ├── routes/
    │   │   └── emailRoutes.js
    │   ├── templates/
    │   │   └── layout.html
    │   ├── uploads/
    │   └── app.js
    └── package.json
```

## API Endpoints

- `GET /api/email-layout` - Get base email layout
- `POST /api/upload-image` - Upload template image
- `POST /api/email-config` - Save email template
- `POST /api/render-template` - Generate template preview

## Additional Features

- Section reordering with up/down controls
- Image preview before upload
- Real-time template preview
- Error handling and loading states
- Responsive design for all screen sizes

## Notes

- Supported image formats: PNG, JPEG, GIF
- Maximum image upload size: 5MB
- Supported email clients: Gmail, Outlook, Apple Mail

## Future Enhancements

- Rich text editing
- Template duplication
- Color customization
- Export functionality
- Template categories
- Multiple layout options

