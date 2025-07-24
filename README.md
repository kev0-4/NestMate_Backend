
# 🏡 NestMate API Documentation

**Find Your Perfect Flatmate — Swipe. Match. Move In.**
[NestMate v0 Powered Frontend (NextJS) →] (https://nestm.vercel.app)
[NestMate Frontend Repo →](https://github.com/kev0-4/Nestmate-Frontend)


## 📌 About

**NestMate:** Find Your Flatmate  NestMate is a new flatmate-finding platform, designed to help users hook up with the perfect flatmate through a smart swipe-based system. Think of Tinder, but one that matches you up with your next perfect flatmate!


## ✨ Features

* 🔍 **Smart Matching** — Lifestyle, budget, and location-based matching algorithm
* 👥 **Swipe Interface** — Like/dislike potential flatmates effortlessly
* ✅ **Verified Profiles** — Background + social link verification
* 🏘️ **Room Listings** — Post, browse, and filter available rooms
* 💬 **Real-Time Chat** — Message matches instantly
* ⭐ **Review System** — Review past flatmates
* 📍 **Location-Based Search** — Find people in your desired area



## 🛠️ Tech Stack

### Backend

* **Node.js**
* **Hono.js** (Minimal web framework)
* **MongoDB** + **Prisma**

### Cloud

* **Cloudflare Workers**
* **MongoDB Atlas**



## 🚀 Local API Base URL

```
http://127.0.0.1:8787
```

> 🧪 Postman collections for testing are available in the `PostmanCollections` folder.

---

<details>
<summary><strong>📡 API Endpoints</strong> (Click to expand)</summary>

### 🔗 Matches

| Method | Endpoint            | Description                          |
| ------ | ------------------- | ------------------------------------ |
| `POST` | `/matches`          | Create a match between two users     |
| `GET`  | `/matches`          | Paginated matches for logged-in user |
| `GET`  | `/matches/:matchId` | Retrieve a match by ID               |
| `PUT`  | `/matches/:matchId` | Update status of a match             |
| `POST` | `/matches/filter`   | Filter matches based on preferences  |

---

### 🚩 Reports

| Method | Endpoint   | Description                  |
| ------ | ---------- | ---------------------------- |
| `POST` | `/reports` | Report a user for misconduct |

---

### 🏠 Rooms

| Method   | Endpoint                         | Description               |
| -------- | -------------------------------- | ------------------------- |
| `POST`   | `/rooms`                         | Create a new room listing |
| `GET`    | `/rooms`                         | Fetch paginated rooms     |
| `GET`    | `/rooms/:roomId`                 | Get details of a room     |
| `PUT`    | `/rooms/:roomId`                 | Update room details       |
| `DELETE` | `/rooms/:roomId`                 | Delete a room             |
| `POST`   | `/rooms/:roomId/photos`          | Upload room photos        |
| `DELETE` | `/rooms/:roomId/photos/:photoId` | Delete a room photo       |

---

### 👤 Users

| Method   | Endpoint                         | Description             |
| -------- | -------------------------------- | ----------------------- |
| `GET`    | `/users/:userId`                 | Get user profile        |
| `PUT`    | `/users/:userId`                 | Update user profile     |
| `DELETE` | `/users/:userId`                 | Delete user account     |
| `POST`   | `/users/:userId/profile-picture` | Upload profile picture  |
| `PUT`    | `/users/:userId/preferences`     | Update user preferences |
| `GET`    | `/users/:userId/preferences`     | Get user preferences    |

</details>

---

<details>
<summary><strong>📦 Zod Schemas</strong> (Validation)</summary>

### 📍 Matches

```ts
matchSchema: z.object({
  userId1: z.string(),
  userId2: z.string()
})

updateMatchStatusSchema: z.object({
  status: z.enum(["pending", "accepted", "rejected"])
})
```

---

### 🚩 Reports

```ts
reportSchema: z.object({
  reportedUserId: z.string(),
  reason: z.string().min(1).max(500)
})
```

---

### 🏠 Rooms

```ts
createRoomSchema: z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  subLocality: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  rent: z.number().positive(),
  roomType: z.string(),
  amenities: z.string(),
  photosUrl: z.array(z.string()),
  availableFrom: z.string().transform((str) => new Date(str)),
})
```

---

### 👤 Users

```ts
updateUserSchema: z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  dob: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
  socialMediaLinks: z.string().optional(),
  preferences: z.record(z.unknown()).optional()
})
```

</details>

---

## 🧪 Testing

Use the Postman collection located in `/PostmanCollections` to test all available routes with pre-configured headers and request bodies.

