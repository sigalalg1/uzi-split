import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isGameComplete, setIsGameComplete] = useState(false);

  const generateExercise = (): Exercise => {
    // Generate two single-digit numbers that don't require conversion (sum < 10)
    const num1 = Math.floor(Math.random() * 5) + 1; // 1-5
    const maxNum2 = 9 - num1; // Ensure sum is less than 10
    const num2 = Math.floor(Math.random() * maxNum2) + 1;

    return {
      num1,
      num2,
      answer: num1 + num2,
    };
  };

  const startGame = (count: number) => {
    setMaxExercises(count);
    setCurrentExercise(generateExercise());
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
        title: streak >= 2 ? `🎉 ${streak + 1} in a row!` : "✅ Correct!",
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "top",
      });
    } else {
      setStreak(0);

      toast({
        title: "❌ Not quite!",
        description: `The answer is ${currentExercise.answer}`,
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
        setCurrentExercise(generateExercise());
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Exercise count selection screen
  if (!maxExercises) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <Button
            onClick={() => navigate("/test")}
            colorScheme="gray"
            variant="outline"
            alignSelf="flex-start"
          >
            ← Back
          </Button>

          <Heading textAlign="center" color="blue.600" size="xl">
            Addition Without Conversion
          </Heading>

          <Text fontSize="xl" color="gray.600" textAlign="center">
            How many exercises would you like to practice?
          </Text>

          <VStack spacing={4} width="100%" maxW="400px">
            {[5, 10, 25, 50, 100].map((count) => (
              <Button
                key={count}
                onClick={() => startGame(count)}
                colorScheme="blue"
                size="lg"
                width="100%"
                fontSize="2xl"
                py={8}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {count} Exercises
              </Button>
            ))}
          </VStack>
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
              {percentage === 100 ? "🎉 Perfect Score!" : percentage >= 80 ? "🌟 Great Job!" : percentage >= 60 ? "👏 Well Done!" : "💪 Keep Practicing!"}
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
                Test Complete!
              </Heading>

              <HStack spacing={8} fontSize="3xl" fontWeight="bold">
                <VStack>
                  <Text color="gray.500" fontSize="lg">Score</Text>
                  <Text color="blue.600">{score}/{totalQuestions}</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">Accuracy</Text>
                  <Text color="green.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">Time</Text>
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
              onClick={() => setMaxExercises(null)}
              colorScheme="blue"
              size="lg"
              flex={1}
            >
              Start New Test
            </Button>
            <Button
              onClick={() => navigate("/test")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              Back to Tests
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
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <Button
            onClick={() => navigate("/test")}
            colorScheme="gray"
            variant="outline"
          >
            ← Back
          </Button>

          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              ⏱️ {formatTime(elapsedTime)}
            </Badge>
            <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="full">
              🔥 Streak: {streak}
            </Badge>
          </HStack>
        </Flex>

        <Heading textAlign="center" color="blue.600" size="xl">
          Addition Without Conversion
        </Heading>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              Progress: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              Score: {score}/{totalQuestions} ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
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
                Check Answer
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
              ? "🌟 You're on fire! Keep going!"
              : streak >= 3
                ? "⭐ Amazing! You're doing great!"
                : "Type your answer and press Enter!"}
          </Text>
        </MotionBox>

        {/* Completed Exercises History */}
        {completedExercises.length > 0 && (
          <Box mt={8}>
            <Heading size="md" mb={4} color="gray.600">
              Completed Exercises
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

