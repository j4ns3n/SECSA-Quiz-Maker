import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Teacher from '../../assets/teacher.png'
import Exam from '../../assets/exam.png'
import Program from '../../assets/program.png'

const Overview = () => {
  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [course, setCourse] = useState([]);
  const [exams, setExams] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchExam();
    fetchCourse();
  }, []);


  const fetchCourse = async () => {
    const response = await fetch('/api/courses');
    const json = await response.json();

    if (response.ok) {
      setCourse(json)
    }
  };


  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve users');
      }

      const responseData = await response.json();
      groupUsersByCourse(responseData);
      getTeachers(responseData);
    } catch (error) {
      console.error('ERROR:', error);
    }
  };

  const fetchExam = async () => {
    try {
      const response = await fetch('/api/exams');
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      const exams = await response.json();
      groupExamsByWeek(exams);
      setExams(exams);
    } catch (err) {
      console.error('ERROR:', err);
    }
  };

  const groupUsersByCourse = (users) => {
    const students = users.filter(user => user.role === 'Student');

    const groupedData = students.reduce((acc, user) => {
      const { course } = user;
      if (!acc[course]) acc[course] = 0;
      acc[course] += 1;
      return acc;
    }, {});

    const formattedData = Object.keys(groupedData).map(course => ({
      name: course,
      value: groupedData[course],
    }));

    setUsers(formattedData);
  };

  const getTeachers = (users) => {
    const teachers = users.filter(user => user.role === 'Teacher');
    setTeachers(teachers);
  };

  const groupExamsByWeek = (exams) => {
    const weeksCount = {};

    exams.forEach((exam) => {
      const examDate = new Date(exam.createdAt);
      const startOfWeek = getStartOfWeek(examDate);
      const weekKey = `${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}`;

      if (weeksCount[weekKey]) {
        weeksCount[weekKey]++;
      } else {
        weeksCount[weekKey] = 1;
      }
    });

    const chartData = Object.keys(weeksCount).map((week) => ({
      name: week,
      exams: weeksCount[week],
    }));

    setData(chartData);
  };

  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Overview</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p>Total Teachers</p>
              <h3>{teachers.length}</h3>
            </div>
            <img src={Teacher} alt="Teacher Icon" style={{ width: '80px', height: '80px', objectFit: 'cover', marginTop: '12px' }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p>Total Exams</p>
              <h3>{exams.length}</h3>
            </div>
            <img src={Exam} alt="Teacher Icon" style={{ width: '80px', height: '80px', objectFit: 'cover', marginTop: '12px' }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p>Total Courses</p>
              <h3>{course.length}</h3>
            </div>
            <img src={Program} alt="Teacher Icon" style={{ width: '80px', height: '80px', objectFit: 'cover', marginTop: '12px' }} />
          </Paper>
        </Grid>
      </Grid>
      <br />
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>Students</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Exams</Typography>
            <ResponsiveContainer width="100%" height={307}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="exams" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Overview;
