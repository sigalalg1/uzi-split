import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../context/UserContext";
import { useSettings } from "../context/SettingsContext";
import * as userService from "../services/userService";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Progress,
  Input,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type Exercise = {
  num1: number;
  num2: number;
  answer: number;
};

type CompletedExercise = Exercise & {
  userAnswer: number;
  isCorrect: boolean;
  timestamp: number;
};

export default function MultiplyAdvanced() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { currentUser, isAuthenticated } = useUser();
  const { settings } = useSettings();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
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

  const generateExercise = (level: number, existingQuestions: Set<string> = new Set()): Exercise => {
    let num1: number, num2: number;

    switch (level) {
      case 1: // Easy: 2-digit × 1-digit (e.g., 12×3, 24×5)
        num1 = Math.floor(Math.random() * 30) + 10; // 10-39
        num2 = Math.floor(Math.random() * 9) + 2; // 2-10
        break;
      case 2: // Medium-easy: small 2-digit × 2-digit (e.g., 12×14, 15×16)
        num1 = Math.floor(Math.random() * 10) + 11; // 11-20
        num2 = Math.floor(Math.random() * 10) + 11; // 11-20
        break;
      case 3: // Medium: 2-digit × 2-digit (e.g., 23×34, 45×27)
        num1 = Math.floor(Math.random() * 30) + 20; // 20-49
        num2 = Math.floor(Math.random() * 30) + 20; // 20-49
        break;
      case 4: // Hard: larger 2-digit × 2-digit (e.g., 45×67, 58×73)
        num1 = Math.floor(Math.random() * 40) + 40; // 40-79
        num2 = Math.floor(Math.random() * 40) + 40; // 40-79
        break;
      case 5: // Very hard: largest 2-digit × 2-digit (e.g., 87×94, 78×89)
        num1 = Math.floor(Math.random() * 30) + 60; // 60-89
        num2 = Math.floor(Math.random() * 30) + 60; // 60-89
        break;
      default:
        num1 = Math.floor(Math.random() * 30) + 20;
        num2 = Math.floor(Math.random() * 30) + 20;
    }

    // Check for duplicates and regenerate if needed
    const questionKey = `${num1}×${num2}`;
    const questionKeyReverse = `${num2}×${num1}`;

    if (existingQuestions.has(questionKey) || existingQuestions.has(questionKeyReverse)) {
      // Try up to 10 times to find a unique question
      let attempts = 0;
      while (attempts < 10) {
        const newExercise = generateExercise(level, existingQuestions);
        const newKey = `${newExercise.num1}×${newExercise.num2}`;
        const newKeyReverse = `${newExercise.num2}×${newExercise.num1}`;
        if (!existingQuestions.has(newKey) && !existingQuestions.has(newKeyReverse)) {
          return newExercise;
        }
        attempts++;
      }
    }

    return {
      num1,
      num2,
      answer: num1 * num2,
    };
  };

  const startGame = (count: number, level: number) => {
    setMaxExercises(count);
    setDifficulty(level);
    const newUsedQuestions = new Set<string>();
    setUsedQuestions(newUsedQuestions);
    const firstExercise = generateExercise(level, newUsedQuestions);
    newUsedQuestions.add(`${firstExercise.num1}×${firstExercise.num2}`);
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
    setCurrentExercise({
      num1: exercise.num1,
      num2: exercise.num2,
      answer: exercise.answer,
    });
    setUserAnswer("");
    setShowFeedback(false);
    setIsCorrect(null);
  };

  const handleSubmit = () => {
    if (!currentExercise || userAnswer === "") return;

    const parsedAnswer = parseInt(userAnswer);
    const isAnswerCorrect = parsedAnswer === currentExercise.answer;
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setTotalQuestions(totalQuestions + 1);

    const completedExercise: CompletedExercise = {
      ...currentExercise,
      userAnswer: parsedAnswer,
      isCorrect: isAnswerCorrect,
      timestamp: Date.now(),
    };
    setCompletedExercises([completedExercise, ...completedExercises]);

    if (isAnswerCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);

      toast({
        title: streak >= 2 ? `🎉 ${streak + 1} ${t("multiplyAdvanced.inARow")}` : `✅ ${t("multiplyAdvanced.correct")}`,
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: `❌ ${t("multiplyAdvanced.notQuite")}`,
        description: `${t("multiplyAdvanced.answerIs")} ${currentExercise.answer}`,
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
        const finalScore = isCorrect ? score + 1 : score;
        const finalTotal = totalQuestions + 1;
        const testResult = {
          testType: "multiply-advanced",
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
      }, settings.feedbackDelay);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setUserAnswer("");
        const nextExercise = generateExercise(difficulty!, usedQuestions);
        setUsedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.add(`${nextExercise.num1}×${nextExercise.num2}`);
          return newSet;
        });
        setCurrentExercise(nextExercise);
      }, settings.feedbackDelay);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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
              {t("multiplyAdvanced.title")}
            </Heading>
            <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
              {t("practicePage.subjects.multiplication")}
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
                ← {t("multiplyAdvanced.back")}
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
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8}>
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Heading size="2xl" textAlign="center">
              {percentage === 100
                ? t("multiplyAdvanced.perfectScore")
                : percentage >= 80
                  ? t("multiplyAdvanced.greatJob")
                  : percentage >= 60
                    ? t("multiplyAdvanced.wellDone")
                    : t("multiplyAdvanced.keepPracticing")}
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
                {t("multiplyAdvanced.testComplete")}
              </Heading>

              <HStack spacing={12} fontSize="xl" flexWrap="wrap" justify="center">
                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("multiplyAdvanced.yourScore")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="orange.600">
                    {score}/{totalQuestions}
                  </Text>
                </VStack>

                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("multiplyAdvanced.accuracy")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="orange.600">
                    {percentage}%
                  </Text>
                </VStack>

                <VStack>
                  <Text fontWeight="bold" color="gray.600">
                    {t("multiplyAdvanced.time")}
                  </Text>
                  <Text fontSize="4xl" fontWeight="bold" color="orange.600">
                    {formatTime(elapsedTime)}
                  </Text>
                </VStack>
              </HStack>

              <Progress
                value={percentage}
                colorScheme="orange"
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
                setTempCount(null);
              }}
              colorScheme="orange"
              size="lg"
              flex={1}
            >
              {t("multiplyAdvanced.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("multiplyAdvanced.backToTests")}
            </Button>
          </HStack>
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
              🔥 {t("multiplyAdvanced.streak")}: {streak}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="orange.600" size="lg">
            {t("multiplyAdvanced.title")}
          </Heading>
          <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("multiplyAdvanced.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("multiplyAdvanced.score")}: {score}/{totalQuestions} (
              {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
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
          key={`${currentExercise.num1}-${currentExercise.num2}-${totalQuestions}`}
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
              {/* Multiplication Problem */}
              <HStack spacing={6} fontSize="6xl" fontWeight="bold" flexWrap="wrap" justify="center">
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
                  <Text color="orange.500">{currentExercise.num1}</Text>
                </MotionBox>

                <Text color="gray.600">×</Text>

                <MotionBox
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2,
                    delay: 0.5,
                  }}
                >
                  <Text color="orange.500">{currentExercise.num2}</Text>
                </MotionBox>

                <Text color="gray.600">=</Text>

                {/* Answer Input */}
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="?"
                  size="lg"
                  fontSize="5xl"
                  fontWeight="bold"
                  textAlign="center"
                  width="300px"
                  minWidth="300px"
                  maxWidth="300px"
                  autoFocus
                  type="number"
                  borderWidth={3}
                  borderColor="orange.400"
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 3px rgba(251, 146, 60, 0.3)",
                  }}
                  disabled={showFeedback}
                />
              </HStack>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                colorScheme="orange"
                size="lg"
                fontSize="xl"
                px={8}
                py={6}
                isDisabled={userAnswer === "" || showFeedback}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("multiplyAdvanced.checkAnswer")}
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
              ? t("multiplyAdvanced.onFire")
              : streak >= 3
                ? t("multiplyAdvanced.amazing")
                : t("multiplyAdvanced.typeAnswer")}
          </Text>
        </MotionBox>

        {/* Completed Exercises History */}
        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              {t("multiplyAdvanced.completedExercises")}
            </Heading>
            <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
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
                    title={t("multiplyAdvanced.clickToRetry")}
                  >
                    <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                      <HStack spacing={3} fontSize="2xl" fontWeight="bold" flexWrap="wrap">
                        <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                          {exercise.isCorrect ? "✓" : "✗"}
                        </Text>
                        <Text color="orange.500">{exercise.num1}</Text>
                        <Text color="gray.500">×</Text>
                        <Text color="orange.500">{exercise.num2}</Text>
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



