const API_URL = 'http://localhost:8080/api/materials';

const MaterialService = {
    getAllMaterials: async () => {
        const response = await fetch(API_URL);
        return response.json();
    },

    getMaterialById: async (id) => {
        const response = await fetch(`${API_URL}/${id}`);
        return response.json();
    },

    createMaterial: async (material) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(material),
        });
        return response.json();
    },

    updateMaterial: async (id, material) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(material),
        });
        return response.json();
    },

    deleteMaterial: async (id) => {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
    },
};

export default MaterialService;