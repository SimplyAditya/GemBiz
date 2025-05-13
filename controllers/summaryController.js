import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import db from "../db.js";

let wssInstance = null;

export const setWssInstance = (wss) => {
  wssInstance = wss;
};

const calculateSummary = (cataloguesSnap, businessSnap, categoriesSnap) => {
  const pendingCatalogues = cataloguesSnap.docs.filter(doc => doc.data().itemStatus === "pending").length;
  const pendingBusiness = businessSnap.docs.filter(doc => doc.data().storeverified === false).length;
  const pendingCategories = categoriesSnap.docs.filter(doc => doc.data().status === "pending").length;

  return {
    bbusinesscatalogue: {
      total: cataloguesSnap.size,
      pending: pendingCatalogues,
    },
    bregisterbusiness: {
      total: businessSnap.size,
      pending: pendingBusiness,
    },
    businesscategories: {
      total: categoriesSnap.size,
      pending: pendingCategories,
    },
  };
};

const broadcastSummary = (summary) => {
  if (wssInstance) {
    wssInstance.clients.forEach((client) => {
      if (client.readyState === client.OPEN) { // Check if client.OPEN is the correct constant
        client.send(JSON.stringify({ type: "summary", data: summary }));
      }
    });
  }
};

export const getSummaryData = async () => {
  // This function can still be used for the initial HTTP GET request if needed,
  // or for the first data push on WebSocket connection.
  const cataloguesSnap = await getDocs(collection(db, "bbusinesscatalogue"));
  const businessSnap = await getDocs(collection(db, "bregisterbusiness"));
  const categoriesSnap = await getDocs(collection(db, "businesscategories"));
  
  return calculateSummary(cataloguesSnap, businessSnap, categoriesSnap);
};


export const listenForSummaryChanges = () => {
  const collectionsToWatch = [
    "bbusinesscatalogue",
    "bregisterbusiness",
    "businesscategories",
  ];

  collectionsToWatch.forEach(collName => {
    onSnapshot(collection(db, collName), async () => {
      console.log(`Change detected in ${collName}. Recalculating summary.`);
      try {
        const summary = await getSummaryData();
        broadcastSummary(summary);
      } catch (error) {
        console.error(`Error recalculating or broadcasting summary after change in ${collName}:`, error);
      }
    }, (error) => {
      console.error(`Error listening to ${collName}:`, error);
    });
  });
  console.log("Firebase listeners set up for summary counts.");
};


export const fetchSummaryCounts = async (req, res) => {
  try {
    const summary = await getSummaryData();
    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching summary counts via HTTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
