#  Online Food Delivery System

A full stack food delivery application built using the MERN stack.  
Users can browse restaurants, view menus, customize items, add to cart, and place orders.  
Restaurant owners can manage menus and orders through a dashboard.

---

##  Tech Stack
Frontend
- React.js
- Context API
- Axios
- Tailwind CSS
- Netlify for deployment

Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- Render for deployment


##  Features

### User
- User authentication (login / register)
- Browse nearby restaurants
- View menus & customize items
- Add to cart
- Place orders
- Order status & notifications
- **Address Management** - Save multiple delivery addresses, set default address

### Restaurant Owner
- Owner dashboard
- Add / edit menu items
- Manage customized menu items
- Update order status

### Admin
- Approve restaurants
- Manage users and orders

## Environment Variables


### Server (server/.env)
        
PORT=8000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret

### Client (client/.env)

VITE_API_BASE_URL=http://localhost:8000/api

---

## Address Management

### Features
- Save multiple delivery addresses
- Label addresses (Home, Office, Other)
- Set a default address
- Edit and delete addresses

### Frontend Implementation

- Full UI for managing addresses
- Add, edit, delete, and set default address
- Responsive design (mobile, tablet, desktop)
- Form validation and error handling

**Cart Page Features:**
- View all saved addresses
- Select address via radio buttons
- Default address pre-selected
- Option to add new address inline
- Falls back to manual address input if no saved addresses



## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd OnlineFoodDeliverySystem
```

2. **Setup Backend**
```bash
cd server
npm install
# Configure .env with your MongoDB URI and JWT secret
node index.js
```

3. **Setup Frontend**
```bash
cd client
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000