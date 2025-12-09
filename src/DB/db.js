import { openDB } from "idb";

export const initDB = async () => {
  return openDB("brotez_local_db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "_id" });
      }
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "_id" });
      }
      if (!db.objectStoreNames.contains("lastUpdated")) {
        db.createObjectStore("lastUpdated", { keyPath: "collection" });
      }
    },
  });
};
