# 🎓 Student Progress Tracker

A comprehensive web-based application for tracking and managing student academic performance, attendance, and progress with AI-powered insights.

## 📋 Overview

Student Progress Tracker is a full-stack web application designed to streamline educational management through three dedicated portals:
- **Admin Portal** - Complete system management and oversight
- **Teacher Portal** - Attendance tracking, marks entry, and student communication
- **Student Portal** - Performance visualization, AI insights, and progress reports

## ✨ Key Features

### 👨‍💼 Admin Portal
- 📊 Dashboard with comprehensive statistics (total classes, teachers, students)
- 👥 User management (create/edit teachers and students)
- 🏫 Class creation and management
- 📅 Schedule management and teacher assignment
- 🔐 Role-based access control

### 👨‍🏫 Teacher Portal
- ✅ Attendance marking and management
- 📝 Marks entry and grade management
- 💬 Direct messaging with students
- 📊 Class performance analytics
- 🤖 AI teaching assistant for educational support
- 📋 Report generation

### 👨‍🎓 Student Portal
- 📈 Performance visualization (charts and graphs)
- 📊 Attendance tracking with percentages
- 📉 Subject-wise marks analysis
- 🤖 AI-powered performance insights and recommendations
- 📄 Downloadable progress reports (PDF)
- 💬 Messaging system to communicate with teachers
- 🤖 AI study assistant for homework help

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js 18+ with TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Chart.js & react-chartjs-2
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** Redux Toolkit / Context API

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** JavaScript/TypeScript
- **Authentication:** JWT (JSON Web Tokens)
- **API:** RESTful architecture

### Database
- **Primary:** MySQL 8.0+ / PostgreSQL
- **Caching:** Redis (optional)
- **ORM:** Sequelize / Prisma

### AI Integration
- **Provider:** OpenAI GPT-4 API
- **Features:** Performance analysis, study recommendations, teaching assistance

### DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx
- **Version Control:** Git

## 📁 Project Structure

```
student-progress-tracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Admin/       # Admin portal components
│   │   │   ├── Teacher/     # Teacher portal components
│   │   │   ├── Student/     # Student portal components
│   │   │   ├── Auth/        # Authentication components
│   │   │   └── Common/      # Shared components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── public/
│   └── package.json
│
├── backend/                  # Node.js backend application
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── scripts/             # Database scripts
│   └── server.js            # Entry point
│
├── docker-compose.yml       # Docker compose configuration
├── Dockerfile.frontend      # Frontend Docker image
├── Dockerfile.backend       # Backend Docker image
├── nginx.conf               # Nginx configuration
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MySQL 8.0+ / PostgreSQL
- Docker & Docker Compose (optional)
- OpenAI API key (for AI features)

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd student-progress-tracker
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configurations:
# - Database credentials
# - JWT secret
# - OpenAI API key
# - Port settings

# Run database migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

#### 3. Setup Frontend
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with API endpoint
```

#### 4. Run the Application

**Development Mode:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

**Using Docker:**
```bash
docker-compose up -d
```

## 🌐 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Login:** `/admin/login`
- **Teacher Login:** `/teacher/login`
- **Student Login:** `/student/login`

## 📊 Database Schema

The application uses a normalized relational database with the following main tables:
- `users` - User accounts and authentication
- `roles` - User roles (admin, teacher, student)
- `classes` - Class information
- `students` - Student profiles
- `teachers` - Teacher profiles
- `subjects` - Subject details
- `attendance` - Attendance records
- `marks` - Student marks and grades
- `schedules` - Class schedules
- `messages` - Messaging system
- `ai_insights` - AI-generated insights
- `progress_reports` - Student reports

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/users` - Create user
- `GET /api/admin/classes` - List classes
- `POST /api/admin/schedule` - Create schedule

### Teacher Routes
- `GET /api/teacher/classes` - Get assigned classes
- `POST /api/teacher/attendance` - Mark attendance
- `POST /api/teacher/marks` - Enter marks
- `GET /api/teacher/messages` - View messages

### Student Routes
- `GET /api/student/dashboard` - Dashboard data
- `GET /api/student/attendance` - Attendance records
- `GET /api/student/marks` - Marks and grades
- `GET /api/student/insights` - AI insights
- `GET /api/student/report` - Download progress report

## 🤖 AI Features

- **Performance Analysis:** Evaluates student performance based on marks and attendance
- **Personalized Recommendations:** Suggests improvement strategies
- **Study Assistant:** Helps students with homework and learning resources
- **Teaching Assistant:** Provides teaching suggestions and class insights
- **Weak Area Identification:** Identifies subjects needing attention

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS configuration
- Rate limiting
- SQL injection prevention
- XSS protection
- HTTPS/SSL support

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Using Docker Compose
```bash
docker-compose up -d --build
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Configure Nginx to serve frontend and proxy backend
3. Set up SSL certificates (Let's Encrypt)
4. Configure environment variables for production
5. Start backend with process manager (PM2)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- OpenAI for AI integration
- React and Node.js communities
- All contributors and testers

## 📞 Support

For support, email saranbalusam10@gmail.com or open an issue in the repository.

## 🔄 Version History

- **v1.0.0** (2025-12-11)
  - Initial release
  - Admin, Teacher, and Student portals
  - AI integration
  - Attendance and marks management
  - Progress reports with PDF export

---

**Made with ❤️ for better education management**
