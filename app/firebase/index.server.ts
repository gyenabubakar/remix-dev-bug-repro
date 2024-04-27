import admin, { credential } from "firebase-admin";

export const app = admin.initializeApp({
  credential: process.env["GOOGLE_APPLICATION_CREDENTIALS"]
    ? credential.cert(process.env["GOOGLE_APPLICATION_CREDENTIALS"])
    : credential.applicationDefault(),
  projectId: process.env["FIREBASE_PROJECT_ID"],
});

export const fbOrganizations = app.firestore().collection("orgs");
export const fbOrders = app.firestore().collection("orders");
export const fbProducts = app.firestore().collection("products");

export async function orgWithIdExists(orgId: string) {
  const org = await fbOrganizations.doc(orgId).get();
  return org.exists;
}
