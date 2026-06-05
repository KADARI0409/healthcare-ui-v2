import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchPatients, deletePatient } from "../store/slices/patientSlice";
import { fetchDoctors } from "../store/slices/doctorSlice";
import PatientDetailModal from "./patients/PatientDetailModal";
import EditPatientModal from "./EditPatientModal";
import PatientPrescription from "./PatientPrescription";
import StatCard from "./StatCard";
import { Patient } from "../types/patient";

const PatientsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients, loading } = useAppSelector((state) => state.patients);
  const { doctors } = useAppSelector((state) => state.doctors);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [sortField, setSortField] = useState<keyof Patient>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [expandedComplaints, setExpandedComplaints] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.doctor?.doctorName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.complaints?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedGender !== "all") {
      filtered = filtered.filter((p) => p.sex === selectedGender);
    }

    if (dateRange.start) {
      filtered = filtered.filter((p) => p.visitDate >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter((p) => p.visitDate <= dateRange.end);
    }

    return filtered;
  }, [patients, searchTerm, selectedGender, dateRange]);

  // Sort patients
  const sortedPatients = useMemo(() => {
    const sorted = [...filteredPatients];
    sorted.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortField === "patientName") {
        aVal = a.patientName?.toLowerCase() || "";
        bVal = b.patientName?.toLowerCase() || "";
      } else if (sortField === "doctor") {
        aVal = a.doctor?.doctorName?.toLowerCase() || "";
        bVal = b.doctor?.doctorName?.toLowerCase() || "";
      } else if (sortField === "id") {
        aVal = a.id || 0;
        bVal = b.id || 0;
      } else {
        aVal = (a[sortField] as string | number) || "";
        bVal = (b[sortField] as string | number) || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPatients, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleComplaintExpand = (id: number) => {
    setExpandedComplaints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field: keyof Patient) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedPatients.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedPatients.map((p) => p.id!));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedRows.length} patients?`)) {
      for (const id of selectedRows) {
        await dispatch(deletePatient(id));
      }
      dispatch(fetchPatients());
      setSelectedRows([]);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this patient record?")) {
      await dispatch(deletePatient(id));
      dispatch(fetchPatients());
    }
  };

  const handleViewPrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionModal(true);
  };

  const handleViewDetails = async (patient: Patient) => {
    try {
      const { patientApi } = await import("../services/api");
      const resp = await patientApi.getPatientById(patient.id!);
      setSelectedPatient(resp.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Failed to fetch full patient details", err);
      setSelectedPatient(patient);
      setShowDetailModal(true);
    }
  };

  const getVitalStatus = (patient: Patient) => {
    const temp = patient.temperature || 98.6;
    const normalVitals = temp >= 97 && temp <= 99;
    return normalVitals ? "success" : "danger";
  };

  const getSortIcon = (field: keyof Patient) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const exportToCSV = () => {
    const allPatients = filteredPatients;

    if (allPatients.length === 0) {
      alert("No patient data to export!");
      return;
    }

    const headers = [
      "ID",
      "Patient Name",
      "Age",
      "Sex",
      "Visit Date",
      "Temperature (°F)",
      "Pulse Rate (bpm)",
      "BP Systolic",
      "BP Diastolic",
      "SpO2 (%)",
      "Complaints",
      "History",
      "On Examination",
      "Heart",
      "Lungs",
      "P/A",
      "P/R",
      "Doctor",
    ];

    const rows = allPatients.map((p) => [
      p.id || "",
      p.patientName || "",
      p.age || "",
      p.sex || "",
      p.visitDate || "",
      p.temperature || "",
      p.pr || "",
      p.bpSystolic || "",
      p.bpDiastolic || "",
      p.spo2 || "",
      p.complaints || "",
      p.history || "",
      p.onExamination || "",
      p.heart || "",
      p.lungs || "",
      p.p_a || "",
      p.p_r || "",
      p.doctor?.doctorName || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `patients_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Exported ${allPatients.length} patients successfully!`);
  };

  const exportToPDF = () => {
    const allPatients = filteredPatients;

    if (allPatients.length === 0) {
      alert("No patient data to export!");
      return;
    }

    const originalTitle = document.title;
    document.title = `Patients_List_${new Date().toISOString().split("T")[0]}`;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Patient Records - GBK'S HEALTH CARE</title>
        <style>
          body { 
            padding: 20px; 
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
          }
          .clinic-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #1e3c72;
            padding-bottom: 15px;
          }
          .clinic-header h2 {
            color: #1e3c72;
            margin-bottom: 5px;
          }
          .clinic-header p {
            margin: 3px 0;
            color: #666;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 8px;
            text-align: left;
          }
          td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #999;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            th {
              background: #1e3c72;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="clinic-header">
          <h2>🏥 GBK'S HEALTH CARE SPECIALITY CLINIC</h2>
          <p>Thomas Arcade, Anandbagh 'X' Road, Malakajiri, Hyderabad - 500 047</p>
          <p>📞 +91 9291627858 | ✉️ gbkdrkmc1995@gmail.com</p>
          <hr />
          <h4>Patient Records Report</h4>
          <p>Generated on: ${new Date().toLocaleString()} | Total Patients: ${allPatients.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Visit Date</th>
              <th>Temperature</th>
              <th>Pulse</th>
              <th>BP</th>
              <th>SpO2</th>
              <th>Complaints</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            ${allPatients
              .map(
                (patient) => `
              <tr>
                <td>${patient.id || ""}</td>
                <td>${patient.patientName || ""}</td>
                <td>${patient.age || ""}</td>
                <td>${patient.sex || ""}</td>
                <td>${patient.visitDate || ""}</td>
                <td>${patient.temperature ? `${patient.temperature}°F` : "-"}</td>
                <td>${patient.pr ? `${patient.pr} bpm` : "-"}</td>
                <td>${patient.bpSystolic && patient.bpDiastolic ? `${patient.bpSystolic}/${patient.bpDiastolic}` : "-"}</td>
                <td>${patient.spo2 ? `${patient.spo2}%` : "-"}</td>
                <td>${patient.complaints ? patient.complaints.substring(0, 50) : "-"}</td>
                <td>${patient.doctor?.doctorName || "N/A"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          <p>This is a computer-generated document. No signature required.</p>
          <p>GBK'S HEALTH CARE - Committed to Excellence in Eye Care & General Medicine</p>
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(tempDiv.innerHTML);
      printWindow.document.close();
      printWindow.onload = function () {
        printWindow.print();
        setTimeout(() => printWindow.close(), 500);
      };
    }
    document.title = originalTitle;
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div>
            <h1
              className="display-6 fw-bold mb-0"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📋 Patient Records
            </h1>
            <p className="text-muted mt-2">
              Manage and track all patient information
            </p>
          </div>
          <div className="mt-3 mt-md-0">
            <div className="d-flex gap-2">
              {selectedRows.length > 0 && (
                <button className="btn btn-danger" onClick={handleBulkDelete}>
                  🗑️ Delete Selected ({selectedRows.length})
                </button>
              )}
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  📊 Export
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={exportToCSV}>
                      📄 Export as CSV
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={exportToPDF}>
                      📑 Export as PDF
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <StatCard
            title="Total Patients"
            value={patients.length}
            icon="👥"
            cardClass="bg-gradient-primary"
            titleClass="text-white-50"
            valueClass="mb-0 text-white"
          />

          <StatCard
            title="This Month"
            value={
              patients.filter((p) =>
                p.visitDate?.startsWith(new Date().toISOString().slice(0, 7)),
              ).length
            }
            icon="📅"
            cardClass="bg-success"
          />

          <StatCard
            title="Male/Female"
            value={
              <>
                👨 {patients.filter((p) => p.sex === "Male").length} / 👩{" "}
                {patients.filter((p) => p.sex === "Female").length}
              </>
            }
            icon={null}
            cardClass="bg-info"
          />

          <StatCard
            title="Doctors"
            value={doctors.length}
            icon="👨‍⚕️"
            cardClass="bg-warning"
            titleClass="text-dark-50"
            valueClass="mb-0 text-dark"
          />
        </div>

        {/* Filters Card */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">🔍</span>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    placeholder="Search by name, doctor, or complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select bg-light border-0"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <option value="all">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="From Date"
                  value={dateRange.start}
                  onFocus={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.type = "date";
                  }}
                  onBlur={(e) => {
                    const t = e.target as HTMLInputElement;
                    if (!t.value) t.type = "text";
                  }}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="To Date"
                  value={dateRange.end}
                  onFocus={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.type = "date";
                  }}
                  onBlur={(e) => {
                    const t = e.target as HTMLInputElement;
                    if (!t.value) t.type = "text";
                  }}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-select bg-light border-0"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Table */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={
                          selectedRows.length === paginatedPatients.length &&
                          paginatedPatients.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th
                      style={{ width: "70px", cursor: "pointer" }}
                      onClick={() => handleSort("id")}
                    >
                      ID {getSortIcon("id")}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("patientName")}
                    >
                      Patient {getSortIcon("patientName")}
                    </th>
                    <th>Age/Sex</th>
                    <th>Visit Date</th>
                    <th>Vital Signs</th>
                    <th style={{ minWidth: "250px" }}>Complaints</th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("doctor")}
                    >
                      Doctor {getSortIcon("doctor")}
                    </th>
                    <th style={{ width: "160px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className={
                        selectedRows.includes(patient.id!)
                          ? "table-primary"
                          : ""
                      }
                    >
                      <td data-label="Select">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedRows.includes(patient.id!)}
                          onChange={() => handleSelectRow(patient.id!)}
                        />
                      </td>
                      <td data-label="ID" className="fw-bold">
                        #{patient.id}
                      </td>
                      <td data-label="Patient">
                        <strong>{patient.patientName}</strong>
                      </td>
                      <td data-label="Age/Sex">
                        {patient.age} yrs
                        <br />
                        <span className="badge bg-light text-dark">
                          {patient.sex}
                        </span>
                      </td>
                      <td data-label="Visit Date">
                        <div>{patient.visitDate}</div>
                        <small className="text-muted">
                          {new Date(patient.visitDate).toLocaleDateString(
                            "en-US",
                            { weekday: "short" },
                          )}
                        </small>
                      </td>
                      <td data-label="Vital Signs">
                        <div className="d-flex flex-wrap gap-1">
                          <span
                            className={`badge bg-${getVitalStatus(patient)}-subtle text-${getVitalStatus(patient)}`}
                          >
                            🌡️ {patient.temperature || "-"}°F
                          </span>
                          <span className="badge bg-info-subtle text-info">
                            ❤️ {patient.pr || "-"} bpm
                          </span>
                          <span className="badge bg-warning-subtle text-warning">
                            💓{" "}
                            {patient.bpSystolic && patient.bpDiastolic
                              ? `${patient.bpSystolic}/${patient.bpDiastolic}`
                              : "-"}
                          </span>
                          <span className="badge bg-success-subtle text-success">
                            🩸 SpO₂ {patient.spo2 || "-"}%
                          </span>
                        </div>
                      </td>
                      {/* Clinical summary column: preview + expandable full details */}
                      <td
                        data-label="Complaints"
                        style={{
                          maxWidth: "420px",
                          minWidth: "260px",
                          wordBreak: "break-word",
                        }}
                      >
                        {(() => {
                          const parts: { label: string; value?: string }[] = [
                            { label: "Complaints", value: patient.complaints },
                            { label: "History", value: patient.history },
                            {
                              label: "On Examination",
                              value: patient.onExamination,
                            },
                            { label: "Heart", value: patient.heart },
                            { label: "Lungs", value: patient.lungs },
                            { label: "P/A", value: patient.p_a },
                            { label: "P/R", value: patient.p_r },
                          ];

                          const nonEmpty = parts.filter(
                            (p) => p.value && p.value.trim() !== "",
                          );
                          if (nonEmpty.length === 0) return "-";

                          const preview = nonEmpty
                            .map((p) => p.value!.replace(/\s+/g, " "))
                            .join(" • ");

                          const isExpanded = !!expandedComplaints[patient.id!];
                          return (
                            <div>
                              {!isExpanded ? (
                                <div>
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {preview.length > 140
                                      ? preview.substring(0, 140) + "..."
                                      : preview}
                                  </div>
                                  {preview.length > 140 && (
                                    <button
                                      className="btn btn-link btn-sm p-0 ms-1"
                                      onClick={() =>
                                        toggleComplaintExpand(patient.id!)
                                      }
                                      style={{
                                        fontSize: "11px",
                                        textDecoration: "none",
                                        color: "#0d9488",
                                      }}
                                    >
                                      Read more
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div
                                  style={{ fontSize: "13px", lineHeight: 1.4 }}
                                >
                                  {nonEmpty.map((p) => (
                                    <div
                                      key={p.label}
                                      style={{ marginBottom: "6px" }}
                                    >
                                      <strong
                                        style={{
                                          display: "block",
                                          fontSize: "12px",
                                        }}
                                      >
                                        {p.label}:
                                      </strong>
                                      <div style={{ whiteSpace: "pre-wrap" }}>
                                        {p.value}
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    className="btn btn-link btn-sm p-0"
                                    onClick={() =>
                                      toggleComplaintExpand(patient.id!)
                                    }
                                    style={{
                                      fontSize: "11px",
                                      textDecoration: "none",
                                      color: "#0d9488",
                                    }}
                                  >
                                    Show less
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td data-label="Doctor">
                        <div className="d-flex align-items-center">
                          <div className="me-2">👨‍⚕️</div>
                          <div>
                            <strong>
                              {patient.doctor?.doctorName || "N/A"}
                            </strong>
                            {patient.doctor?.specialization && (
                              <div>
                                <small className="text-muted">
                                  {patient.doctor?.specialization}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="Actions">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewDetails(patient)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowEditModal(true);
                            }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleViewPrescription(patient)}
                            title="View Prescription"
                          >
                            📄
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(patient.id!)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <div className="text-muted small">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, sortedPatients.length)}{" "}
                  of {sortedPatients.length} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(1)}
                      >
                        «
                      </button>
                    </li>
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        ‹
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        ›
                      </button>
                    </li>
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        »
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setShowDetailModal(false)}
          onEdit={(p) => {
            setShowDetailModal(false);
            setSelectedPatient(p);
            setShowEditModal(true);
          }}
        />
      )}

      {showEditModal && selectedPatient && (
        <EditPatientModal
          patient={selectedPatient}
          onClose={() => setShowEditModal(false)}
          onUpdated={(p) => {
            setSelectedPatient(p);
            setShowEditModal(false);
          }}
        />
      )}

      {showPrescriptionModal && selectedPatient && (
        <PatientPrescription
          patient={selectedPatient}
          onClose={() => setShowPrescriptionModal(false)}
        />
      )}
    </>
  );
};

export default PatientsList;
