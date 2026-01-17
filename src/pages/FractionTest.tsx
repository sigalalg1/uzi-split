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
  Progress,
  useToast,
  Badge,
  Flex,
  Checkbox,
  SimpleGrid,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

// Helper component to render fractions vertically
const FractionDisplay: React.FC<{ value: string }> = ({ value }) => {
  // Check if it's a fraction (contains /)
  if (value.includes("/")) {
    const [numerator, denominator] = value.split("/");
    return (
      <VStack spacing={0}>
        <Text fontSize="lg" fontWeight="bold" lineHeight="1">
          {numerator}
        </Text>
        <Box width="100%" height="1.5px" bg="gray.700" />
        <Text fontSize="lg" fontWeight="bold" lineHeight="1">
          {denominator}
        </Text>
      </VStack>
    );
  }
  // For decimals and percentages, display normally
  return (
    <Text fontSize="lg" fontWeight="bold">
      {value}
    </Text>
  );
};

type QuestionOption = {
  value: string;
  isCorrect: boolean;
};

type Question = {
  shadedCount: number;
  totalCount: number;
  percentage: number;
  options: QuestionOption[];
};

type CompletedQuestion = Question & {
  selectedOptions: string[];
  isCorrect: boolean;
  timestamp: number;
};

export default function FractionTest() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<CompletedQuestion[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [tempCount, setTempCount] = useState<number | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const generateQuestion = (level: number): Question => {
    // Generate percentages based on difficulty level
    let percentages: number[];

    switch (level) {
      case 1: // Very easy: 25, 50, 75
        percentages = [25, 50, 75];
        break;
      case 2: // Easy: common halves and quarters
        percentages = [10, 20, 25, 50, 75, 80];
        break;
      case 3: // Medium: include more variety
        percentages = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80];
        break;
      case 4: // Hard: include thirds
        percentages = [10, 15, 20, 25, 30, 33, 40, 50, 60, 66, 70, 75, 80, 85];
        break;
      case 5: // Very hard: include more complex fractions
        percentages = [5, 10, 12, 15, 20, 25, 30, 33, 37, 40, 50, 60, 62, 66, 70, 75, 80, 85, 87, 90];
        break;
      default:
        percentages = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80];
    }

    const percentage = percentages[Math.floor(Math.random() * percentages.length)];
    const totalCount = 100;
    const shadedCount = percentage;

    // Generate correct options
    const correctFractions: string[] = [];
    const correctDecimals: string[] = [];
    const correctPercentages: string[] = [];

    // Main fraction
    const mainFraction = `${shadedCount}/${totalCount}`;
    correctFractions.push(mainFraction);

    // Simplified fraction
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(shadedCount, totalCount);
    const simplifiedNum = shadedCount / divisor;
    const simplifiedDen = totalCount / divisor;
    correctFractions.push(`${simplifiedNum}/${simplifiedDen}`);

    // Additional equivalent fractions
    if (simplifiedNum * 2 <= 20 && simplifiedDen * 2 <= 50) {
      correctFractions.push(`${simplifiedNum * 2}/${simplifiedDen * 2}`);
    }
    if (simplifiedNum * 3 <= 20 && simplifiedDen * 3 <= 50) {
      correctFractions.push(`${simplifiedNum * 3}/${simplifiedDen * 3}`);
    }

    // Correct decimal
    correctDecimals.push((shadedCount / totalCount).toFixed(2).replace(/\.?0+$/, ""));

    // Correct percentage
    correctPercentages.push(`${percentage}%`);

    // Generate incorrect options
    const incorrectFractions: string[] = [];
    const incorrectDecimals: string[] = [];
    const incorrectPercentages: string[] = [];

    // Incorrect fractions (wrong numerator or denominator)
    incorrectFractions.push(`${shadedCount + 10}/${totalCount + 30}`);
    incorrectFractions.push(`${Math.min(shadedCount + 5, 95)}/${totalCount - 10}`);

    // Incorrect decimals
    const wrongDecimal1 = (shadedCount / totalCount / 10).toFixed(2);
    const wrongDecimal2 = (shadedCount / totalCount * 10).toFixed(2);
    if (parseFloat(wrongDecimal1) !== shadedCount / totalCount) {
      incorrectDecimals.push(wrongDecimal1);
    }
    if (parseFloat(wrongDecimal2) <= 1) {
      incorrectDecimals.push(wrongDecimal2);
    }

    // Incorrect percentages
    incorrectPercentages.push(`${Math.min(percentage + 10, 100)}%`);
    incorrectPercentages.push(`${Math.max(percentage - 15, 1)}%`);

    // Combine all options
    const allOptions: QuestionOption[] = [
      ...correctFractions.map(v => ({ value: v, isCorrect: true })),
      ...correctDecimals.map(v => ({ value: v, isCorrect: true })),
      ...correctPercentages.map(v => ({ value: v, isCorrect: true })),
      ...incorrectFractions.map(v => ({ value: v, isCorrect: false })),
      ...incorrectDecimals.map(v => ({ value: v, isCorrect: false })),
      ...incorrectPercentages.map(v => ({ value: v, isCorrect: false })),
    ];

    // Shuffle options
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    return {
      shadedCount,
      totalCount,
      percentage,
      options: shuffledOptions,
    };
  };

  const startGame = (count: number, level: number) => {
    setMaxQuestions(count);
    setDifficulty(level);
    setCurrentQuestion(generateQuestion(level));
    setIsTimerRunning(true);
    setScore(0);
    setTotalQuestions(0);
    setCompletedQuestions([]);
    setElapsedTime(0);
    setIsGameComplete(false);
    setSelectedOptions(new Set());
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

  const toggleOption = (value: string) => {
    if (showFeedback) return;

    const newSelected = new Set(selectedOptions);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelectedOptions(newSelected);
  };

  const handleSubmit = () => {
    if (!currentQuestion || selectedOptions.size === 0) return;

    const correctOptions = currentQuestion.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.value);

    const selectedArray = Array.from(selectedOptions);

    // Check if all correct options are selected and no incorrect ones
    const allCorrectSelected = correctOptions.every(opt => selectedArray.includes(opt));
    const noIncorrectSelected = selectedArray.every(opt =>
      correctOptions.includes(opt)
    );

    const isCorrect = allCorrectSelected && noIncorrectSelected;
    setShowFeedback(true);
    setTotalQuestions(totalQuestions + 1);

    const completedQuestion: CompletedQuestion = {
      ...currentQuestion,
      selectedOptions: selectedArray,
      isCorrect,
      timestamp: Date.now(),
    };
    setCompletedQuestions([completedQuestion, ...completedQuestions]);

    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: `✅ ${t("fractionTest.perfect")}`,
        description: t("fractionTest.perfectDesc"),
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } else {
      toast({
        title: `❌ ${t("fractionTest.notQuite")}`,
        description: t("fractionTest.notQuiteDesc"),
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    // Check if game is complete
    if (maxQuestions && totalQuestions + 1 >= maxQuestions) {
      setIsTimerRunning(false);
      setIsGameComplete(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedOptions(new Set());
      }, 2000);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedOptions(new Set());
        setCurrentQuestion(generateQuestion(difficulty!));
      }, 2000);
    }
  };

  // Question count and difficulty selection screen
  if (!maxQuestions || !difficulty) {
    return (
      <Container maxW="container.md" py={6}>
        <VStack spacing={6}>
          <HStack justify="center" spacing={4}>
            <Heading textAlign="center" color="purple.600" size="md">
              {t("fractionTest.title")}
            </Heading>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              {t("practicePage.subjects.fractions")}
            </Badge>
          </HStack>

          {/* Question Count Selection */}
          {!tempCount && (
            <>
              <Text fontSize="lg" color="gray.600" textAlign="center" fontWeight="bold">
                {t("practicePage.selectQuestions")}
              </Text>

              <HStack spacing={3} flexWrap="wrap" justify="center">
                {[5, 10, 15, 20, 25].map((count) => (
                  <Button
                    key={count}
                    onClick={() => setTempCount(count)}
                    colorScheme="purple"
                    size="md"
                    fontSize="xl"
                    width="80px"
                    height="80px"
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
              <Text fontSize="lg" color="gray.600" textAlign="center" fontWeight="bold">
                {t("practicePage.selectDifficulty")}
              </Text>

              <HStack spacing={3} flexWrap="wrap" justify="center">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    onClick={() => startGame(tempCount, level)}
                    colorScheme="purple"
                    variant="outline"
                    size="md"
                    fontSize="2xl"
                    width="80px"
                    height="80px"
                    _hover={{ transform: "scale(1.05)", bg: "purple.50" }}
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
                size="sm"
              >
                ← {t("fractionTest.back")}
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
              {percentage === 100 ? t("fractionTest.perfectScore") : percentage >= 80 ? t("fractionTest.greatJob") : percentage >= 60 ? t("fractionTest.wellDone") : t("fractionTest.keepPracticing")}
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
                {t("fractionTest.testComplete")}
              </Heading>

              <HStack spacing={8} fontSize="3xl" fontWeight="bold">
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("fractionTest.score")}</Text>
                  <Text color="purple.600">{score}/{totalQuestions}</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("fractionTest.accuracy")}</Text>
                  <Text color="green.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">{t("fractionTest.time")}</Text>
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
                setMaxQuestions(null); 
                setDifficulty(null);
                setSelectedOptions(new Set());
                setTempCount(null);
              }}
              colorScheme="purple"
              size="lg"
              flex={1}
            >
              {t("fractionTest.startNew")}
            </Button>
            <Button
              onClick={() => navigate("/practice")}
              colorScheme="gray"
              variant="outline"
              size="lg"
              flex={1}
            >
              {t("fractionTest.backToTests")}
            </Button>
          </HStack>
        </VStack>
      </Container>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Container maxW="container.lg" py={4}>
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <Flex justify="flex-end" align="center" wrap="wrap" gap={2}>
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              ⏱️ {formatTime(elapsedTime)}
            </Badge>
          </HStack>
        </Flex>

        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color="purple.600" size="md">
            {t("fractionTest.title")}
          </Heading>
          <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
            {t("practicePage.difficultyLevel")} {difficulty}
          </Badge>
        </HStack>

        {/* Progress */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {t("fractionTest.progress")}: {totalQuestions}/{maxQuestions}
            </Text>
            <Text fontWeight="bold">
              {t("fractionTest.score")}: {score}/{totalQuestions} ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
            </Text>
          </Flex>
          <Progress
            value={maxQuestions ? (totalQuestions / maxQuestions) * 100 : 0}
            colorScheme="purple"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Question Card */}
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${currentQuestion.shadedCount}-${currentQuestion.totalCount}-${totalQuestions}`}
          transition={{ duration: 0.3 }}
        >
          <Box
            bg="white"
            borderWidth={3}
            borderColor="purple.400"
            borderRadius="2xl"
            p={4}
            shadow="2xl"
          >
            <VStack spacing={3}>
              <Text fontSize="md" fontWeight="bold" color="gray.700">
                {t("fractionTest.squareDivided", { total: currentQuestion.totalCount })}
              </Text>

              {/* Visual Grid */}
              <Box
                p={2}
                bg="gray.50"
                borderRadius="lg"
                borderWidth={2}
                borderColor="gray.300"
              >
                <SimpleGrid columns={10} spacing={0.5}>
                  {Array.from({ length: currentQuestion.totalCount }).map((_, index) => (
                    <Box
                      key={index}
                      width="20px"
                      height="20px"
                      bg={index < currentQuestion.shadedCount ? "purple.500" : "white"}
                      borderWidth={1}
                      borderColor="gray.300"
                    />
                  ))}
                </SimpleGrid>
              </Box>

              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                {t("fractionTest.whichRepresent")}
                <br />
                <Text as="span" color="purple.600">{t("fractionTest.selectAll")}</Text>
              </Text>

              {/* Options */}
              <SimpleGrid columns={[2, 3, 4]} spacing={2} width="100%">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptions.has(option.value);
                  const showCorrect = showFeedback && option.isCorrect;
                  const showIncorrect = showFeedback && isSelected && !option.isCorrect;

                  return (
                    <Box
                      key={option.value}
                      p={2}
                      borderRadius="lg"
                      borderWidth={2}
                      borderColor={
                        showCorrect ? "green.400" :
                          showIncorrect ? "red.400" :
                            isSelected ? "purple.400" : "gray.300"
                      }
                      bg={
                        showCorrect ? "green.50" :
                          showIncorrect ? "red.50" :
                            isSelected ? "purple.50" : "white"
                      }
                      cursor={showFeedback ? "default" : "pointer"}
                      onClick={() => toggleOption(option.value)}
                      transition="all 0.2s"
                      _hover={!showFeedback ? { transform: "scale(1.05)", shadow: "md" } : {}}
                      minHeight="70px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <VStack spacing={1}>
                        <HStack spacing={1}>
                          <Checkbox
                            isChecked={isSelected || (showFeedback && option.isCorrect)}
                            isDisabled={showFeedback}
                            colorScheme="purple"
                            size="sm"
                          />
                          {showCorrect && <Text fontSize="md">✓</Text>}
                          {showIncorrect && <Text fontSize="md">✗</Text>}
                        </HStack>
                        <FractionDisplay value={option.value} />
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                colorScheme="purple"
                size="md"
                fontSize="lg"
                px={8}
                py={4}
                isDisabled={selectedOptions.size === 0 || showFeedback}
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                {t("fractionTest.checkAnswers")}
              </Button>
            </VStack>
          </Box>
        </MotionBox>
      </VStack>
    </Container>
  );
}


