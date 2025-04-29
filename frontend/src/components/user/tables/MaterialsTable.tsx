import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Box,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Material type definition
interface Material {
    id: number;
    name: string;
    density: number;
    heatCapacity: number;
    meltingTemperature: number;
}

// Mock data
const initialMaterials: Material[] = [
    { id: 1, name: 'PLA', density: 1.24, heatCapacity: 1800, meltingTemperature: 160 },
    { id: 2, name: 'ABS', density: 1.04, heatCapacity: 1470, meltingTemperature: 230 },
    { id: 3, name: 'PET', density: 1.38, heatCapacity: 1200, meltingTemperature: 250 },
];

interface MaterialFormData {
    id: number | null;
    name: string;
    density: string;
    heatCapacity: string;
    meltingTemperature: string;
}

const MaterialsTable: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<MaterialFormData>({
        id: null,
        name: '',
        density: '',
        heatCapacity: '',
        meltingTemperature: '',
    });
    const [isEdit, setIsEdit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateNumericInput = (value: string): boolean => {
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue > 0;
    };

    const handleClickOpen = () => {
        setOpen(true);
        setError(null);
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            id: null,
            name: '',
            density: '',
            heatCapacity: '',
            meltingTemperature: '',
        });
        setIsEdit(false);
        setError(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = (): boolean => {
        if (!formData.name) {
            setError('Пожалуйста, введите название материала');
            return false;
        }

        if (!validateNumericInput(formData.density)) {
            setError('Плотность должна быть положительным числом');
            return false;
        }

        if (!validateNumericInput(formData.heatCapacity)) {
            setError('Удельная теплоемкость должна быть положительным числом');
            return false;
        }

        if (!validateNumericInput(formData.meltingTemperature)) {
            setError('Температура плавления должна быть положительным числом');
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        if (isEdit) {
            // Update existing material
            setMaterials(
                materials.map((material) =>
                    material.id === formData.id
                        ? {
                            ...material,
                            name: formData.name,
                            density: parseFloat(formData.density),
                            heatCapacity: parseFloat(formData.heatCapacity),
                            meltingTemperature: parseFloat(formData.meltingTemperature),
                        }
                        : material
                )
            );
        } else {
            // Add new material
            const newMaterial: Material = {
                id: materials.length > 0 ? Math.max(...materials.map((m) => m.id)) + 1 : 1,
                name: formData.name,
                density: parseFloat(formData.density),
                heatCapacity: parseFloat(formData.heatCapacity),
                meltingTemperature: parseFloat(formData.meltingTemperature),
            };
            setMaterials([...materials, newMaterial]);
        }

        handleClose();
    };

    const handleEdit = (material: Material) => {
        setFormData({
            id: material.id,
            name: material.name,
            density: material.density.toString(),
            heatCapacity: material.heatCapacity.toString(),
            meltingTemperature: material.meltingTemperature.toString(),
        });
        setIsEdit(true);
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setMaterials(materials.filter((material) => material.id !== id));
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Материал</TableCell>
                            <TableCell>Плотность (кг/м³)</TableCell>
                            <TableCell>Удельная теплоемкость (Дж/кг·К)</TableCell>
                            <TableCell>Температура плавления (°C)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {materials.map((material) => (
                            <TableRow key={material.id}>
                                <TableCell component="th" scope="row">
                                    {material.id}
                                </TableCell>
                                <TableCell>{material.name}</TableCell>
                                <TableCell>{material.density}</TableCell>
                                <TableCell>{material.heatCapacity}</TableCell>
                                <TableCell>{material.meltingTemperature}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEdit ? 'Редактировать материал' : 'Добавить материал'}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Название материала"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        id="density"
                        name="density"
                        label="Плотность (кг/м³)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.density}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, step: "0.01" }}
                    />
                    <TextField
                        margin="dense"
                        id="heatCapacity"
                        name="heatCapacity"
                        label="Удельная теплоемкость (Дж/кг·К)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.heatCapacity}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, step: "1" }}
                    />
                    <TextField
                        margin="dense"
                        id="meltingTemperature"
                        name="meltingTemperature"
                        label="Температура плавления (°C)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.meltingTemperature}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, step: "0.1" }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MaterialsTable;