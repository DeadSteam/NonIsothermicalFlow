import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import MaterialsComparisonTable from './MaterialsComparisonTable';
import MaterialsUnifiedTable from './MaterialsUnifiedTable';

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
      id={`materials-tabpanel-${index}`}
      aria-labelledby={`materials-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `materials-tab-${index}`,
    'aria-controls': `materials-tabpanel-${index}`,
  };
}

const MaterialsComparison: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Сравнение материалов
        </Typography>
        <Typography variant="body1" paragraph>
          На этой странице вы можете сравнить свойства и коэффициенты различных материалов. 
          Просмотрите данные в разных представлениях, используя табы ниже.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={value} onChange={handleChange} aria-label="материалы табы">
            <Tab label="Объединенная таблица" {...a11yProps(0)} />
            <Tab label="Раздельные таблицы" {...a11yProps(1)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <MaterialsUnifiedTable />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MaterialsComparisonTable />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MaterialsComparison; 