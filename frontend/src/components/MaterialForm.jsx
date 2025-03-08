import React, { useState, useEffect } from 'react';
import MaterialService from '../services/MaterialService';
import { useNavigate, useParams } from 'react-router-dom';

const MaterialForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState({
        name: '',
        chemicalComposition: '',
        materialType: '',
    });

    useEffect(() => {
        if (id) {
            fetchMaterial();
        }
    }, [id]);

    const fetchMaterial = async () => {
        try {
            const data = await MaterialService.getMaterialById(id);
            setMaterial(data);
        } catch (error) {
            console.error('Error fetching material:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMaterial({ ...material, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await MaterialService.updateMaterial(id, material);
            } else {
                await MaterialService.createMaterial(material);
            }
            navigate('/materials');
        } catch (error) {
            console.error('Error saving material:', error);
        }
    };

    return (
        <div>
            <h2>{id ? 'Edit Material' : 'Add Material'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={material.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Chemical Composition:</label>
                    <input
                        type="text"
                        name="chemicalComposition"
                        value={material.chemicalComposition}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Material Type:</label>
                    <input
                        type="text"
                        name="materialType"
                        value={material.materialType}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Save</button>
                <button type="button" onClick={() => navigate('/materials')}>Cancel</button>
            </form>
        </div>
    );
};

export default MaterialForm;