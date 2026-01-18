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
  Progress,
  useToast,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type NumberType = "natural" | "decimal" | "fraction";

type NumberItem = {
  id: string;
  value: number;
  display: string;
  type: NumberType;
  fractionParts?: {
    whole: number;
    numerator: number;
    denominator: number;
  };
};

type PlacedNumber = {
  number: NumberItem;
  position: number;
  isCorrect: boolean | null;
};

type Exercise = {
  min: number;
  max: number;
  numbers: NumberItem[];
  scale: number; // Number of decimal places or fraction denominators
};

type CompletedExercise = {
  numbers: NumberItem[];
  correctCount: number;
  totalCount: number;
  timestamp: number;
};

export default function NumberLine() {
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
  const [placedNumbers, setPlacedNumbers] = useState<PlacedNumber[]>([]);
  const [draggedNumber, setDraggedNumber] = useState<NumberItem | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [maxExercises, setMaxExercises] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [tempCount, setTempCount] = useState<number | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const simplifyFraction = (num: number, den: number): [number, number] => {
    const divisor = gcd(Math.abs(num), Math.abs(den));
    return [num / divisor, den / divisor];
  };

  const generateExercise = (level: number): Exercise => {
    let min: number, max: number, numbersToPlace: NumberItem[], scale: number;

    switch (level) {
      case 1: // Natural numbers 0-10
        min = 0;
        max = 10;
        scale = 1;
        numbersToPlace = Array.from({ length: 4 }, (_, i) => {
          const value = Math.floor(Math.random() * (max - min + 1)) + min;
          return {
            id: `num-${i}`,
            value,
            display: value.toString(),
            type: "natural" as NumberType,
          };
        });
        break;

      case 2: // Natural numbers 0-20
        min = 0;
        max = 20;
        scale = 2;
        numbersToPlace = Array.from({ length: 5 }, (_, i) => {
          const value = Math.floor(Math.random() * (max - min + 1)) + min;
          return {
            id: `num-${i}`,
            value,
            display: value.toString(),
            type: "natural" as NumberType,
          };
        });
        break;

      case 3: // Decimals 0-10 with .5
        min = 0;
        max = 10;
        scale = 0.5;
        numbersToPlace = Array.from({ length: 5 }, (_, i) => {
          const whole = Math.floor(Math.random() * max);
          const decimal = Math.random() > 0.5 ? 0.5 : 0;
          const value = whole + decimal;
          return {
            id: `num-${i}`,
            value,
            display: value.toString(),
            type: "decimal" as NumberType,
          };
        });
        break;

      case 4: // Mixed: naturals, decimals (0.1), and simple fractions
        min = 0;
        max = 10;
        scale = 0.1;
        numbersToPlace = [];

        for (let i = 0; i < 6; i++) {
          const typeChoice = Math.floor(Math.random() * 3);

          if (typeChoice === 0) {
            // Natural number
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            numbersToPlace.push({
              id: `num-${i}`,
              value,
              display: value.toString(),
              type: "natural",
            });
          } else if (typeChoice === 1) {
            // Decimal (one decimal place)
            const value = Math.floor(Math.random() * max * 10) / 10;
            numbersToPlace.push({
              id: `num-${i}`,
              value,
              display: value.toFixed(1),
              type: "decimal",
            });
          } else {
            // Simple fraction (halves, quarters)
            const whole = Math.floor(Math.random() * (max - 1));
            const denominators = [2, 4];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];
            const numer = Math.floor(Math.random() * (denom - 1)) + 1;
            const value = whole + numer / denom;
            const [simpleNum, simpleDenom] = simplifyFraction(whole * denom + numer, denom);
            const actualNumer = whole > 0 ? simpleNum - (whole * simpleDenom) : simpleNum;
            numbersToPlace.push({
              id: `num-${i}`,
              value,
              display: whole > 0 ? `${whole} ${actualNumer}/${simpleDenom}` : `${simpleNum}/${simpleDenom}`,
              type: "fraction",
              fractionParts: {
                whole,
                numerator: actualNumer,
                denominator: simpleDenom,
              },
            });
          }
        }
        break;

      case 5: // Advanced: all types with smaller intervals
        min = 0;
        max = 5;
        scale = 0.1;
        numbersToPlace = [];

        for (let i = 0; i < 7; i++) {
          const typeChoice = Math.floor(Math.random() * 3);

          if (typeChoice === 0) {
            // Natural number
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            numbersToPlace.push({
              id: `num-${i}`,
              value,
              display: value.toString(),
              type: "natural",
            });
          } else if (typeChoice === 1) {
            // Decimal (two decimal places)
            const value = Math.floor(Math.random() * max * 100) / 100;
            numbersToPlace.push({
              id: `num-${i}`,
              value,
              display: value.toFixed(2),
              type: "decimal",
            });
          } else {
            // Fractions (various denominators)
            const whole = Math.floor(Math.random() * (max - 1));
            const denominators = [2, 3, 4, 5, 8];
            const denom = denominators[Math.floor(Math.random() * denominators.length)];
            const numer = Math.floor(Math.random() * (denom - 1)) + 1;
            const value = whole + numer / denom;
            const [simpleNum, simpleDenom] = simplifyFraction(whole * denom + numer, denom);
            const actualNumer = whole > 0 ? simpleNum - (whole * simpleDenom) : simpleNum;
            numbersToPlace.push({
              id: `num-${i}`,
              value,
              display: whole > 0 ? `${whole} ${actualNumer}/${simpleDenom}` : `${simpleNum}/${simpleDenom}`,
              type: "fraction",
              fractionParts: {
                whole,
                numerator: actualNumer,
                denominator: simpleDenom,
              },
            });
          }
        }
        break;

      default:
        min = 0;
        max = 10;
        scale = 1;
        numbersToPlace = [];
    }

    return {
      min,
      max,
      numbers: numbersToPlace,
      scale,
    };
  };

  const startGame = (count: number, level: number) => {
    setMaxExercises(count);
    setDifficulty(level);
    const firstExercise = generateExercise(level);
    setCurrentExercise(firstExercise);
    setPlacedNumbers([]);
    setIsTimerRunning(true);
    setScore(0);
    setTotalQuestions(0);
    setCompletedExercises([]);
    setElapsedTime(0);
    setStreak(0);
    setIsGameComplete(false);
    setShowFeedback(false);
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

  const handleDragStart = (number: NumberItem) => {
    setDraggedNumber(number);
  };

  const handleDrop = (position: number) => {
    if (!draggedNumber || !currentExercise) return;

    // Snap to nearest grid position (magnetic effect)
    const snappedPosition = snapToGrid(position);

    // Remove the number from placed numbers if it was already placed
    const filteredPlaced = placedNumbers.filter((p) => p.number.id !== draggedNumber.id);

    // Add the new placement
    const newPlacement: PlacedNumber = {
      number: draggedNumber,
      position: snappedPosition,
      isCorrect: null,
    };

    setPlacedNumbers([...filteredPlaced, newPlacement]);
    setDraggedNumber(null);

    // Reset feedback when moving a number
    setShowFeedback(false);
  };

  const getAvailableNumbers = (): NumberItem[] => {
    if (!currentExercise) return [];
    const placedIds = new Set(placedNumbers.map((p) => p.number.id));
    return currentExercise.numbers.filter((num) => !placedIds.has(num.id));
  };

  // Calculate the number of divisions needed based on the numbers to place
  const calculateRequiredDivisions = (): number => {
    if (!currentExercise) return 10;

    let maxDivisions = 1;

    currentExercise.numbers.forEach((num) => {
      if (num.type === "decimal") {
        // For decimals, check decimal places
        const decimalPart = num.value - Math.floor(num.value);
        if (decimalPart !== 0) {
          const decimalStr = decimalPart.toFixed(10);
          const decimalPlaces = decimalStr.replace(/^0\./, '').replace(/0+$/, '').length;
          maxDivisions = Math.max(maxDivisions, Math.pow(10, decimalPlaces));
        }
      } else if (num.type === "fraction" && num.fractionParts) {
        // For fractions, use the denominator
        maxDivisions = Math.max(maxDivisions, num.fractionParts.denominator);
      }
    });

    // Cap at 100 divisions (0.01 precision) for visual clarity
    return Math.min(maxDivisions, 100);
  };

  // Snap position to nearest division with visual feedback
  const snapToGrid = (position: number): number => {
    if (!currentExercise) return position;

    const divisions = calculateRequiredDivisions();
    const totalDivisions = (currentExercise.max - currentExercise.min) * divisions;

    // Clamp position to valid range with small margin
    const clampedPosition = Math.max(0, Math.min(100, position));

    // Calculate the nearest grid position
    const gridIndex = Math.round((clampedPosition / 100) * totalDivisions);
    const snapPosition = (gridIndex / totalDivisions) * 100;

    // Ensure we stay within bounds
    return Math.max(0, Math.min(100, snapPosition));
  };

  // Component to render numbers with proper fraction formatting
  const renderNumber = (number: NumberItem) => {
    if (number.type === "fraction" && number.fractionParts) {
      const { whole, numerator, denominator } = number.fractionParts;
      return (
        <HStack spacing={1} align="center">
          {whole > 0 && (
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              {whole}
            </Text>
          )}
          <VStack spacing={0} align="center">
            <Text fontWeight="bold" fontSize="md" color="gray.800" lineHeight="1">
              {numerator}
            </Text>
            <Box width="100%" height="2px" bg="gray.800" />
            <Text fontWeight="bold" fontSize="md" color="gray.800" lineHeight="1">
              {denominator}
            </Text>
          </VStack>
        </HStack>
      );
    }
    return (
      <Text fontWeight="bold" fontSize="lg" color="gray.800">
        {number.display}
      </Text>
    );
  };

  const handleCheckAnswers = () => {
    if (!currentExercise || placedNumbers.length === 0) return;

    // With snap-to-grid, tolerance is half a division
    const divisions = calculateRequiredDivisions();
    const totalDivisions = (currentExercise.max - currentExercise.min) * divisions;
    const tolerance = (100 / totalDivisions) * 0.5;

    let correctCount = 0;

    const updatedPlacements = placedNumbers.map((placed) => {
      const expectedPosition = ((placed.number.value - currentExercise.min) / (currentExercise.max - currentExercise.min)) * 100;
      const isCorrect = Math.abs(placed.position - expectedPosition) <= tolerance;

      if (isCorrect) correctCount++;

      return {
        ...placed,
        isCorrect,
      };
    });

    setPlacedNumbers(updatedPlacements);
    setShowFeedback(true);

    const allPlaced = placedNumbers.length === currentExercise.numbers.length;

    if (allPlaced) {
      setTotalQuestions(totalQuestions + 1);

      if (correctCount === currentExercise.numbers.length) {
        setScore(score + 1);
        setStreak(streak + 1);

        toast({
          title: streak >= 2 ? `🎉 ${streak + 1} ${t("numberLine.inARow")}` : `✅ ${t("numberLine.perfect")}`,
          description: t("numberLine.allCorrect"),
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      } else {
        setStreak(0);

        toast({
          title: `${t("numberLine.score")}: ${correctCount}/${currentExercise.numbers.length}`,
          description: t("numberLine.someMistakes"),
          status: "warning",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      }

      const completedExercise: CompletedExercise = {
        numbers: currentExercise.numbers,
        correctCount,
        totalCount: currentExercise.numbers.length,
        timestamp: Date.now(),
      };
      setCompletedExercises([completedExercise, ...completedExercises]);

      // Check if game is complete
      if (maxExercises && totalQuestions + 1 >= maxExercises) {
        setIsTimerRunning(false);
        setIsGameComplete(true);

        // Save test result
        if (currentUser) {
          const finalScore = correctCount === currentExercise.numbers.length ? score + 1 : score;
          const finalTotal = totalQuestions + 1;
          const testResult = {
            testType: "number-line",
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
      } else {
        // Move to next exercise after a delay
        setTimeout(() => {
          const nextExercise = generateExercise(difficulty!);
          setCurrentExercise(nextExercise);
          setPlacedNumbers([]);
          setShowFeedback(false);
        }, 2500);
      }
    } else {
      toast({
        title: t("numberLine.notAllPlaced"),
        description: t("numberLine.placeAllNumbers"),
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Exercise count and difficulty selection screen
  if (!maxExercises || !difficulty) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8}>
          <HStack justify="center" spacing={4}>
            <Heading textAlign="center" color="purple.600" size="lg">
              {t("numberLine.title")}
            </Heading>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              {t("numberLine.badge")}
            </Badge>
          </HStack>

          {/* Question Count Selection */}
          {!tempCount && (
            <>
              <Text fontSize="xl" color="gray.600" textAlign="center" fontWeight="bold">
                {t("practicePage.selectQuestions")}
              </Text>

              <HStack spacing={4} flexWrap="wrap" justify="center">
                {[5, 10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    onClick={() => setTempCount(count)}
                    colorScheme="purple"
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

              <VStack spacing={4} align="stretch">
                {[
                  { level: 1, desc: t("numberLine.level1") },
                  { level: 2, desc: t("numberLine.level2") },
                  { level: 3, desc: t("numberLine.level3") },
                  { level: 4, desc: t("numberLine.level4") },
                  { level: 5, desc: t("numberLine.level5") },
                ].map(({ level, desc }) => (
                  <Button
                    key={level}
                    onClick={() => startGame(tempCount, level)}
                    colorScheme="purple"
                    variant="outline"
                    size="lg"
                    height="auto"
                    py={4}
                    _hover={{ transform: "scale(1.02)", bg: "purple.50" }}
                    transition="all 0.2s"
                  >
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold">
                        {t("practicePage.level")} {level}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {desc}
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </VStack>

              <Button
                onClick={() => setTempCount(null)}
                colorScheme="gray"
                variant="ghost"
              >
                ← {t("numberLine.back")}
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
              {percentage === 100
                ? t("numberLine.perfectScore")
                : percentage >= 80
                  ? t("numberLine.greatJob")
                  : percentage >= 60
                    ? t("numberLine.wellDone")
                    : t("numberLine.keepPracticing")}
            </Heading>
          </MotionBox>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            borderWidth={3}
            borderColor="purple.400"
            width="100%"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.700">
                {t("numberLine.testComplete")}
              </Heading>

              <HStack spacing={8} fontSize="3xl" fontWeight="bold">
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("numberLine.score")}</Text>
                  <Text color="purple.600">{score}/{totalQuestions}</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("numberLine.accuracy")}</Text>
                  <Text color="purple.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("numberLine.time")}</Text>
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
                setTempCount(null);
              }}
              colorScheme="purple"
              size="lg"
              flex={1}
            >
              {t("numberLine.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("numberLine.backToTests")}
            </Button>
          </HStack>
        </VStack>
      </Container>
    );
  }

  if (!currentExercise) return null;

  const availableNumbers = getAvailableNumbers();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack spacing={4}>
            <Heading color="purple.600" size="lg">
              {t("numberLine.title")}
            </Heading>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              {t("practicePage.difficultyLevel")} {difficulty}
            </Badge>
          </HStack>
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              ⏱️ {formatTime(elapsedTime)}
            </Badge>
            <Badge colorScheme="orange" fontSize="lg" px={4} py={2} borderRadius="full">
              🔥 {streak}
            </Badge>
          </HStack>
        </Flex>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("numberLine.progress")}: {totalQuestions}/{maxExercises}
            </Text>
            <Text fontWeight="bold">
              {t("numberLine.score")}: {score}/{totalQuestions}
            </Text>
          </Flex>
          <Progress
            value={maxExercises ? (totalQuestions / maxExercises) * 100 : 0}
            colorScheme="purple"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Instructions */}
        <Box bg="purple.50" p={4} borderRadius="lg" borderWidth={2} borderColor="purple.200">
          <Text fontSize="lg" fontWeight="bold" color="purple.700" textAlign="center">
            {t("numberLine.instruction")}
          </Text>
        </Box>

        {/* Number Line */}
        <MotionBox
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            borderWidth={3}
            borderColor="purple.400"
            shadow="xl"
          >
            <VStack spacing={6}>
              {/* Number line with drop zones */}
              <Box width="100%" position="relative" height="120px">
                {/* Main line */}
                <Box
                  position="absolute"
                  top="50%"
                  left="0"
                  right="0"
                  height="4px"
                  bg="purple.500"
                  transform="translateY(-50%)"
                />

                {/* Inner division tick marks (dynamic based on numbers) */}
                {(() => {
                  const divisions = calculateRequiredDivisions();
                  if (divisions <= 1) return null;

                  const totalDivisions = (currentExercise.max - currentExercise.min) * divisions;

                  // For many divisions, show only every 5th or 10th mark
                  const tickInterval = divisions > 20 ? 10 : divisions > 10 ? 5 : 1;

                  return Array.from({ length: totalDivisions + 1 }, (_, i) => {
                    const position = (i / totalDivisions) * 100;
                    const isMainTick = i % divisions === 0;

                    if (isMainTick) return null; // Skip main ticks, we'll draw them separately

                    // Show only every tickInterval marks to avoid clutter
                    if (i % tickInterval !== 0) return null;

                    return (
                      <Box
                        key={`inner-${i}`}
                        position="absolute"
                        left={`${position}%`}
                        top="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Box
                          width="1px"
                          height="10px"
                          bg="purple.300"
                          mb={2}
                        />
                      </Box>
                    );
                  });
                })()}

                {/* Main tick marks and labels */}
                {Array.from({ length: 11 }, (_, i) => {
                  const position = (i / 10) * 100;
                  const value = currentExercise.min + (i / 10) * (currentExercise.max - currentExercise.min);

                  return (
                    <Box
                      key={i}
                      position="absolute"
                      left={`${position}%`}
                      top="50%"
                      transform="translate(-50%, -50%)"
                    >
                      <Box
                        width="3px"
                        height="20px"
                        bg="purple.600"
                        mb={2}
                      />
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color="purple.700"
                        position="absolute"
                        top="30px"
                        left="50%"
                        transform="translateX(-50%)"
                        whiteSpace="nowrap"
                      >
                        {value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}
                      </Text>
                    </Box>
                  );
                })}

                {/* Drop zone overlay - extended slightly beyond edges */}
                <Box
                  position="absolute"
                  top="-20px"
                  left="-10px"
                  right="-10px"
                  bottom="-20px"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left + 10; // Adjust for extended left
                    const adjustedWidth = rect.width - 20; // Account for both sides
                    const position = ((x - 10) / adjustedWidth) * 100;
                    handleDrop(position);
                  }}
                />

                {/* Placed numbers */}
                {placedNumbers.map((placed) => {
                  const bgColor = showFeedback
                    ? placed.isCorrect
                      ? "green.100"
                      : "red.100"
                    : placed.number.type === "natural"
                      ? "blue.100"
                      : placed.number.type === "decimal"
                        ? "orange.100"
                        : "pink.100";

                  const borderColor = showFeedback
                    ? placed.isCorrect
                      ? "green.500"
                      : "red.500"
                    : placed.number.type === "natural"
                      ? "blue.500"
                      : placed.number.type === "decimal"
                        ? "orange.500"
                        : "pink.500";

                  return (
                    <Box
                      key={placed.number.id}
                      position="absolute"
                      left={`${placed.position}%`}
                      top="50%"
                      transform="translate(-50%, -50%)"
                      draggable={true}
                      onDragStart={() => handleDragStart(placed.number)}
                      cursor="grab"
                      _active={{ cursor: "grabbing" }}
                    >
                      <VStack spacing={0} align="center">
                        <Box
                          bg={bgColor}
                          borderWidth={3}
                          borderColor={borderColor}
                          borderRadius="lg"
                          px={4}
                          py={2}
                          shadow="lg"
                          position="relative"
                          top="-60px"
                          whiteSpace="nowrap"
                        >
                          {renderNumber(placed.number)}
                          {showFeedback && placed.isCorrect !== null && (
                            <Text fontSize="2xl" position="absolute" top="-10px" right="-10px">
                              {placed.isCorrect ? "✓" : "✗"}
                            </Text>
                          )}
                        </Box>
                        {/* Triangle pointer */}
                        <Box
                          position="relative"
                          top="-60px"
                          width="0"
                          height="0"
                          borderLeft="8px solid transparent"
                          borderRight="8px solid transparent"
                          borderTop={`12px solid ${borderColor}`}
                        />
                      </VStack>
                    </Box>
                  );
                })}

                {/* Show correct positions for wrong answers */}
                {showFeedback && placedNumbers.map((placed) => {
                  if (placed.isCorrect || !currentExercise) return null;

                  const correctPosition = ((placed.number.value - currentExercise.min) / (currentExercise.max - currentExercise.min)) * 100;

                  return (
                    <Box
                      key={`correct-${placed.number.id}`}
                      position="absolute"
                      left={`${correctPosition}%`}
                      top="50%"
                      transform="translate(-50%, -50%)"
                    >
                      <VStack spacing={0} align="center">
                        <Box
                          bg="green.50"
                          borderWidth={2}
                          borderColor="green.400"
                          borderRadius="lg"
                          borderStyle="dashed"
                          px={3}
                          py={1}
                          position="relative"
                          top="20px"
                          opacity={0.8}
                        >
                          <Text fontSize="xs" color="green.700" fontWeight="bold">
                            {t("numberLine.correctPosition")}
                          </Text>
                        </Box>
                        {/* Triangle pointer pointing up */}
                        <Box
                          position="relative"
                          top="20px"
                          width="0"
                          height="0"
                          borderLeft="6px solid transparent"
                          borderRight="6px solid transparent"
                          borderBottom="10px solid"
                          borderBottomColor="green.400"
                        />
                      </VStack>
                    </Box>
                  );
                })}
              </Box>

              {/* Available numbers to drag */}
              <Box width="100%" pt={8}>
                <Text fontSize="md" fontWeight="bold" color="gray.600" mb={3}>
                  {t("numberLine.dragNumbers")}
                </Text>
                <Flex gap={3} flexWrap="wrap" justify="center">
                  {availableNumbers.map((number) => (
                    <MotionBox
                      key={number.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Box
                        draggable
                        onDragStart={() => handleDragStart(number)}
                        cursor="grab"
                        _active={{ cursor: "grabbing" }}
                        bg={
                          number.type === "natural"
                            ? "blue.100"
                            : number.type === "decimal"
                              ? "orange.100"
                              : "pink.100"
                        }
                        borderWidth={3}
                        borderColor={
                          number.type === "natural"
                            ? "blue.500"
                            : number.type === "decimal"
                              ? "orange.500"
                              : "pink.500"
                        }
                        borderRadius="lg"
                        px={6}
                        py={3}
                        shadow="md"
                        _hover={{ shadow: "xl" }}
                        transition="all 0.2s"
                      >
                        {renderNumber(number)}
                      </Box>
                    </MotionBox>
                  ))}
                </Flex>
              </Box>

              {/* Check button */}
              <Button
                onClick={handleCheckAnswers}
                colorScheme="purple"
                size="lg"
                fontSize="xl"
                px={12}
                py={6}
                isDisabled={placedNumbers.length === 0}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("numberLine.checkAnswer")}
              </Button>
            </VStack>
          </Box>
        </MotionBox>

        {/* Legend */}
        <HStack spacing={6} justify="center" flexWrap="wrap">
          <HStack>
            <Box w="20px" h="20px" bg="blue.500" borderRadius="md" />
            <Text fontSize="sm" color="gray.600">{t("numberLine.naturalNumbers")}</Text>
          </HStack>
          <HStack>
            <Box w="20px" h="20px" bg="orange.500" borderRadius="md" />
            <Text fontSize="sm" color="gray.600">{t("numberLine.decimals")}</Text>
          </HStack>
          <HStack>
            <Box w="20px" h="20px" bg="pink.500" borderRadius="md" />
            <Text fontSize="sm" color="gray.600">{t("numberLine.fractions")}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Container>
  );
}

