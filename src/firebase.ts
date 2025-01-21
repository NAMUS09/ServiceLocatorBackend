import admin, { ServiceAccount } from "firebase-admin";

// Initialize Firebase Admin SDK
import serviceAccount from "./service-locator.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: "https://service-locator-68be9-default-rtdb.firebaseio.com",
});

const db = admin.database();

export default db;
