# INSYDE - Web-based CAD Viewer  

## Overview  

INSYDE is a web-based CAD viewer that allows users to upload, view, and manipulate 3D models (STL/OBJ). The project includes authentication features (login/register), file uploads, and a history preview for user interactions. The frontend is built with React and Three.js, while the backend is developed using Express.js and MongoDB.  

## Features  

- **User Authentication** (Register/Login)  
- **Upload 3D Models** (STL/OBJ format)  
- **View & Manipulate Models** (Rotate, Zoom, Reset, Download, Grid, Pan using Three.js)  
- **History Preview** (List of uploaded models for users)  
- **Secure API** (Built with Express.js, MongoDB, and JWT authentication)  

## Tech Stack  

### Frontend  
- React.js  
- Three.js  
- React Router  
- Axios  

### Backend  
- Node.js  
- Express.js  
- MongoDB (Mongoose ORM)  
- JWT for Authentication  
- Multer for File Uploads  
- Dotenv for Configuration  

## Installation & Setup  

### Prerequisites  

Ensure you have the following installed:  

- Node.js (v16 or higher)  
- MongoDB (Local or Cloud - MongoDB Atlas)  
- MongoDB Compass (For local database management)  

### Clone the Repository  

```sh
git clone https://github.com/ayyappa53/Insyde.git
cd insyde
```  

### Backend Setup  

1. Navigate to the backend folder:  
   ```sh
   cd backend
   ```  
2. Install dependencies:  
   ```sh
   npm install
   ```  
3. Install and configure MongoDB Compass:  
   - Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass)  
   - Open MongoDB Compass and connect to the local database using:  
     ```
     mongodb://localhost:27017/insyde
     ```
   - Create a new database named **insyde**  

4. Create a `.env` file and add the following variables:  
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/insyde
   JWT_SECRET=insydesecretkey
   ```
   
6. Start the backend server:  
   ```sh
   npm start
   ```  
   The backend will run on `http://localhost:5000`  

### Frontend Setup  

1. Navigate to the frontend folder:  
   ```sh
   cd frontend
   ```  
2. Install dependencies:  
   ```sh
   npm install
   ```  
3. Start the frontend server:  
   ```sh
   npm start
   ```  
   The frontend will run on `http://localhost:3000`  

## Usage  

1. Register/Login to the platform.  
2. Upload a 3D model file (STL/OBJ).  
3. View and interact with the 3D model using the UI controls.  
4. Check history to view previously uploaded models.  

## Demo Video  

## 🎥 Demo Video  
[![Watch the demo]((https://github.com/user-attachments/assets/c566b999-13df-4266-9bd8-ca144b7bbe10)
)](https://drive.google.com/file/d/1V6rTUdr0KTGZW5y7vZY_koL0tgrsIuXS/view?usp=sharing)


## Contact  

Feel free to ask any type of questions.  
Email: [ayyappachowdarykandula@gmail.com](mailto:ayyappachowdarykandula@gmail.com)  
