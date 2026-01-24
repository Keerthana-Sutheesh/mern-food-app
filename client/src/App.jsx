import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="bg-white dark:bg-[#0f1419] text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
