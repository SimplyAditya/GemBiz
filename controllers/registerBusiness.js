import { collection, getDocs } from "firebase/firestore";
import db from "../db.js";

export const fetchAllRegisterBusiness = async (req, res) => {
  try {
    const allRegisterBusiness = await getDocs(collection(db, "bregisterbusiness"));

    const businesses = allRegisterBusiness.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error fetching all registered businesses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
