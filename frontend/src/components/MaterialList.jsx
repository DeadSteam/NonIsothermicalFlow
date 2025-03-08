import React, { useEffect, useState } from 'react';
import MaterialService from '../services/MaterialService';
import { Link } from 'react-router-dom';

const MaterialList = () => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const data = await MaterialService.getAllMaterials();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await MaterialService.deleteMaterial(id);
            fetchMaterials(); // Обновляем список после удаления
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    return (
        <div>
            <h2>Materials</h2>
            <Link to="/materials/add">Add New Material</Link>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Chemical Composition</th>
                    <th>Material Type</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {materials.map((material) => (
                    <tr key={material.idMaterial}>
                        <td>{material.idMaterial}</td>
                        <td>{material.name}</td>
                        <td>{material.chemicalComposition}</td>
                        <td>{material.materialType}</td>
                        <td>
                            <Link to={`/materials/edit/${material.idMaterial}`}>Edit</Link>
                            <button onClick={() => handleDelete(material.idMaterial)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default MaterialList;