import React, { useState } from "react";
import { Container, Card, CardContent, Typography, Button, Radio, RadioGroup, FormControlLabel, TextField, Box } from "@mui/material";
import { useLocation } from 'react-router-dom';

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [identificationAnswer, setIdentificationAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const location = useLocation();
  const { quizData } = location.state || {}; // Retrieve quiz data from state

  console.log(quizData);
  // Flatten questions from the quizData
  const quizQuestions = quizData?.topics?.reduce((acc, topic) => {
    const { easy, intermediate, difficult } = topic.selectedQuestions;
    return [
      ...acc,
      ...easy,
      ...intermediate,
      ...difficult
    ];
  }, []) || []; // Empty array if quizData is undefined

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleIdentificationChange = (event) => {
    setIdentificationAnswer(event.target.value);
  };

  const handleNextQuestion = () => {
    const current = quizQuestions[currentQuestion];
    let isCorrect = false;

    // Answer comparison logic
    if (current.type === 'Multiple Choice') {
      // Check if the index of the selected option matches the answer (index-based)
      const selectedIndex = current.choices.indexOf(selectedOption);
      isCorrect = selectedIndex === current.answer;
    } else if (current.type === 'True or False') {
      // Compare selected option to the correct answer ("true" or "false")
      isCorrect = selectedOption === current.answer;
    } else if (current.type === 'Identification') {
      // Compare identification input to the answer (case-insensitive)
      isCorrect = identificationAnswer.trim().toLowerCase() === current.answer.trim().toLowerCase();
    }

    // Update score if the answer is correct
    if (isCorrect) {
      setScore(score + 1);
    }

    // Proceed to next question or finish quiz
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption("");
      setIdentificationAnswer("");
    } else {
      setIsFinished(true);
    }
  };

  const handleBackQuestion = () => {
    // Move to the previous question
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOption("");
    setIdentificationAnswer("");
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        height: '100vh', // Full viewport height
        display: 'flex',
        justifyContent: 'center', // Horizontally center
        alignItems: 'center',    // Vertically center
      }}
    >
      <Card
        sx={{
          width: 600, // Set fixed width
          minHeight: 400, // Set fixed minimum height
          padding: 5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <CardContent sx={{ flex: '1 1 auto', overflow: 'auto' }}>
          {!isFinished ? (
            <>
              <Typography variant="h5">
                {quizData.title}
              </Typography>
              <Typography variant="h5">
                {quizData.course} - {quizData.yearLevel}
              </Typography>
              <Typography variant="h6" sx={{ mt: 5 }}>
                <strong>{currentQuestion + 1}. </strong>{quizQuestions[currentQuestion].questionText}
              </Typography>

              {quizQuestions[currentQuestion].type === 'Multiple Choice' && (
                <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                  {quizQuestions[currentQuestion].choices.map((option, index) => (
                    <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
              )}

              {quizQuestions[currentQuestion].type === 'True or False' && (
                <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                  <FormControlLabel value="true" control={<Radio />} label="True" />
                  <FormControlLabel value="false" control={<Radio />} label="False" />
                </RadioGroup>
              )}

              {quizQuestions[currentQuestion].type === 'Identification' && (
                <TextField
                  label="Your Answer"
                  variant="outlined"
                  fullWidth
                  value={identificationAnswer}
                  onChange={handleIdentificationChange}
                />
              )}
            </>
          ) : (
            <Box textAlign="center">
              <Typography variant="h4">Quiz Finished!</Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>{`Your score: ${score}/${quizQuestions.length}`}</Typography>
              <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={restartQuiz}>
                Restart Quiz
              </Button>
            </Box>
          )}
        </CardContent>

        {/* Navigation Buttons */}
        {!isFinished && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleBackQuestion}
              disabled={currentQuestion === 0}
            >
              Back
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleNextQuestion}
              disabled={
                (quizQuestions[currentQuestion].type !== 'Identification' && !selectedOption) ||
                (quizQuestions[currentQuestion].type === 'Identification' && !identificationAnswer.trim())
              }
            >
              {currentQuestion < quizQuestions.length - 1 ? "Next" : "Finish"}
            </Button>
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default QuizPage;
