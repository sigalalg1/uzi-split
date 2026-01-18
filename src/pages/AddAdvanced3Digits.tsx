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
  num1: number;
  num2: number;
  answer: number;
};

type CompletedExercise = Exercise & {
  userAnswer: number;
  isCorrect: boolean;
  timestamp: number;
};

export default function AddAdvanced3Digits() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { currentUser, isAuthenticated } = useUser();

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
    let num1, num2;

    switch (level) {
      case 1: // Easy: 100-299 + 100-299
        num1 = Math.floor(Math.random() * 200) + 100;
        num2 = Math.floor(Math.random() * 200) + 100;
        break;
      case 2: // Medium-easy: 200-499 + 100-299
        num1 = Math.floor(Math.random() * 300) + 200;
        num2 = Math.floor(Math.random() * 200) + 100;
        break;
      case 3: // Medium: 300-699 + 200-499
        num1 = Math.floor(Math.random() * 400) + 300;
        num2 = Math.floor(Math.random() * 300) + 200;
        break;
      case 4: // Hard: 400-799 + 300-699
        num1 = Math.floor(Math.random() * 400) + 400;
        num2 = Math.floor(Math.random() * 400) + 300;
        break;
      case 5: // Very hard: 500-999 + 500-999
        num1 = Math.floor(Math.random() * 500) + 500;
        num2 = Math.floor(Math.random() * 500) + 500;
        break;
      default:
        num1 = Math.floor(Math.random() * 300) + 200;
        num2 = Math.floor(Math.random() * 300) + 200;
    }

    const questionKey = `${num1}+${num2}`;
    const questionKeyReverse = `${num2}+${num1}`;

    if (existingQuestions.has(questionKey) || existingQuestions.has(questionKeyReverse)) {
      let attempts = 0;
      while (attempts < 10) {
        const newExercise = generateExercise(level, existingQuestions);
        const newKey = `${newExercise.num1}+${newExercise.num2}`;
        const newKeyReverse = `${newExercise.num2}+${newExercise.num1}`;
        if (!existingQuestions.has(newKey) && !existingQuestions.has(newKeyReverse)) {
          return newExercise;
        }
        attempts++;
      }
    }

    return {
      num1,
      num2,
      answer: num1 + num2,
    };
  };

  const startGame = (count: number, level: number) => {
    setMaxExercises(count);
    setDifficulty(level);
    const newUsedQuestions = new Set<string>();
    setUsedQuestions(newUsedQuestions);
    const firstExercise = generateExercise(level, newUsedQuestions);
    newUsedQuestions.add(`${firstExercise.num1}+${firstExercise.num2}`);
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
        title: streak >= 2 ? `🎉 ${streak + 1} ${t("addAdvanced3Digits.inARow")}` : `✅ ${t("addAdvanced3Digits.correct")}`,
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: `❌ ${t("addAdvanced3Digits.notQuite")}`,
        description: `${t("addAdvanced3Digits.answerIs")} ${currentExercise.answer}`,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    if (maxExercises && totalQuestions + 1 >= maxExercises) {
      setIsTimerRunning(false);
      setIsGameComplete(true);

      if (currentUser) {
        const finalScore = isAnswerCorrect ? score + 1 : score;
        const finalTotal = totalQuestions + 1;
        const testResult = {
          testType: "add-advanced-3digits",
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
        const nextExercise = generateExercise(difficulty!, usedQuestions);
        setUsedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.add(`${nextExercise.num1}+${nextExercise.num2}`);
          return newSet;
        });
        setCurrentExercise(nextExercise);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!maxExercises || !difficulty) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <HStack justify="center" spacing={4}>
            <Heading textAlign="center" color="teal.600" size="lg">
              {t("addAdvanced3Digits.title")}
            </Heading>
            <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
              {t("practicePage.subjects.addition")}
            </Badge>
          </HStack>

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
                    colorScheme="teal"
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
                    colorScheme="teal"
                    variant="outline"
                    size="lg"
                    fontSize="3xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)", bg: "teal.50" }}
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
                ← {t("addAdvanced3Digits.back")}
              </Button>
            </>
          )}
        </VStack>
      </Container>
    );
  }

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
              {percentage === 100 ? t("addAdvanced3Digits.perfectScore") : percentage >= 80 ? t("addAdvanced3Digits.greatJob") : percentage >= 60 ? t("addAdvanced3Digits.wellDone") : t("addAdvanced3Digits.keepPracticing")}
            </Heading>
          </MotionBox>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            borderWidth={3}
            borderColor="teal.400"
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.700">
                {t("addAdvanced3Digits.testComplete")}
              </Heading>

              <HStack spacing={8} fontSize="3xl" fontWeight="bold">
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("addAdvanced3Digits.score")}</Text>
                  <Text color="teal.600">{score}/{totalQuestions}</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("addAdvanced3Digits.accuracy")}</Text>
                  <Text color="teal.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("addAdvanced3Digits.time")}</Text>
                  <Text color="purple.600">{formatTime(elapsedTime)}</Text>
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
                setTempCount(null);
              }}
              colorScheme="teal"
              size="lg"
              flex={1}
            >
              {t("addAdvanced3Digits.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("addAdvanced3Digits.backToTests")}
            </Button>
          </HStack>

          <Box width="100%">
            <Heading size="md" mb={4} color="gray.600">
              {t("addAdvanced3Digits.reviewAnswers")}
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
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={4} fontSize="2xl" fontWeight="bold">
                      <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                        {exercise.isCorrect ? "✓" : "✗"}
                      </Text>
                      <Text color="teal.500">{exercise.num1}</Text>
                      <Text color="gray.500">+</Text>
                      <Text color="blue.500">{exercise.num2}</Text>
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
        <Flex justify="flex-end" align="center" wrap="wrap" gap={2}>
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              ⏱️ {formatTime(elapsedTime)}
            </Badge>
            <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="full">
              🔥 {t("addAdvanced3Digits.streak")}: {streak}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="teal.600" size="lg">
            {t("addAdvanced3Digits.title")}
          </Heading>
          <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("addAdvanced3Digits.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("addAdvanced3Digits.score")}: {score}/{totalQuestions} ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </Text>
          </Flex>
          <Progress
            value={maxExercises ? (totalQuestions / maxExercises) * 100 : 0}
            colorScheme="teal"
            size="lg"
            borderRadius="full"
          />
        </Box>

        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${currentExercise.num1}-${currentExercise.num2}`}
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
                : "teal.400"
            }
            borderRadius="2xl"
            p={12}
            shadow="2xl"
            transition="all 0.3s"
          >
            <VStack spacing={8}>
              <HStack spacing={8} fontSize="8xl" fontWeight="bold">
                <MotionBox
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Text color="teal.500">{currentExercise.num1}</Text>
                </MotionBox>

                <Text color="gray.600">+</Text>

                <MotionBox
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 0.2,
                  }}
                >
                  <Text color="blue.500">{currentExercise.num2}</Text>
                </MotionBox>

                <Text color="gray.600">=</Text>

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
                  borderColor="teal.400"
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.3)",
                  }}
                  disabled={showFeedback}
                />
              </HStack>

              <Button
                onClick={handleSubmit}
                colorScheme="teal"
                size="lg"
                fontSize="2xl"
                px={12}
                py={8}
                isDisabled={userAnswer === "" || showFeedback}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("addAdvanced3Digits.checkAnswer")}
              </Button>
            </VStack>
          </Box>
        </MotionBox>

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
              ? t("addAdvanced3Digits.onFire")
              : streak >= 3
                ? t("addAdvanced3Digits.amazing")
                : t("addAdvanced3Digits.typeAnswer")}
          </Text>
        </MotionBox>

        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              {t("addAdvanced3Digits.completedExercises")}
            </Heading>
            <VStack spacing={2} align="stretch">
              {completedExercises.map((exercise, index) => (
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
                    title={t("addAdvanced3Digits.clickToRetry")}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4} fontSize="2xl" fontWeight="bold">
                        <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                          {exercise.isCorrect ? "✓" : "✗"}
                        </Text>
                        <Text color="teal.500">{exercise.num1}</Text>
                        <Text color="gray.500">+</Text>
                        <Text color="blue.500">{exercise.num2}</Text>
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

