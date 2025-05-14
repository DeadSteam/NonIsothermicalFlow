import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import MaterialsTable from './tables/MaterialsTable';
import PropertiesTable from './PropertiesTable';
import CoefficientsTable from './CoefficientsTable';
import DatabaseBackupPanel from './DatabaseBackupPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1a237e', mb: 4 }}>
          Панель администратора
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange}
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 500,
                color: '#666',
                '&.Mui-selected': {
                  color: '#3f51b5'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#3f51b5'
              }
            }}
          >
            <Tab label="Материалы" />
            <Tab label="Свойства" />
            <Tab label="Коэффициенты" />
            <Tab label="Резервные копии БД" />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <MaterialsTable />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PropertiesTable />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <CoefficientsTable />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <DatabaseBackupPanel />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminPanel; 