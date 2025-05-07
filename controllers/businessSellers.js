import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "../db.js";

export const fetchBusinessSellers = async (req, res) => {
  try {
    const businessSellers = await getDocs(
      query(
        collection(db, "bregisterbusiness"),
        where("storeverified", "==", false)
      )
    );

    const sellers = businessSellers.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(sellers);
  } catch (error) {
    console.error("Error fetching pending business sellers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approveBusinessSeller = async (req, res) => {
  const { id } = req.body;

  try {
    const businessSellerRef = doc(db, "bregisterbusiness", id);
    await updateDoc(businessSellerRef, { storeverified: true });

    res.status(200).json({ message: "Business seller approved successfully" });
  } catch (error) {
    console.error("Error approving business seller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
