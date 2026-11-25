# CRAVE.

![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_56-000020?logo=expo&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r128_in_a_WebView-000000?logo=threedotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-raw_SQL-4169E1?logo=postgresql&logoColor=white)

A food ordering app: sign up, browse the menu, fill a cart, check out, and watch a courier ride to you on a 3D city map. Built with a friend, who wrote the backend; I made the app. The design is high-contrast and editorial: ink black, alabaster, and one terracotta accent (`#C45D4A`).

## What it does

- **Checkout that can't half-happen.** The order and its line items are written in one Postgres transaction (`BEGIN` / `COMMIT` / `ROLLBACK`) on a dedicated pooled client, so a failure leaves no half-written order.
- **History in one query.** Order history and order details come back from a single query with `json_agg` and `json_build_object`, not one query per order.
- **Prices frozen at purchase.** Each line stores `price_at_purchase`, so a later menu price change doesn't rewrite your history.
- **3D delivery map.** A low-poly city in Three.js inside a WebView. The courier follows the shortest path on the road grid (Dijkstra), the HUD shows distance, speed and ETA, and arrival marks the order delivered in the database. The ride is simulated: there is no real GPS.
- **Cart and menu.** Steppers, swipe to delete, skeleton loading cards, and a menu cached for 5 minutes on both the server and the phone, with pull to refresh.
- **State split by concern.** Auth, cart and menu each have their own React context, so a cart change doesn't re-render the menu.

## Stack

- App: Expo Router, React Native, Reanimated, gesture handler, `react-native-webview`
- API: Node.js and Express 5 in one file (`backend/server.js`), `pg` pool, bcrypt, JWT (7 days)
- Database: PostgreSQL with 4 tables (`backend/schema.sql`), hosted on Supabase; API on Render

## Run it

```bash
git clone https://github.com/ukasha167/CRAVE..git
cd CRAVE./backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres
JWT_SECRET=your_secret
PORT=3000
```

Load `backend/schema.sql` into your database, add a few rows to `food_items`, then `npm start`.

```bash
cd ../frontend
npm install
npx expo start -c
```

The app points at the hosted API. To use your own, change `API_URL` in `frontend/src/constants/api.ts`.

## Not done yet

- Tests, and a CI job to run them
- Rate limiting on the API

## Licence

MIT.
