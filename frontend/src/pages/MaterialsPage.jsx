import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MaterialList from '../components/MaterialList';
import MaterialForm from '../components/MaterialForm';

const MaterialsPage = () => {
    return (
        <Routes>
            <Route path="/" element={<MaterialList />} />
            <Route path="/add" element={<MaterialForm />} />
            <Route path="/edit/:id" element={<MaterialForm />} />
        </Routes>
    );
};

export default MaterialsPage;