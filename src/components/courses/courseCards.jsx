import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Box,
  CardActionArea,
  CardMedia,
} from '@mui/material';

const CourseCards = ({ courses, onView  }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={5} columns={24}>
        {courses && courses.map((course, index) => (
          <Grid item xs={8} key={index}>
            <Card sx={{ maxWidth: 345, padding: '10px' }}>
              <CardActionArea>
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
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '17px' }}>
                    {course.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button size="small" color="primary" variant="outlined" onClick={() => onView(course)}>
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Export named components
export default CourseCards
