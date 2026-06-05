import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientForm from "./components/PatientForm";
import PatientsList from "./components/PatientsList";
// @ts-ignore: side-effect import of CSS without type declarations
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  //const location = useLocation();

  return (
    <div className="clinic-background" style={{ minHeight: "100vh" }}>
      {/* Clinic Header */}
      <div
        className="container-fluid"
        style={{
          background: "linear-gradient(135deg, #2a9866 0%, #2a9866 100%)",
          color: "white",
          padding: "15px 0",
          borderBottom: "3px solid #c9a03d",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <h1
                className="display-6 fw-bold mb-0"
                style={{ fontFamily: "Georgia, serif" }}
              >
                🏥 GBK'S HEALTH CARE
              </h1>
              <p
                className="mb-0 mt-2"
                style={{ fontSize: "12px", opacity: 0.9 }}
              >
                <span>
                  📍 Thomas Arcade, Anandbagh 'X' Road, Malakajiri, Hyderabad -
                  500 047
                </span>
              </p>
              <p className="mb-0" style={{ fontSize: "11px", opacity: 0.8 }}>
                📞 +91 9291627858 | ✉️ gbkdrkmc1995@gmail.com
              </p>
            </div>
            <div className="col-md-5 text-end">
              <div className="d-flex gap-2 justify-content-end flex-wrap">
                <Link
                  to="/"
                  className="btn btn-outline-light px-4"
                  style={{ borderRadius: "25px", borderWidth: "2px" }}
                >
                  🏥 Register Patient
                </Link>
                <Link
                  to="/patients"
                  className="btn btn-light px-4"
                  style={{
                    borderRadius: "25px",
                    color: "#1e3c72",
                    fontWeight: "500",
                  }}
                >
                  📋 Patient Records
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="py-4">
        <Routes>
          <Route path="/" element={<PatientForm />} />
          <Route path="/patients" element={<PatientsList />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer
        className="container-fluid mt-5"
        style={{
          background: "#1e3c72",
          color: "white",
          padding: "15px 0",
          fontSize: "11px",
        }}
      >
        <div className="container text-center">
          <p className="mb-0">
            GBK'S HEALTH CARE SPECIALITY CLINIC - Committed to Excellence in Eye
            Care & General Medicine
          </p>
          <p className="mb-0 mt-1 opacity-75">
            Sri R.K Medical & General Stores | Reg. No. 43997 20355
          </p>
        </div>
      </footer>
    </div>
  );
}

// Wrap with Router
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
