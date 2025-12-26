import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <AppRoutes />
      </div>
    </>
  );
}

export default App;
