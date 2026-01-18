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
import { TestDefinition } from "../config/types";
import * as generators from "../generators/mathGenerators";
import { validators } from "../generators/validators";
import {
  CompletedExercise,
  Exercise,
  NumberExercise,
  CompareNumbersExercise,
  SequenceExercise,
  PlaceValueExercise,
  FractionExercise,
} from "../config/types";

const MotionBox = motion(Box);

interface MathTestProps {
  testConfig: TestDefinition;
}

export default function MathTest({ testConfig }: MathTestProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
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
  const [tempDifficulty, setTempDifficulty] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());

  // Get generator and validator functions
  const generatorFn = generators[testConfig.config.generator as keyof typeof generators];
  const validatorFn = validators[testConfig.config.validator as keyof typeof validators];

  const generateExercise = (level: number, existingQuestions: Set<string> = new Set()): Exercise => {
    if (!generatorFn || typeof generatorFn !== "function") {
      throw new Error(`Generator not found: ${testConfig.config.generator}`);
    }
    return generatorFn(level, existingQuestions) as Exercise;
  };

  const validateAnswer = (userAns: string | number, correctAns: string | number): boolean => {
    if (!validatorFn || typeof validatorFn !== "function") {
      throw new Error(`Validator not found: ${testConfig.config.validator}`);
    }
    return validatorFn(userAns, correctAns);
  };

  const startGame = () => {
    if (!tempCount || !tempDifficulty) return;
    
    setMaxExercises(tempCount);
    setDifficulty(tempDifficulty);
    setHasStarted(true);
    const newUsedQuestions = new Set<string>();
    setUsedQuestions(newUsedQuestions);
    const firstExercise = generateExercise(tempDifficulty, newUsedQuestions);

    // Add question key to used questions
    const questionKey = getQuestionKey(firstExercise);
    newUsedQuestions.add(questionKey);
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

  // Get question key for tracking duplicates
  const getQuestionKey = (exercise: Exercise): string => {
    if ("comparison" in exercise) {
      const compareEx = exercise as CompareNumbersExercise;
      return `compare:${compareEx.num1},${compareEx.num2},${compareEx.comparison}`;
    }
    if ("sequence" in exercise) {
      const seqEx = exercise as SequenceExercise;
      return `sequence:${seqEx.sequence.join(",")},${seqEx.missingIndex}`;
    }
    if ("place" in exercise) {
      const placeEx = exercise as PlaceValueExercise;
      return `placevalue:${placeEx.number},${placeEx.place}`;
    }
    if ("num1" in exercise && "num2" in exercise && !("comparison" in exercise)) {
      return `${exercise.num1}${testConfig.config.operation}${exercise.num2}`;
    }
    if ("expression" in exercise) {
      return exercise.expression;
    }
    if ("targetNumber" in exercise) {
      return `${exercise.min}-${exercise.max}:${exercise.targetNumber}`;
    }
    if ("numerator1" in exercise) {
      return `${exercise.numerator1}/${exercise.denominator1}+${exercise.numerator2}/${exercise.denominator2}`;
    }
    return Math.random().toString();
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

  // Pre-populate with defaults from settings
  useEffect(() => {
    if (settings.defaultTestCount !== null && tempCount === null && !hasStarted) {
      setTempCount(settings.defaultTestCount);
    }
    if (settings.defaultDifficulty !== null && tempDifficulty === null && !hasStarted) {
      setTempDifficulty(settings.defaultDifficulty);
    }
  }, [settings.defaultTestCount, settings.defaultDifficulty, hasStarted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!currentExercise || userAnswer === "") return;

    const isAnswerCorrect = validateAnswer(userAnswer, currentExercise.answer);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setTotalQuestions(totalQuestions + 1);

    // Add to completed exercises
    const completedExercise: CompletedExercise = {
      ...currentExercise,
      userAnswer: userAnswer,
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

      // Save test result to localStorage
      if (currentUser) {
        const finalScore = isAnswerCorrect ? score + 1 : score;
        const finalTotal = totalQuestions + 1;
        const testResult = {
          testType: testConfig.config.testType,
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
      // Move to next question after a delay
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setUserAnswer("");
        const nextExercise = generateExercise(difficulty!, usedQuestions);
        const nextKey = getQuestionKey(nextExercise);
        setUsedQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.add(nextKey);
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

  // Render exercise based on type
  const renderExercise = () => {
    if (!currentExercise) return null;

    // Compare Numbers Exercise (check before general num1/num2)
    if ("comparison" in currentExercise && "num1" in currentExercise && "num2" in currentExercise) {
      const compareEx = currentExercise as CompareNumbersExercise;
      const questionText = compareEx.comparison === "greater"
        ? t("practicePage.naturalNumbers.whichNumberGreater")
        : t("practicePage.naturalNumbers.whichNumberSmaller");

      const handleNumberClick = (selectedNumber: number) => {
        if (showFeedback) return; // Don't allow clicking during feedback
        setUserAnswer(selectedNumber.toString());
        // Trigger submit automatically after selection
        setTimeout(() => {
          const isAnswerCorrect = validateAnswer(selectedNumber.toString(), currentExercise.answer);
          setIsCorrect(isAnswerCorrect);
          setShowFeedback(true);
          setTotalQuestions(totalQuestions + 1);

          const completedExercise: CompletedExercise = {
            ...currentExercise,
            userAnswer: selectedNumber.toString(),
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

            if (currentUser) {
              const finalScore = isAnswerCorrect ? score + 1 : score;
              const finalTotal = totalQuestions + 1;
              const testResult = {
                testType: testConfig.config.testType,
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
              const nextKey = getQuestionKey(nextExercise);
              setUsedQuestions((prev) => {
                const newSet = new Set(prev);
                newSet.add(nextKey);
                return newSet;
              });
              setCurrentExercise(nextExercise);
            }, 1500);
          }
        }, 100);
      };

      return (
        <VStack spacing={8}>
          <Text fontSize="3xl" fontWeight="bold" color="teal.600">
            {questionText}
          </Text>
          <HStack spacing={12} fontSize="8xl" fontWeight="bold">
            <Button
              onClick={() => handleNumberClick(compareEx.num1)}
              disabled={showFeedback}
              variant="ghost"
              size="lg"
              height="auto"
              padding="2rem"
              _hover={{
                bg: showFeedback ? "transparent" : "blue.50",
                transform: showFeedback ? "none" : "scale(1.1)",
              }}
              _active={{
                bg: "blue.100",
              }}
              cursor={showFeedback ? "not-allowed" : "pointer"}
              bg={userAnswer === compareEx.num1.toString() && showFeedback
                ? isCorrect ? "green.100" : "red.100"
                : "transparent"}
            >
              <MotionBox
                animate={showFeedback ? {} : { scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: showFeedback ? 0 : Infinity, repeatDelay: 2 }}
              >
                <Text fontSize="9xl" color="blue.500">{compareEx.num1}</Text>
              </MotionBox>
            </Button>

            <Text color="gray.400" fontSize="6xl">{t("practicePage.naturalNumbers.vs")}</Text>

            <Button
              onClick={() => handleNumberClick(compareEx.num2)}
              disabled={showFeedback}
              variant="ghost"
              size="lg"
              height="auto"
              padding="2rem"
              _hover={{
                bg: showFeedback ? "transparent" : "purple.50",
                transform: showFeedback ? "none" : "scale(1.1)",
              }}
              _active={{
                bg: "purple.100",
              }}
              cursor={showFeedback ? "not-allowed" : "pointer"}
              bg={userAnswer === compareEx.num2.toString() && showFeedback
                ? isCorrect ? "green.100" : "red.100"
                : "transparent"}
            >
              <MotionBox
                animate={showFeedback ? {} : { scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: showFeedback ? 0 : Infinity, repeatDelay: 2, delay: 0.3 }}
              >
                <Text fontSize="9xl" color="purple.500">{compareEx.num2}</Text>
              </MotionBox>
            </Button>
          </HStack>
        </VStack>
      );
    }

    // Sequence Exercise
    if ("sequence" in currentExercise) {
      const seqEx = currentExercise as SequenceExercise;
      return (
        <VStack spacing={8}>
          <Text fontSize="3xl" fontWeight="bold" color="teal.600">
            {t("practicePage.naturalNumbers.findMissingInSequence")}
          </Text>
          <HStack spacing={6} fontSize="6xl" fontWeight="bold">
            {seqEx.sequence.map((num, idx) => (
              <React.Fragment key={idx}>
                {idx === seqEx.missingIndex ? (
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t("practicePage.naturalNumbers.yourAnswer")}
                    fontSize="2xl"
                    fontWeight="bold"
                    textAlign="center"
                    width="250px"
                    height="auto"
                    padding="0.5rem"
                    autoFocus
                    type="number"
                    borderWidth={3}
                    borderColor="teal.400"
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 3px rgba(45, 212, 191, 0.3)",
                    }}
                    disabled={showFeedback}
                  />
                ) : (
                  <Text color="blue.500">{num}</Text>
                )}
                {idx < seqEx.sequence.length - 1 && <Text color="gray.400">,</Text>}
              </React.Fragment>
            ))}
          </HStack>
        </VStack>
      );
    }

    // Place Value Exercise
    if ("place" in currentExercise) {
      const placeEx = currentExercise as PlaceValueExercise;
      const placeKey = placeEx.place;
      const placeName = t(`practicePage.naturalNumbers.${placeKey}`);

      return (
        <VStack spacing={8}>
          <Text fontSize="3xl" fontWeight="bold" color="teal.600">
            {t("practicePage.naturalNumbers.whatIsDigit", { place: placeName })}
          </Text>
          <MotionBox
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Text fontSize="9xl" fontWeight="bold" color="blue.500">
              {placeEx.number}
            </Text>
          </MotionBox>
          <HStack spacing={4} fontSize="4xl">
            <Text color="gray.600" fontWeight="bold">
              {placeName} =
            </Text>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("practicePage.naturalNumbers.yourAnswer")}
              fontSize="6xl"
              fontWeight="bold"
              textAlign="center"
              width="200px"
              height="auto"
              padding="0.5rem"
              autoFocus
              type="number"
              borderWidth={3}
              borderColor="teal.400"
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 3px rgba(45, 212, 191, 0.3)",
              }}
              disabled={showFeedback}
            />
          </HStack>
        </VStack>
      );
    }

    // Expression Exercise (Order of Operations)
    if ("expression" in currentExercise) {
      return (
        <VStack spacing={6}>
          <Text fontSize="6xl" fontWeight="bold" color="blue.500">
            {currentExercise.expression}
          </Text>
          <HStack spacing={4} fontSize="6xl">
            <Text color="gray.600">=</Text>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="?"
              fontSize="6xl"
              fontWeight="bold"
              textAlign="center"
              width="300px"
              height="auto"
              padding="0.5rem"
              autoFocus
              type="number"
              borderWidth={3}
              borderColor="blue.400"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 3px rgba(251, 146, 60, 0.3)",
              }}
              disabled={showFeedback}
            />
          </HStack>
        </VStack>
      );
    }

    // Standard Number Exercise (addition, subtraction, multiplication)
    if ("num1" in currentExercise && "num2" in currentExercise) {
      const numEx = currentExercise as NumberExercise;
      const operation = testConfig.config.operation;

      // Translate operation if it's a word (like "lcd")
      const displayOperation = ["+", "-", "×", "÷", "="].includes(operation)
        ? operation
        : t(`common.${operation}`, operation);

      return (
        <HStack spacing={8} fontSize="8xl" fontWeight="bold">
          <MotionBox
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Text color="blue.500">{numEx.num1}</Text>
          </MotionBox>

          <Text color="gray.600" fontSize={displayOperation.length > 2 ? "4xl" : "8xl"}>
            {displayOperation}
          </Text>

          <MotionBox
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3, delay: 0.2 }}
          >
            <Text color="purple.500">{numEx.num2}</Text>
          </MotionBox>

          <Text color="gray.600">=</Text>

          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="?"
            fontSize="8xl"
            fontWeight="bold"
            textAlign="center"
            width="300px"
            height="auto"
            padding="0.5rem"
            autoFocus
            type="number"
            borderWidth={3}
            borderColor="blue.400"
            _focus={{
              borderColor: "blue.500",
              boxShadow: "0 0 0 3px rgba(251, 146, 60, 0.3)",
            }}
            disabled={showFeedback}
          />
        </HStack>
      );
    }

    // Fraction Exercise
    if ("numerator1" in currentExercise && "denominator1" in currentExercise) {
      const fractionEx = currentExercise as FractionExercise;
      return (
        <VStack spacing={8}>
          <HStack spacing={8} fontSize="6xl" fontWeight="bold">
            {/* First Fraction */}
            <VStack spacing={1}>
              <Text color="blue.500">{fractionEx.numerator1}</Text>
              <Box width="60px" height="4px" bg="gray.600" />
              <Text color="blue.500">{fractionEx.denominator1}</Text>
            </VStack>

            {/* Operation */}
            {fractionEx.operation && (
              <Text color="gray.600" fontSize="8xl">{fractionEx.operation}</Text>
            )}

            {/* Second Fraction */}
            {fractionEx.numerator2 !== undefined && (
              <VStack spacing={1}>
                <Text color="purple.500">{fractionEx.numerator2}</Text>
                <Box width="60px" height="4px" bg="gray.600" />
                <Text color="purple.500">{fractionEx.denominator2}</Text>
              </VStack>
            )}

            {/* Equals */}
            <Text color="gray.600" fontSize="8xl">=</Text>

            {/* Answer Input - Two separate inputs for numerator and denominator */}
            <VStack spacing={1}>
              <Input
                value={userAnswer.split("/")[0] || ""}
                onChange={(e) => {
                  const denom = userAnswer.split("/")[1] || "";
                  setUserAnswer(`${e.target.value}/${denom}`);
                }}
                placeholder="?"
                fontSize="6xl"
                fontWeight="bold"
                textAlign="center"
                width="150px"
                height="auto"
                padding="0.5rem"
                type="number"
                borderWidth={3}
                borderColor="green.400"
                _focus={{
                  borderColor: "green.500",
                  boxShadow: "0 0 0 3px rgba(72, 187, 120, 0.3)",
                }}
                disabled={showFeedback}
              />
              <Box width="150px" height="4px" bg="gray.600" />
              <Input
                value={userAnswer.split("/")[1] || ""}
                onChange={(e) => {
                  const numer = userAnswer.split("/")[0] || "";
                  setUserAnswer(`${numer}/${e.target.value}`);
                }}
                onKeyPress={handleKeyPress}
                placeholder="?"
                fontSize="6xl"
                fontWeight="bold"
                textAlign="center"
                width="150px"
                height="auto"
                padding="0.5rem"
                autoFocus
                type="number"
                borderWidth={3}
                borderColor="green.400"
                _focus={{
                  borderColor: "green.500",
                  boxShadow: "0 0 0 3px rgba(72, 187, 120, 0.3)",
                }}
                disabled={showFeedback}
              />
            </VStack>
          </HStack>
        </VStack>
      );
    }

    // Add more exercise type renderers as needed
    return (
      <VStack spacing={6}>
        <Text fontSize="4xl" fontWeight="bold" color="blue.500">
          {JSON.stringify(currentExercise)}
        </Text>
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="?"
          fontSize="4xl"
          fontWeight="bold"
          textAlign="center"
          width="300px"
          height="auto"
          padding="0.5rem"
          autoFocus
          borderWidth={3}
          borderColor="blue.400"
          disabled={showFeedback}
        />
      </VStack>
    );
  };

  // Exercise count and difficulty selection screen
  if (!hasStarted) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} dir="ltr">
          <HStack justify="center" spacing={4}>
            <Heading textAlign="center" color={`${testConfig.config.testType === "addition" ? "blue" : testConfig.config.testType === "subtraction" ? "pink" : "red"}.600`} size="lg">
              {t(testConfig.i18nKey)}
            </Heading>
            <Badge colorScheme={testConfig.config.testType === "addition" ? "blue" : testConfig.config.testType === "subtraction" ? "pink" : "red"} fontSize="md" px={3} py={1}>
              {testConfig.config.testType}
            </Badge>
          </HStack>

          {/* Question Count Selection */}
          <Box>
            <Text fontSize="xl" color="gray.600" textAlign="center" fontWeight="bold" mb={4}>
              {t("practicePage.selectQuestions")}
            </Text>

            <HStack spacing={4} flexWrap="wrap" justify="center">
              {[5, 10, 15, 20, 25].map((count) => (
                <Button
                  key={count}
                  onClick={() => setTempCount(count)}
                  colorScheme={tempCount === count ? "blue" : "gray"}
                  variant={tempCount === count ? "solid" : "outline"}
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
          </Box>

          {/* Difficulty Level Selection */}
          <Box>
            <Text fontSize="xl" color="gray.600" textAlign="center" fontWeight="bold" mb={4}>
              {t("practicePage.selectDifficulty")}
            </Text>

            <HStack spacing={4} flexWrap="wrap" justify="center">
              {Array.from(
                { length: testConfig.config.difficultyLevels.max - testConfig.config.difficultyLevels.min + 1 },
                (_, i) => testConfig.config.difficultyLevels.min + i
              ).map((level) => (
                <Button
                  key={level}
                  onClick={() => setTempDifficulty(level)}
                  colorScheme={tempDifficulty === level ? "blue" : "gray"}
                  variant={tempDifficulty === level ? "solid" : "outline"}
                  size="lg"
                  fontSize="3xl"
                  width="100px"
                  height="100px"
                  _hover={{ transform: "scale(1.05)", bg: tempDifficulty === level ? undefined : "blue.50" }}
                  transition="all 0.2s"
                >
                  {level}
                </Button>
              ))}
            </HStack>
          </Box>

          {/* Start Button */}
          {tempCount && tempDifficulty && (
            <Button
              onClick={startGame}
              colorScheme="green"
              size="lg"
              fontSize="2xl"
              px={12}
              py={8}
              _hover={{ transform: "scale(1.05)" }}
              transition="all 0.2s"
            >
              {t("practicePage.start")}
            </Button>
          )}
        </VStack>
      </Container>
    );
  }

  // Game complete screen
  if (isGameComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} dir="ltr">
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Heading size="2xl" textAlign="center">
              {percentage === 100
                ? t("additionTest.perfectScore")
                : percentage >= 80
                  ? t("additionTest.greatJob")
                  : percentage >= 60
                    ? t("additionTest.wellDone")
                    : t("additionTest.keepPracticing")}
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
                  <Text color="gray.500" fontSize="lg">
                    {t("additionTest.score")}
                  </Text>
                  <Text color="blue.600">
                    {score}/{totalQuestions}
                  </Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">
                    {t("additionTest.accuracy")}
                  </Text>
                  <Text color="green.600">{percentage}%</Text>
                </VStack>
                <VStack>
                  <Text color="gray.500" fontSize="lg">
                    {t("additionTest.time")}
                  </Text>
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
                setHasStarted(false);
                setMaxExercises(null);
                setDifficulty(null);
                setUserAnswer("");
                setTempCount(settings.defaultTestCount);
                setTempDifficulty(settings.defaultDifficulty);
              }}
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
          {completedExercises.length > 0 && (
            <Box width="100%">
              <Heading size="md" mb={4} color="gray.600">
                {t("additionTest.reviewAnswers")}
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
                      <Text fontSize="lg" fontWeight="bold">
                        {exercise.isCorrect ? "✓" : "✗"} {t("practicePage.yourAnswer")}: {exercise.userAnswer}
                        {!exercise.isCorrect && ` (${t("additionTest.correct")}: ${(exercise as Exercise).answer})`}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    );
  }

  if (!currentExercise) return null;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch" dir="ltr">
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
            {t(testConfig.i18nKey)}
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
              {t("additionTest.score")}: {score}/{totalQuestions} (
              {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%)
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
          key={getQuestionKey(currentExercise)}
          transition={{ duration: 0.3 }}
        >
          <Box
            bg={showFeedback ? (isCorrect ? "green.50" : "red.50") : "white"}
            borderWidth={3}
            borderColor={showFeedback ? (isCorrect ? "green.400" : "red.400") : "blue.400"}
            borderRadius="2xl"
            p={12}
            shadow="2xl"
            transition="all 0.3s"
            dir="ltr"
          >
            <VStack spacing={8} dir="ltr">
              {renderExercise()}

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
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Text textAlign="center" fontSize="xl" color="gray.500">
            {streak >= 5
              ? t("additionTest.onFire")
              : streak >= 3
                ? t("additionTest.amazing")
                : t("additionTest.typeAnswer")}
          </Text>
        </MotionBox>
      </VStack>
    </Container>
  );
}

