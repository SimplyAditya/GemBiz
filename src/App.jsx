import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import Navbar
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

function App() {
  return (
    <div className="App">
      <Navbar /> {/* Render the Navbar */}
      <ProtectedRoute>
        {/* This Outlet will render the matched child route component (Home, ProductList, ProductDetail, CartPage) */}
        <Outlet />
      </ProtectedRoute>
    </div>
  );
}

export default App;
