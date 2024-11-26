import * as React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Box,
  CardActionArea,
  CardMedia,
} from '@mui/material';
import CourseTable from './courseTable'; // Assuming you have CourseTable component
import { useCoursesContext } from '../../hooks/useCourseContext';
import { useEffect } from "react";

const CourseCards = () => {
  const [selectedCourse, setSelectedCourse] = React.useState(null); // Track selected course

  const { courses, dispatch } = useCoursesContext();

  useEffect(() => {
    const fetchCourse = async () => {
      const response = await fetch('/api/courses');
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_COURSES', payload: json });
      }
    };

    fetchCourse();
  }, [dispatch]);

  const handleViewDetails = (course) => {
    setSelectedCourse(course); // Set the selected course
  };

  const handleBack = () => {
    const fetchCourse = async () => {
      const response = await fetch('/api/courses');
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_COURSES', payload: json });
      }
    };

    fetchCourse();
    setSelectedCourse(null); // Go back to the course list
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {selectedCourse ? (
        <CourseTable course={selectedCourse} onBack={handleBack} />
      ) : (
        <Grid container spacing={5} columns={24}>
          {courses &&
            courses.map((course, index) => (
              <Grid item xs={8} key={index}>
                <Card sx={{ maxWidth: 345, padding: '10px' }}>
                  <CardActionArea
                    onClick={() => handleViewDetails(course)}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 140,
                        backgroundColor: () => {
                          switch (course.courseName) {
                            case 'BSIT':
                              return '#174D71'; // Blue
                            case 'BSCE':
                              return '#E05707'; // Orange
                            case 'BSME':
                              return '#820000'; // Red
                            case 'BSEE':
                              return '#FFA800'; // Yellow
                            case 'BSARCH':
                              return '#36007B'; // Purple
                            default:
                              return '#E0E0E0'; // Default grey
                          }
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        <h3>{course.courseName}</h3>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: '17px' }}
                      >
                        {course.desc}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
};

export default CourseCards;
