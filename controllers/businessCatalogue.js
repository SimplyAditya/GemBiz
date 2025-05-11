import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "../db.js";

export const fetchAllBusinessCatalogue = async (req, res) => {
  try {
    const allBusinessCatalogues = await getDocs(collection(db, "bbusinesscatalogue"));

    const catalogues = allBusinessCatalogues.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(catalogues);
  } catch (error) {
    console.error("Error fetching all business catalogues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchPendingBusinessCatalogues = async (req, res) => {
  try {
    const pendingBusinessCategories = await getDocs(
      query(
        collection(db, "bbusinesscatalogue"),
        where("itemStatus", "==", "pending")
      )
    );

    const categories = pendingBusinessCategories.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching pending business categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approveBusinessCatalogue = async (req, res) => {
  const { id } = req.body;

  try {
    const businessCategoryRef = doc(db, "bbusinesscatalogue", id);
    await updateDoc(businessCategoryRef, { itemStatus: "accepted" });

    res
      .status(200)
      .json({ message: "Business category approved successfully" });
  } catch (error) {
    console.error("Error approving business category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
