import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

export default function AddWithoutConversion() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

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

  const generateExercise = (level: number): Exercise => {
    // Generate based on difficulty level (1-5)
    let num1, num2, maxNum;

    switch (level) {
      case 1: // Very easy: 1-4, sum < 6
        num1 = Math.floor(Math.random() * 4) + 1;
        maxNum = Math.min(5 - num1, 4);
        num2 = Math.floor(Math.random() * maxNum) + 1;
        break;
      case 2: // Easy: 1-5, sum < 8
        num1 = Math.floor(Math.random() * 5) + 1;
        maxNum = Math.min(7 - num1, 5);
        num2 = Math.floor(Math.random() * maxNum) + 1;
        break;
      case 3: // Medium: 1-6, sum < 10
        num1 = Math.floor(Math.random() * 6) + 1;
        maxNum = Math.min(9 - num1, 6);
        num2 = Math.floor(Math.random() * maxNum) + 1;
        break;
      case 4: // Hard: 1-8, sum < 12
        num1 = Math.floor(Math.random() * 8) + 1;
        maxNum = Math.min(11 - num1, 8);
        num2 = Math.floor(Math.random() * maxNum) + 1;
        break;
      case 5: // Very hard: 1-10, sum < 15
        num1 = Math.floor(Math.random() * 10) + 1;
        maxNum = Math.min(14 - num1, 10);
        num2 = Math.floor(Math.random() * maxNum) + 1;
        break;
      default:
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * (9 - num1)) + 1;
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
    setCurrentExercise(generateExercise(level));
    setIsTimerRunning(true);
    setScore(0);
    setTotalQuestions(0);
    setCompletedExercises([]);
    setElapsedTime(0);
    setStreak(0);
    setIsGameComplete(false);
  };

  // Timer effect
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

  const handleSubmit = () => {
    if (!currentExercise || userAnswer === "") return;

    const parsedAnswer = parseInt(userAnswer);
    const isAnswerCorrect = parsedAnswer === currentExercise.answer;
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setTotalQuestions(totalQuestions + 1);

    // Add to completed exercises
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
        title: streak >= 2 ? `🎉 ${streak + 1} ${t("additionTest.inARow")}` : `✅ ${t("additionTest.correct")}`,
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: `❌ ${t("additionTest.notQuite")}`,
        description: `${t("additionTest.answerIs")} ${currentExercise.answer}`,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    // Check if game is complete
    if (maxExercises && totalQuestions + 1 >= maxExercises) {
      setIsTimerRunning(false);
      setIsGameComplete(true);
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setUserAnswer("");
      }, 1500);
    } else {
      // Move to next question after a delay
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setUserAnswer("");
        setCurrentExercise(generateExercise(difficulty!));
      }, 1500);
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
            <Heading textAlign="center" color="blue.600" size="lg">
              {t("additionTest.title")}
            </Heading>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              {t("practicePage.subjects.addition")}
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
                    colorScheme="blue"
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
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                    fontSize="3xl"
                    width="100px"
                    height="100px"
                    _hover={{ transform: "scale(1.05)", bg: "blue.50" }}
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
                ← {t("additionTest.back")}
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
              {percentage === 100 ? t("additionTest.perfectScore") : percentage >= 80 ? t("additionTest.greatJob") : percentage >= 60 ? t("additionTest.wellDone") : t("additionTest.keepPracticing")}
            </Heading>
          </MotionBox>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            borderWidth={3}
            borderColor="blue.400"
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.700">
                {t("additionTest.testComplete")}
              </Heading>

              <HStack spacing={8} fontSize="3xl" fontWeight="bold">
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("additionTest.score")}</Text>
                  <Text color="blue.600">{score}/{totalQuestions}</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("additionTest.accuracy")}</Text>
                  <Text color="green.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("additionTest.time")}</Text>
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
              onClick={() => { setMaxExercises(null); setDifficulty(null); }}
              colorScheme="blue"
              size="lg"
              flex={1}
            >
              {t("additionTest.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("additionTest.backToTests")}
            </Button>
          </HStack>

          {/* Show completed exercises */}
          <Box width="100%">
            <Heading size="md" mb={4} color="gray.600">
              Review Your Answers
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
                      <Text color="blue.500">{exercise.num1}</Text>
                      <Text color="gray.500">+</Text>
                      <Text color="purple.500">{exercise.num2}</Text>
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
        {/* Header */}
        <Flex justify="flex-end" align="center" wrap="wrap" gap={2}>
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              ⏱️ {formatTime(elapsedTime)}
            </Badge>
            <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="full">
              🔥 {t("additionTest.streak")}: {streak}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="blue.600" size="lg">
            {t("additionTest.title")}
          </Heading>
          <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("additionTest.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("additionTest.score")}: {score}/{totalQuestions} ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </Text>
          </Flex>
          <Progress
            value={maxExercises ? (totalQuestions / maxExercises) * 100 : 0}
            colorScheme="blue"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Exercise Card */}
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
                : "blue.400"
            }
            borderRadius="2xl"
            p={12}
            shadow="2xl"
            transition="all 0.3s"
          >
            <VStack spacing={8}>
              {/* Numbers with animation */}
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
                  <Text color="blue.500">{currentExercise.num1}</Text>
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
                  <Text color="purple.500">{currentExercise.num2}</Text>
                </MotionBox>

                <Text color="gray.600">=</Text>

                {/* Answer Input */}
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="?"
                  size="lg"
                  fontSize="7xl"
                  fontWeight="bold"
                  textAlign="center"
                  width="200px"
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
                colorScheme="blue"
                size="lg"
                fontSize="2xl"
                px={12}
                py={8}
                isDisabled={userAnswer === "" || showFeedback}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("additionTest.checkAnswer")}
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
              ? t("additionTest.onFire")
              : streak >= 3
                ? t("additionTest.amazing")
                : t("additionTest.typeAnswer")}
          </Text>
        </MotionBox>

        {/* Completed Exercises History */}
        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              {t("additionTest.completedExercises")}
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
                    _hover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4} fontSize="2xl" fontWeight="bold">
                        <Text color={exercise.isCorrect ? "green.600" : "red.600"}>
                          {exercise.isCorrect ? "✓" : "✗"}
                        </Text>
                        <Text color="blue.500">{exercise.num1}</Text>
                        <Text color="gray.500">+</Text>
                        <Text color="purple.500">{exercise.num2}</Text>
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

