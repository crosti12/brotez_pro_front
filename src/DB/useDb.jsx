import { initDB } from "./db";

const useDb = () => {
  const updateLastUpdated = async (storeName) => {
    const db = await initDB();
    await db.put("lastUpdated", {
      collection: storeName,
      updatedAt: new Date().toISOString(),
    });
  };

  const saveItem = async (store, item) => {
    const db = await initDB();
    await db.put(store, item);
    await updateLastUpdated(store);
  };

  const getItem = async (store, id) => {
    const db = await initDB();
    return db.get(store, id);
  };

  const getAllItems = async (store) => {
    const db = await initDB();
    return db.getAll(store);
  };

  const deleteItem = async (store, id) => {
    const db = await initDB();
    await db.delete(store, id);
    await updateLastUpdated(store);
  };

  const clearCollection = async (storeName) => {
    const db = await initDB();
    await db.clear(storeName);
    await updateLastUpdated(storeName);
  };

  const saveCollection = async (storeName, items = []) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    await tx.store.clear();
    for (const item of items) {
      await tx.store.put(item);
    }
    await tx.done;
    await updateLastUpdated(storeName);
  };

  const getLastUpdated = async (storeName) => {
    const db = await initDB();
    return db.get("lastUpdated", storeName);
  };

  return {
    saveItem,
    getItem,
    getAllItems,
    deleteItem,
    clearCollection,
    saveCollection,
    getLastUpdated,
  };
};

export default useDb;
