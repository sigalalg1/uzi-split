import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../context/UserContext";
import * as userService from "../services/userService";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Progress,
  useToast,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type Exercise = {
  expression: string;
  answer: number;
};

type CompletedExercise = Exercise & {
  userAnswer: number;
  isCorrect: boolean;
  timestamp: number;
};

export default function OrderOfOperations() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { currentUser, isAuthenticated } = useUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [answerMode, setAnswerMode] = useState<"decimal" | "fraction">("decimal");
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [maxExercises, setMaxExercises] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [tempCount, setTempCount] = useState<number | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());

  // Safe math expression evaluator
  const evaluateExpression = (expr: string): number => {
    // This is a safe alternative to eval for math expressions
    // Using Function constructor is safer than eval as it runs in a limited scope
    try {
      // eslint-disable-next-line no-new-func
      return Function(`'use strict'; return (${expr})`)();
    } catch (e) {
      console.error('Error evaluating expression:', expr, e);
      return 0;
    }
  };

  const generateExercise = (level: number, existingQuestions: Set<string> = new Set()): Exercise => {
    const operators = ['+', '-', '*', '/'];
    const complexity = Math.random();

    // Adjust number ranges based on difficulty level
    const maxNum = level === 1 ? 5 : level === 2 ? 8 : level === 3 ? 10 : level === 4 ? 12 : 15;

    if (complexity < 0.3) {
      // Simple: a op b op c (3 numbers, 2 operators)
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * maxNum) + 1;
      const c = Math.floor(Math.random() * maxNum) + 1;
      const op1 = operators[Math.floor(Math.random() * operators.length)];
      const op2 = operators[Math.floor(Math.random() * operators.length)];

      const expression = `${a} ${op1} ${b} ${op2} ${c}`;
      const answer = evaluateExpression(expression);

      return { expression, answer: Math.round(answer * 100) / 100 };
    } else if (complexity < 0.7) {
      // Medium: (a op b) op c op d (4 numbers, with parentheses)
      const a = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const b = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const c = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const d = Math.floor(Math.random() * Math.max(maxNum - 2, 5)) + 1;
      const op1 = operators[Math.floor(Math.random() * operators.length)];
      const op2 = operators[Math.floor(Math.random() * operators.length)];
      const op3 = operators[Math.floor(Math.random() * operators.length)];

      const expression = `(${a} ${op1} ${b}) ${op2} ${c} ${op3} ${d}`;
      const answer = evaluateExpression(expression);

      return { expression, answer: Math.round(answer * 100) / 100 };
    } else {
      // Complex: a op (b op c) op d or (a op b) op (c op d)
      const a = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const b = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const c = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const d = Math.floor(Math.random() * Math.max(maxNum - 4, 5)) + 1;
      const op1 = operators[Math.floor(Math.random() * operators.length)];
      const op2 = operators[Math.floor(Math.random() * operators.length)];
      const op3 = operators[Math.floor(Math.random() * operators.length)];

      const useDoubleParens = Math.random() > 0.5;
      const expression = useDoubleParens
        ? `(${a} ${op1} ${b}) ${op2} (${c} ${op3} ${d})`
        : `${a} ${op1} (${b} ${op2} ${c}) ${op3} ${d}`;

      const answer = evaluateExpression(expression);

      const result = { expression, answer: Math.round(answer * 100) / 100 };

      // Check for duplicates and regenerate if needed
      if (existingQuestions.has(expression)) {
        let attempts = 0;
        while (attempts < 10) {
          const newExercise = generateExercise(level, existingQuestions);
          if (!existingQuestions.has(newExercise.expression)) {
            return newExercise;
          }
          attempts++;
        }
      }

      return result;
    }
  };

  const startGame = (count: number, level: number) => {
    setMaxExercises(count);
    setDifficulty(level);
    const newUsedQuestions = new Set<string>();
    setUsedQuestions(newUsedQuestions);
    const firstExercise = generateExercise(level, newUsedQuestions);
    newUsedQuestions.add(firstExercise.expression);
    setUsedQuestions(newUsedQuestions);
    setCurrentExercise(firstExercise);
    setIsTimerRunning(true);
    setScore(0);
    setTotalQuestions(0);
    setCompletedExercises([]);
    setElapsedTime(0);
    setStreak(0);
    setIsGameComplete(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleHistoryClick = (exercise: CompletedExercise) => {
    // Load the exercise from history
    setCurrentExercise({
      expression: exercise.expression,
      answer: exercise.answer,
    });

    // Clear inputs for retry
    setUserAnswer("");
    setNumerator("");
    setDenominator("");
    setShowFeedback(false);
    setIsCorrect(null);
  };

  const checkAnswer = (): { isCorrect: boolean; userAnswerValue: number } => {
    if (!currentExercise) return { isCorrect: false, userAnswerValue: 0 };

    let userAnswerValue: number;

    if (answerMode === "decimal") {
      // Decimal mode
      if (userAnswer === "") return { isCorrect: false, userAnswerValue: 0 };
      userAnswerValue = parseFloat(userAnswer);
    } else {
      // Fraction mode
      if (numerator === "" || denominator === "" || denominator === "0") {
        return { isCorrect: false, userAnswerValue: 0 };
      }
      userAnswerValue = parseFloat(numerator) / parseFloat(denominator);
    }

    // Check if answer is correct (with small tolerance for floating point)
    const tolerance = 0.01;
    const isCorrect = Math.abs(userAnswerValue - currentExercise.answer) < tolerance;

    return { isCorrect, userAnswerValue };
  };

  const handleSubmit = () => {
    if (!currentExercise) return;

    // Check if user has entered an answer
    if (answerMode === "decimal" && userAnswer === "") return;
    if (answerMode === "fraction" && (numerator === "" || denominator === "")) return;

    const { isCorrect: isAnswerCorrect, userAnswerValue } = checkAnswer();
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setTotalQuestions(totalQuestions + 1);

    const completedExercise: CompletedExercise = {
      ...currentExercise,
      userAnswer: userAnswerValue,
      isCorrect: isAnswerCorrect,
      timestamp: Date.now(),
    };
    setCompletedExercises([completedExercise, ...completedExercises]);

    if (isAnswerCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);

      toast({
        title: streak >= 2 ? `🎉 ${streak + 1} ${t("orderOfOperations.inARow")}` : `✅ ${t("orderOfOperations.correct")}`,
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: `❌ ${t("orderOfOperations.notQuite")}`,
        description: `${t("orderOfOperations.answerIs")} ${currentExercise.answer}`,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    if (maxExercises && totalQuestions + 1 >= maxExercises) {
      setIsTimerRunning(false);
      setIsGameComplete(true);
      
      // Save test result to localStorage
      if (currentUser) {
        const finalScore = isAnswerCorrect ? score + 1 : score;
        const finalTotal = totalQuestions + 1;
        const testResult = {
          testType: "orderOfOperations",
          score: finalScore,
          totalQuestions: finalTotal,
          difficulty: difficulty!,
          timeElapsed: elapsedTime,
          completedAt: Date.now(),
          percentage: Math.round((finalScore / finalTotal) * 100),
        };
        
        try {
          userService.saveTestResult(currentUser, testResult);
        } catch (error) {
          console.error("Error saving test result:", error);
        }
      }
      
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setUserAnswer("");
      }, 1500);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setUserAnswer("");
        setNumerator("");
        setDenominator("");
        const nextExercise = generateExercise(difficulty!, usedQuestions);
        setUsedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.add(nextExercise.expression);
          return newSet;
        });
        setCurrentExercise(nextExercise);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, nextInputRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (answerMode === "fraction" && nextInputRef?.current && e.currentTarget === document.activeElement) {
        // If in fraction mode and on numerator, move to denominator
        const target = e.currentTarget as HTMLInputElement;
        if (target.name === "numerator" && numerator !== "") {
          nextInputRef.current?.focus();
          return;
        }
      }
      handleSubmit();
    }
  };

  // Exercise count and difficulty selection screen
  if (!maxExercises || !difficulty) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <HStack justify="center" spacing={4}>
            <Heading textAlign="center" color="orange.600" size="lg">
              {t("orderOfOperations.title")}
            </Heading>
            <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
              {t("practicePage.subjects.orderOfOperations")}
            </Badge>
          </HStack>

          {/* Question Count Selection */}
          {!tempCount && (
            <>
              <Text fontSize="xl" color="gray.600" textAlign="center" fontWeight="bold">
                {t("practicePage.selectQuestions")}
              </Text>

              <HStack spacing={4} flexWrap="wrap" justify="center">
                {[5, 10, 15, 20, 25].map((count) => (
                  <Button
                    key={count}
                    onClick={() => setTempCount(count)}
                    colorScheme="orange"
                    size="lg"
                    fontSize="2xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.2s"
                  >
                    {count}
                  </Button>
                ))}
              </HStack>
            </>
          )}

          {/* Difficulty Level Selection */}
          {tempCount && (
            <>
              <Text fontSize="xl" color="gray.600" textAlign="center" fontWeight="bold">
                {t("practicePage.selectDifficulty")}
              </Text>

              <HStack spacing={4} flexWrap="wrap" justify="center">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    onClick={() => startGame(tempCount, level)}
                    colorScheme="orange"
                    variant="outline"
                    size="lg"
                    fontSize="3xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)", bg: "orange.50" }}
                    transition="all 0.2s"
                  >
                    {level}
                  </Button>
                ))}
              </HStack>

              <Button
                onClick={() => setTempCount(null)}
                colorScheme="gray"
                variant="ghost"
              >
                ← {t("orderOfOperations.back")}
              </Button>
            </>
          )}
        </VStack>
      </Container>
    );
  }

  // Game complete screen
  if (isGameComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Heading size="2xl" textAlign="center">
              {percentage === 100 ? t("orderOfOperations.perfectScore") : percentage >= 80 ? t("orderOfOperations.greatJob") : percentage >= 60 ? t("orderOfOperations.wellDone") : t("orderOfOperations.keepPracticing")}
            </Heading>
          </MotionBox>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            borderWidth={3}
            borderColor="orange.400"
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.700">
                {t("orderOfOperations.testComplete")}
              </Heading>

              <HStack spacing={8} fontSize="3xl" fontWeight="bold">
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("orderOfOperations.score")}</Text>
                  <Text color="orange.600">{score}/{totalQuestions}</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("orderOfOperations.accuracy")}</Text>
                  <Text color="green.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("orderOfOperations.time")}</Text>
                  <Text color="blue.600">{formatTime(elapsedTime)}</Text>
                </VStack>
              </HStack>

              <Progress
                value={percentage}
                colorScheme={percentage >= 80 ? "green" : percentage >= 60 ? "yellow" : "red"}
                size="lg"
                borderRadius="full"
                width="100%"
              />
            </VStack>
          </Box>

          <HStack spacing={4} width="100%">
            <Button
              onClick={() => {
                setMaxExercises(null);
                setDifficulty(null);
                setUserAnswer("");
                setNumerator("");
                setDenominator("");
                setTempCount(null);
              }}
              colorScheme="orange"
              size="lg"
              flex={1}
            >
              {t("orderOfOperations.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("orderOfOperations.backToTests")}
            </Button>
          </HStack>

          {/* Show completed exercises */}
          <Box width="100%">
            <Heading size="md" mb={4} color="gray.600">
              {t("orderOfOperations.completedExercises")}
            </Heading>
            <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
              {completedExercises.map((exercise) => (
                <Box
                  key={exercise.timestamp}
                  p={4}
                  borderRadius="lg"
                  bg={exercise.isCorrect ? "green.50" : "red.50"}
                  borderWidth={2}
                  borderColor={exercise.isCorrect ? "green.200" : "red.200"}
                  opacity={0.7}
                  _hover={{ opacity: 1, transform: "scale(1.02)", cursor: "pointer" }}
                  transition="all 0.2s"
                  onClick={() => handleHistoryClick(exercise)}
                  title={t("orderOfOperations.clickToRetry")}
                >
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                    <HStack spacing={2} fontSize="lg" fontWeight="bold" flexWrap="wrap">
                      <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                        {exercise.isCorrect ? "✓" : "✗"}
                      </Text>
                      <Text color="gray.700">{exercise.expression.replace(/\*/g, '×')}</Text>
                      <Text color="gray.500">=</Text>
                      <Text
                        color={exercise.isCorrect ? "green.600" : "red.600"}
                        textDecoration={exercise.isCorrect ? "none" : "line-through"}
                      >
                        {exercise.userAnswer}
                      </Text>
                      {!exercise.isCorrect && (
                        <Text color="green.600" fontSize="md">
                          (correct: {exercise.answer})
                        </Text>
                      )}
                    </HStack>
                    <Badge colorScheme={exercise.isCorrect ? "green" : "red"}>
                      {exercise.isCorrect ? "Correct" : "Wrong"}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Container>
    );
  }

  if (!currentExercise) return null;

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="flex-end" align="center" wrap="wrap" gap={2}>
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              ⏱️ {formatTime(elapsedTime)}
            </Badge>
            <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="full">
              🔥 {t("orderOfOperations.streak")}: {streak}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="orange.600" size="lg">
            {t("orderOfOperations.title")}
          </Heading>
          <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("orderOfOperations.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("orderOfOperations.score")}: {score}/{totalQuestions} ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </Text>
          </Flex>
          <Progress
            value={maxExercises ? (totalQuestions / maxExercises) * 100 : 0}
            colorScheme="orange"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Exercise Card */}
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${currentExercise.expression}-${totalQuestions}`}
          transition={{ duration: 0.3 }}
        >
          <Box
            bg={
              showFeedback
                ? isCorrect
                  ? "green.50"
                  : "red.50"
                : "white"
            }
            borderWidth={3}
            borderColor={
              showFeedback
                ? isCorrect
                  ? "green.400"
                  : "red.400"
                : "orange.400"
            }
            borderRadius="2xl"
            p={12}
            shadow="2xl"
            transition="all 0.3s"
          >
            <VStack spacing={6}>
              {/* Expression with animation */}
              <HStack spacing={4} fontSize="4xl" fontWeight="bold" flexWrap="wrap" justify="center">
                <MotionBox
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Text color="orange.500">{currentExercise.expression.replace(/\*/g, '×')}</Text>
                </MotionBox>

                <Text color="gray.600">=</Text>

                {/* Answer Input - Decimal or Fraction - Fixed width container */}
                <Box width="200px" minWidth="200px" maxWidth="200px" minH="150px" display="flex" alignItems="center" justifyContent="center">
                  {answerMode === "decimal" ? (
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e)}
                      placeholder="?"
                      size="lg"
                      fontSize="3xl"
                      fontWeight="bold"
                      textAlign="center"
                      width="200px"
                      minWidth="200px"
                      maxWidth="200px"
                      autoFocus
                      type="number"
                      step="0.01"
                      borderWidth={3}
                      borderColor="orange.400"
                      _focus={{
                        borderColor: "orange.500",
                        boxShadow: "0 0 0 3px rgba(255, 140, 0, 0.3)",
                      }}
                      disabled={showFeedback}
                    />
                  ) : (
                    <VStack spacing={1} align="center">
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {t("orderOfOperations.numerator")}
                      </Text>
                      <Input
                        name="numerator"
                        value={numerator}
                        onChange={(e) => setNumerator(e.target.value)}
                        onKeyPress={(e) => {
                          const denominatorRef = { current: document.querySelector('input[name="denominator"]') as HTMLInputElement };
                          handleKeyPress(e, denominatorRef);
                        }}
                        placeholder="?"
                        size="md"
                        fontSize="2xl"
                        fontWeight="bold"
                        textAlign="center"
                        width="120px"
                        minWidth="120px"
                        maxWidth="120px"
                        autoFocus
                        type="number"
                        borderWidth={3}
                        borderColor="orange.400"
                        _focus={{
                          borderColor: "orange.500",
                          boxShadow: "0 0 0 3px rgba(255, 140, 0, 0.3)",
                        }}
                        disabled={showFeedback}
                      />
                      <Box width="120px" height="3px" bg="gray.600" my={1} />
                      <Input
                        name="denominator"
                        value={denominator}
                        onChange={(e) => setDenominator(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e)}
                        placeholder="?"
                        size="md"
                        fontSize="2xl"
                        fontWeight="bold"
                        textAlign="center"
                        width="120px"
                        minWidth="120px"
                        maxWidth="120px"
                        type="number"
                        borderWidth={3}
                        borderColor="orange.400"
                        _focus={{
                          borderColor: "orange.500",
                          boxShadow: "0 0 0 3px rgba(255, 140, 0, 0.3)",
                        }}
                        disabled={showFeedback}
                      />
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {t("orderOfOperations.denominator")}
                      </Text>
                    </VStack>
                  )}
                </Box>
              </HStack>

              {/* Answer Mode Toggle */}
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant={answerMode === "decimal" ? "solid" : "outline"}
                  colorScheme="teal"
                  onClick={() => {
                    setAnswerMode("decimal");
                    setUserAnswer("");
                    setNumerator("");
                    setDenominator("");
                  }}
                  disabled={showFeedback}
                >
                  {t("orderOfOperations.decimal")}
                </Button>
                <Button
                  size="sm"
                  variant={answerMode === "fraction" ? "solid" : "outline"}
                  colorScheme="teal"
                  onClick={() => {
                    setAnswerMode("fraction");
                    setUserAnswer("");
                    setNumerator("");
                    setDenominator("");
                  }}
                  disabled={showFeedback}
                >
                  {t("orderOfOperations.fraction")}
                </Button>
              </HStack>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                colorScheme="orange"
                size="md"
                fontSize="lg"
                px={8}
                py={4}
                isDisabled={userAnswer === "" || showFeedback}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("orderOfOperations.checkAnswer")}
              </Button>
            </VStack>
          </Box>
        </MotionBox>

        {/* Encouragement Text */}
        <MotionBox
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Text textAlign="center" fontSize="xl" color="gray.500">
            {streak >= 5
              ? t("orderOfOperations.onFire")
              : streak >= 3
                ? t("orderOfOperations.amazing")
                : t("orderOfOperations.typeAnswer")}
          </Text>
        </MotionBox>

        {/* Completed Exercises History */}
        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              {t("orderOfOperations.completedExercises")}
            </Heading>
            <VStack spacing={2} align="stretch">
              {completedExercises.map((exercise) => (
                <MotionBox
                  key={exercise.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    p={4}
                    borderRadius="lg"
                    bg={exercise.isCorrect ? "green.50" : "red.50"}
                    borderWidth={2}
                    borderColor={exercise.isCorrect ? "green.200" : "red.200"}
                    opacity={0.7}
                    _hover={{ opacity: 1, transform: "scale(1.02)", cursor: "pointer" }}
                    transition="all 0.2s"
                    onClick={() => handleHistoryClick(exercise)}
                    title={t("orderOfOperations.clickToRetry")}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4} fontSize="2xl" fontWeight="bold">
                        <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                          {exercise.isCorrect ? "✓" : "✗"}
                        </Text>
                        <Text color="gray.700">{exercise.expression.replace(/\*/g, '×')}</Text>
                        <Text color="gray.500">=</Text>
                        <Text
                          color={exercise.isCorrect ? "green.600" : "red.600"}
                          textDecoration={exercise.isCorrect ? "none" : "line-through"}
                        >
                          {exercise.userAnswer}
                        </Text>
                        {!exercise.isCorrect && (
                          <Text color="green.600" fontSize="lg">
                            (correct: {exercise.answer})
                          </Text>
                        )}
                      </HStack>
                      <Badge colorScheme={exercise.isCorrect ? "green" : "red"}>
                        {exercise.isCorrect ? "Correct" : "Wrong"}
                      </Badge>
                    </Flex>
                  </Box>
                </MotionBox>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

