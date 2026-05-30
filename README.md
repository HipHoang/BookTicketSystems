# 🚌 Bus Ticket Booking and Management System

A full-stack ticket booking platform that enables passengers to search routes, reserve seats, make payments, and manage bookings, while providing companies and administrators with tools to manage buses, schedules, routes, and operations.

The system is built using **Django REST Framework**, **ReactJS**, and **MySQL**, with integrated OAuth2 authentication and MoMo payment processing.

---

## 🚀 Features

### Passenger Features

* User registration and login
* OAuth2 authentication
* Search routes and schedules
* Seat selection and reservation
* Booking code generation
* Reservation tracking
* Online payment support
* Promotion code validation
* Review and rating system
* Notification management
* Chat messaging

### Company Features

* Company profile management
* Bus management
* Route management
* Stop management
* Schedule management
* Driver management
* Driver assignment management

### Administrative Features

* User management
* Company approval workflow
* Route administration
* Agent management
* System monitoring

---

## 🛠 Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* OAuth2 Provider
* Django ORM
* Swagger / OpenAPI

### Frontend

* ReactJS
* Axios
* React Router
* React Bootstrap

### Database

* MySQL

### Third-Party Services

* Cloudinary
* CKEditor
* MoMo Payment Gateway

---

## 🔐 Authentication & Authorization

The platform uses OAuth2 authentication and role-based access control.

Supported roles:

* Administrator
* Passenger
* Company
* Agent

Each role has dedicated permissions and system access levels.

---

## 📂 Core Modules

### Reservation Management

* Seat reservation
* Booking code generation
* Reservation lookup
* Reservation history

### Payment Processing

* Cash payment
* MoMo payment integration
* Payment confirmation
* Payment status tracking

### Route & Schedule Management

* Route creation
* Bus scheduling
* Stop management
* Seat inventory management

### Customer Experience

* Reviews and ratings
* Notifications
* Promotions and discounts
* Chat messaging

### Fleet Management

* Bus management
* Driver management
* Driver assignment tracking
* GPS location monitoring

---

## 📡 System Architecture

```text
Passenger / Company / Admin
            │
            ▼
      ReactJS Frontend
            │
        Axios API
            │
            ▼
 Django REST Framework
            │
 ┌──────────┼──────────┐
 │          │          │
 ▼          ▼          ▼
MySQL   Cloudinary   MoMo
Database   Storage  Payment
```

---

## 📂 Project Structure

```text
BookTicketSystems/
│
├── ticketManage/
│   ├── managements/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── perms.py
│   │
│   └── settings.py
│
├── ticketweb/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Backend

```bash
cd ticketManage

pip install -r requirements.txt
```

Configure MySQL settings in:

```text
ticketManage/settings.py
```

Run migrations:

```bash
python manage.py migrate
```

Start server:

```bash
python manage.py runserver
```

Backend URL:

```text
http://localhost:8000
```

---

### Frontend

```bash
cd ticketweb

npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

## 📊 Key Technical Highlights

* OAuth2 Authentication
* Role-Based Authorization
* RESTful API Design
* Seat Inventory Management
* Reservation Workflow
* MoMo Payment Integration
* Swagger API Documentation
* Cloudinary Media Storage
* MySQL Relational Database Design
* Full-Stack Architecture

---

## 🎯 Learning Outcomes

This project demonstrates practical experience in:

* Full-Stack Web Development
* Django REST Framework
* ReactJS Development
* Authentication & Authorization
* Payment Gateway Integration
* Database Design
* API Development
* Software Architecture
* Business Workflow Modeling

---

## 👨‍💻 Author

**Hoang Minh Hiep**

GitHub: https://github.com/HipHoang

---

## 📄 License

This project is licensed under the MIT License.
