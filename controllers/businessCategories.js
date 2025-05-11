import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import db from "../db.js";

export const fetchAllBusinessCategories = async (req, res) => {
  try {
    const allBusinessCategories = await getDocs(collection(db, "businesscategories"));

    const categories = allBusinessCategories.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching all business categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchPendingBusinessCategories = async (req, res) => {
  try {
    const pendingBusinessCategories = await getDocs(
      query(
        collection(db, "businesscategories"),
        where("status", "==", "pending")
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

export const approveBusinessCategory = async (req, res) => {
    const { id } = req.body;
    
    try {
        const businessCategoryRef = doc(db, "businesscategories", id);
        await updateDoc(businessCategoryRef, { status: "accepted" });
    
        res.status(200).json({ message: "Business category approved successfully" });
    } catch (error) {
        console.error("Error approving business category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    }
