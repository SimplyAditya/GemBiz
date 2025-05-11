import { collection, getDocs, query, where } from "firebase/firestore";
import db from "../db.js";

export const fetchSummaryCounts = async (req, res) => {
  try {
    const allBusinessCatalogues = await getDocs(collection(db, "bbusinesscatalogue"));
    const pendingBusinessCatalogues = await getDocs(
      query(collection(db, "bbusinesscatalogue"), where("itemStatus", "==", "pending"))
    );

    const allRegisterBusiness = await getDocs(collection(db, "bregisterbusiness"));
    const pendingRegisterBusiness = await getDocs(
      query(collection(db, "bregisterbusiness"), where("storeverified", "==", false))
    );

    const allBusinessCategories = await getDocs(collection(db, "businesscategories"));
    const pendingBusinessCategories = await getDocs(
      query(collection(db, "businesscategories"), where("status", "==", "pending"))
    );

    const summary = {
      bbusinesscatalogue: {
        total: allBusinessCatalogues.size,
        pending: pendingBusinessCatalogues.size,
      },
      bregisterbusiness: {
        total: allRegisterBusiness.size,
        pending: pendingRegisterBusiness.size,
      },
      businesscategories: {
        total: allBusinessCategories.size,
        pending: pendingBusinessCategories.size,
      },
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching summary counts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
