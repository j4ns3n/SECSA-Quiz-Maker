import React, { useState, useEffect } from "react";
import { Container, Card, CardContent, Typography, Button, Radio, RadioGroup, FormControlLabel, TextField, Box } from "@mui/material";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [quizResults, setQuizResults] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set()); // To track answered questions
  const location = useLocation();
  const { quizData } = location.state || {};
  const { userData } = location.state || {};
  const [decodedToken, setDecodedToken] = useState('');
  const navigate = useNavigate();

  // Flatten questions from the quizData
  const quizQuestions = quizData?.topics?.reduce((acc, topic) => {
    const { easy, intermediate, difficult } = topic.selectedQuestions;
    return [
      ...acc,
      ...easy,
      ...intermediate,
      ...difficult
    ];
  }, []) || [];

  // Shuffle the quiz questions
  const shuffleQuestions = (questions) => {
    return questions.sort(() => Math.random() - 0.5);
  };

  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  useEffect(() => {
    setScore(0);
    setUserAnswers({});
    setQuizResults([]);
    setQuizCompleted(false);
    setAnsweredQuestions(new Set());
    setDecodedToken(jwtDecode(localStorage.getItem("authToken")));
    setShuffledQuestions(shuffleQuestions(quizQuestions)); // Shuffle questions when quizData is available
  }, [quizData]);

  // Handler for multiple choice and true/false answers
  const handleOptionChange = (event) => {
    const { value } = event.target;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion]: { ...prevAnswers[currentQuestion], selectedOption: value }
    }));
  };

  // Handler for identification-type answers
  const handleIdentificationChange = (event) => {
    const { value } = event.target;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion]: { ...prevAnswers[currentQuestion], identificationAnswer: value }
    }));
  };

  // Handler for numeric answers (e.g., worded problems)
  const handleNumericChange = (event) => {
    const { value } = event.target;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion]: { ...prevAnswers[currentQuestion], numericAnswer: value }
    }));
  };

  // Handler for essay-type answers
  const handleEssayChange = (event) => {
    const { value } = event.target;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion]: { ...prevAnswers[currentQuestion], essayAnswer: value }
    }));
  };

  // Answer comparison function
  const isAnswerCorrect = (question, userAnswer) => {
    if (question.type === 'Multiple Choice') {
      return userAnswer?.selectedOption === question.answer;
    } else if (question.type === 'True or False') {
      return userAnswer?.selectedOption.toLowerCase() === question.answer.toLowerCase();
    } else if (question.type === 'Identification') {
      return userAnswer?.identificationAnswer?.trim().toLowerCase() === question.answer.trim().toLowerCase();
    } else if (question.type === 'Worded Problem') {
      return parseFloat(userAnswer?.numericAnswer) === parseFloat(question.answer);
    } else if (question.type === 'Essay') {
      return userAnswer?.essayAnswer?.trim().length > 0; // Essay is considered correct if there's any answer
    }
    return false;
  };

  // Handle when the user goes to the next question or completes the quiz
  const handleNextQuestion = () => {
    const current = shuffledQuestions[currentQuestion];
    const userAnswer = userAnswers[currentQuestion];

    // Only update score if the question hasn't been answered before
    if (!answeredQuestions.has(currentQuestion)) {
      // Check if the user's answer is correct
      if (isAnswerCorrect(current, userAnswer)) {
        setScore(prevScore => prevScore + 1);
      }

      // Collect quiz results for later display
      setQuizResults((prevResults) => [
        ...prevResults,
        {
          question: current.questionText,
          userAnswer: userAnswer ? userAnswer.selectedOption || userAnswer.identificationAnswer || userAnswer.numericAnswer || userAnswer.essayAnswer : "No Answer",
          correctAnswer: current.answer,
          isCorrect: isAnswerCorrect(current, userAnswer),
          difficulty: current.difficulty
        }
      ]);

      // Mark the current question as answered
      setAnsweredQuestions((prevSet) => new Set(prevSet).add(currentQuestion));
    }

    // Check if it's the last question, then finish the quiz
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsFinished(true);
      setQuizCompleted(true);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setIsFinished(false);
    setUserAnswers({});
    setQuizResults([]);
    setQuizCompleted(false);
    setAnsweredQuestions(new Set()); // Reset answered questions on restart

    navigate('/exam');
  };

  // Get the answer for a particular question
  const getAnswerForQuestion = (questionIndex, type) => {
    const answer = userAnswers[questionIndex];
    if (type === 'Multiple Choice') {
      return answer?.selectedOption || "";
    } else if (type === 'True or False') {
      return answer?.selectedOption || "";
    } else if (type === 'Identification') {
      return answer?.identificationAnswer || "";
    } else if (type === 'Worded Problem') {
      return answer?.numericAnswer || "";
    } else if (type === 'Essay') {
      return answer?.essayAnswer || "";
    }
    return "";
  };

  // Handle the results immediately after quiz completion (no extra click needed)
  useEffect(() => {
    if (isFinished) {
      const data = {
        name: userData.name,
        examId: quizData._id,
        course: userData.course,
        score: score, 
        questions: quizResults.map(result => ({
          question: result.question,
          userAnswer: result.userAnswer,
          correctAnswer: result.correctAnswer,
          isCorrect: result.userAnswer === result.correctAnswer,
          difficulty: result.difficulty,
        }))
      }
      examToDb(data)
    }
  }, [isFinished, userData.course, userData.name, score, quizData._id, answeredQuestions]);

  const examToDb = async (data) => {
    console.log(data);
    const examData = {
      examId: data.examId,
      examTitle: quizData.title,
      course: quizData.course,
      code: quizData.examCode,
      score: data.score,
      questions: quizResults.map(result => ({
        question: result.question,
        userAnswer: result.userAnswer,
        correctAnswer: result.correctAnswer,
        isCorrect: result.userAnswer === result.correctAnswer,
        difficulty: result.difficulty,
      }))
    };

    try {
      const response = await fetch(`/api/user/exam/${decodedToken.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examData }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      const responseData = await response.json();
      if (responseData) {
        try {
          const response = await fetch(`/api/exams/${data.examId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to submit exam');
          }
        } catch (error) {
          console.error('Exam submitted:', error);
        }
      }
    } catch (error) {
      console.error('Exam submission error:', error);
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(to top, #ffdc75, #d37900, #a54e00)',
        color: '#fff'
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        >
        <Card
          sx={{
            width: 600,
            minHeight: 400,
            padding: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ flex: '1 1 auto', overflow: 'auto' }}>
            {!isFinished ? (
              shuffledQuestions.length > 0 && shuffledQuestions[currentQuestion] ? (
                <>
                  <div className="container" style={{ borderBottom: "1px #8d8d8d solid", paddingBottom: "23px" }}>
                    <Typography variant="h5">
                      <strong>{quizData.title}</strong>
                    </Typography>
                    <br />
                    <Typography variant="h5">
                      {quizData.course}
                    </Typography>
                  </div>

                  <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
                    <strong>{currentQuestion + 1}. </strong>{shuffledQuestions[currentQuestion].questionText}
                  </Typography>

                  {shuffledQuestions[currentQuestion].type === 'Multiple Choice' && (
                    <RadioGroup value={getAnswerForQuestion(currentQuestion, 'Multiple Choice')} onChange={handleOptionChange}>
                      {shuffledQuestions[currentQuestion].choices.map((option, index) => (
                        <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                      ))}
                    </RadioGroup>
                  )}

                  {shuffledQuestions[currentQuestion].type === 'True or False' && (
                    <RadioGroup value={getAnswerForQuestion(currentQuestion, 'True or False')} onChange={handleOptionChange}>
                      <FormControlLabel value="True" control={<Radio />} label="True" />
                      <FormControlLabel value="False" control={<Radio />} label="False" />
                    </RadioGroup>
                  )}

                  {shuffledQuestions[currentQuestion].type === 'Identification' && (
                    <TextField
                      label="Your Answer"
                      variant="outlined"
                      fullWidth
                      value={getAnswerForQuestion(currentQuestion, 'Identification')}
                      onChange={handleIdentificationChange}
                    />
                  )}

                  {shuffledQuestions[currentQuestion].type === 'Worded Problem' && (
                    <TextField
                      label="Your Answer (Numeric)"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={getAnswerForQuestion(currentQuestion, 'Worded Problem')}
                      onChange={handleNumericChange}
                    />
                  )}

                  {shuffledQuestions[currentQuestion].type === 'Essay' && (
                    <TextField
                      label="Your Answer (Essay)"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      value={getAnswerForQuestion(currentQuestion, 'Essay')}
                      onChange={handleEssayChange}
                    />
                  )}
                </>
              ) : null
            ) : (
              <Box textAlign="center">
                <Typography variant="h4">Exam Finished!</Typography>
                {score / shuffledQuestions.length >= 0.6 ? (
                  <Typography variant="h5" sx={{ mt: 10, color: 'green' }}>
                    <strong>Passed! 😄</strong>
                  </Typography>
                ) : (
                  <Typography variant="h5" sx={{ mt: 10, color: 'red' }}>
                    <strong>Failed! 🙁</strong>
                  </Typography>
                )}
                <Typography variant="h5" sx={{ mt: 10 }}><strong>{`Your score: ${score} / ${shuffledQuestions.length}`}</strong></Typography>
                <Button variant="contained" color="primary" onClick={restartQuiz} sx={{ mt: 10 }}>
                  Restart Quiz
                </Button>
              </Box>
            )}
          </CardContent>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
            <Button variant="contained" sx={{ backgroundColor: "#e05707" }} onClick={handleBackQuestion}>
              Back
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#e05707" }}
              onClick={handleNextQuestion}
              disabled={quizCompleted}
            >
              {currentQuestion === shuffledQuestions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Card>
      </Container>
    </div>
  );
};

export default QuizPage;
