import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { searchFaculty, getFacultySchedule, getDepartments, getSepcifications } from "../api";

const FacultyFinder = () => {
    const [filters, setFilters] = useState({ name: "", department: "", specialization: "" });
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const detailsRef = useRef(null);

    useEffect(() => {
        const fetchFilters = async () => {
            setDepartments(await getDepartments());
            setSpecializations(await getSepcifications());
        };
        fetchFilters();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setFacultyList([]);
        setSelectedFaculty(null);
        setSchedule(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        const finalFilter = {...filters, name: filters.name.trim()};
        setFilters({...finalFilter});
        console.log(finalFilter);
        const results = await searchFaculty(finalFilter);
        setFacultyList(results);
        setLoading(false);
    };

    const clearFilters = () => {
        setFilters({ name: "", department: "", specialization: "" });
        setFacultyList([]);
        setSelectedFaculty(null);
        setSchedule(null);
    };

    const handleFacultyClick = async (faculty) => {
        setLoadingDetails(true);
        setSelectedFaculty(faculty);
        const scheduleData = await getFacultySchedule(faculty.emp_id);
        setSchedule(scheduleData);
        setLoadingDetails(false);
        
        setTimeout(() => {
            detailsRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 300);
    };

    const highlightText = (text, highlight) => {
        if (!highlight) return text;
        const regex = new RegExp(`(${highlight})`, "gi");
        return text.split(regex).map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <span key={index} style={{ color: "yellow", fontWeight: "bold" }}>
                    {part}
                </span>
            ) : (
                part
            )
        );
    };
      
    return (
        <div className="faculty-container">
            <h2>Find Faculty</h2>
            <div className="search-box">
                <input type="text" name="name" placeholder="Faculty Name" value={filters.name} onChange={handleChange} onKeyDown={handleKeyDown}/>

                <select name="department" value={filters.department} onChange={handleChange} onKeyDown={handleKeyDown}>
                    <option value="" disabled hidden>Select Department</option>
                    {(() => {
                        try {
                            return departments.map((dept) => (
                                <option key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</option>
                            ));
                        } catch (error) {
                            console.error("Error rendering department options:", error);
                            return <option value="" disabled>No departments Here</option>;
                        }
                    })()}
                </select>

                <select name="specialization" value={filters.specialization} onChange={handleChange} onKeyDown={handleKeyDown}>
                    <option value="" disabled hidden>Select Specialization</option>
                    {(() => {
                        try{
                            return specializations.map((spec, index) => (
                                <option key={index} value={spec.name}>{spec.name}</option>
                            ));
                        } catch (error) {
                            console.error("Error rendering specification options:", error);
                            return <option value="" disabled>No Specification Here</option>;
                        }
                    })()} 
                </select>

                <button onClick={handleSearch}>Search</button>
                <button onClick={clearFilters} className="clear-btn">Clear</button>
            </div>

            {loading && <p className="loading-text">Loading...</p>}

            <div className="faculty-list">
                {facultyList.map((faculty, index) => (
                    <motion.div
                        key={faculty.emp_id}
                        className="faculty-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFacultyClick(faculty)}
                    >
                        <h3>{highlightText(faculty.emp_name, filters.name)}</h3>
                        <p>{faculty.emp_spec}</p>
                    </motion.div>
                ))}
            </div>

            {selectedFaculty && (
                <motion.div 
                    ref={detailsRef}
                    className="faculty-details"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {loadingDetails ? (
                        <p className="loading-text">Loading details...</p>
                    ) : (
                        <>
                            <h3 className="name">{selectedFaculty.emp_name} </h3>
                            <div className="faculty-details-content">
                                <table className="faculty-table">
                                    <tbody>
                                        <tr>
                                            <td className="left-cell">Department</td>
                                            <td className="center-cell">:</td>
                                            <td className="right-cell">{selectedFaculty.dept_name}</td>
                                        </tr>
                                        <tr>
                                            <td className="left-cell">Designation</td>
                                            <td className="center-cell">:</td>
                                            <td className="right-cell">{selectedFaculty.emp_spec}</td>
                                        </tr>
                                        <tr>
                                            <td className="left-cell">Contact</td>
                                            <td className="center-cell">:</td>
                                            <td className="right-cell">
                                                <a href={`tel:${selectedFaculty.emp_ph}`}>{selectedFaculty.emp_ph}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="left-cell">E-mail</td>
                                            <td className="center-cell">:</td>
                                            <td className="right-cell">
                                                <a href={`mailto:${selectedFaculty.emp_email}`}>{selectedFaculty.emp_email}</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="statusBox">
                                <h4>Schedule As,</h4>
                                <p className="status">{schedule?.message ? schedule.message : `${schedule?.time} in ${schedule?.venue}`}</p>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default FacultyFinder;
