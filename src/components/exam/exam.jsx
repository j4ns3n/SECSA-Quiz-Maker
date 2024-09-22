import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import AddBoxIcon from '@mui/icons-material/AddBox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateExam from './createExam';
import ViewExam from './viewExam';
import { ExamContextProvider } from '../../context/ExamContext/ExamContext';

// Custom styled Paper with hover effect
const DemoPaper = styled(Paper)(({ theme }) => ({
    width: 140,
    height: 140,
    padding: theme.spacing(2),
    ...theme.typography.body2,
    textAlign: 'center',
    paddingTop: '40px',
    boxShadow: '5px 5px 10px -5px',
    cursor: 'pointer',
    transition: 'transform 0.2s, background-color 0.3s',
    '&:hover': {
        transform: 'scale(1.05)',
        backgroundColor: theme.palette.grey[300],
    },
}));

const Exam = () => {
    const [activeComponent, setActiveComponent] = useState(null);

    const handleClick = (component) => {
        setActiveComponent(component);
    };

    const handleBackClick = () => {
        setActiveComponent(null);
    };

    return (
        <div>
            <br /><br />
            {!activeComponent && (
                <Stack direction="row" spacing={5}>
                    <DemoPaper
                        variant="outlined"
                        onClick={() => handleClick('create')}
                    >
                        <AddBoxIcon /><br />Create Exam
                    </DemoPaper>
                    <DemoPaper
                        variant="outlined"
                        onClick={() => handleClick('view')}
                    >
                        <VisibilityIcon /><br />View Exam
                    </DemoPaper>
                </Stack>
            )}
            {activeComponent && (
                <div>
                    <Button
                        variant="outlined"
                        onClick={handleBackClick}
                        style={{ marginBottom: '20px' }}
                    >
                        Back
                    </Button>
                    {activeComponent === 'create' && <CreateExam />}
                    {activeComponent === 'view' && <ExamContextProvider><ViewExam /></ExamContextProvider>}
                </div>
            )}
        </div>
    );
}

export default Exam;
