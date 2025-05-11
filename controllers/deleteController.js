import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { auth } from "../db.js";
import db from "../db.js";

export const deleteAdmin = async (req, res) => {
  const { id } = req.body;
  try {
    await deleteDoc(doc(db, "admin", id));
    // Delete from Firebase Authentication
    const user = auth.currentUser;
    if (user && user.uid === id) {
      await deleteUser(user);
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.body;
  try {
    await deleteDoc(doc(db, "businesscategories", id));
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSeller = async (req, res) => {
  const { id } = req.body;
  try {
    await deleteDoc(doc(db, "bregisterbusiness", id));

    const cataloguesQuery = query(
      collection(db, "bbusinesscatalogue"),
      where("uid", "==", id)
    );
    const cataloguesSnapshot = await getDocs(cataloguesQuery);
    const deletePromises = cataloguesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    const user = auth.currentUser;
    if (user && user.uid === id) {
      await deleteUser(user);
    }

    res.status(200).json({ message: "Seller and associated catalogues deleted successfully" });
  } catch (error) {
    console.error("Error deleting seller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCatalogue = async (req, res) => {
  const { id } = req.body;
  try {
    await deleteDoc(doc(db, "bbusinesscatalogue", id));
    res.status(200).json({ message: "Catalogue deleted successfully" });
  } catch (error) {
    console.error("Error deleting catalogue:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
