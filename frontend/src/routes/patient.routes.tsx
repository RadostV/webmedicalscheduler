import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Appointments from '../pages/patient/Appointments';
import SearchDoctors from '../pages/patient/SearchDoctors';

const PatientRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/search-doctors" element={<SearchDoctors />} />
    </Routes>
  );
};

export default PatientRoutes;
