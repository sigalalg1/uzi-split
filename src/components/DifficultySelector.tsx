import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
} from '@chakra-ui/react';

interface DifficultySelectorProps {
  testTitle: string;
  testBadge: string;
  colorScheme?: string;
  questionOptions?: number[];
  onStart: (count: number, difficulty: number) => void;
}

export default function DifficultySelector({
  testTitle,
  testBadge,
  colorScheme = 'purple',
  questionOptions = [5, 10, 15, 20, 25],
  onStart,
}: DifficultySelectorProps) {
  const { t } = useTranslation();
  const [tempCount, setTempCount] = useState<number | null>(null);

  const handleStart = (difficulty: number) => {
    if (tempCount) {
      onStart(tempCount, difficulty);
    }
  };

  return (
    <Container maxW="container.md" py={6}>
      <VStack spacing={6}>
        <HStack justify="center" spacing={4}>
          <Heading textAlign="center" color={`${colorScheme}.600`} size="md">
            {testTitle}
          </Heading>
          <Badge colorScheme={colorScheme} fontSize="md" px={3} py={1}>
            {testBadge}
          </Badge>
        </HStack>

        {/* Question Count Selection */}
        {!tempCount && (
          <>
            <Text fontSize="lg" color="gray.600" textAlign="center" fontWeight="bold">
              {t('practicePage.selectQuestions')}
            </Text>

            <HStack spacing={3} flexWrap="wrap" justify="center">
              {questionOptions.map((count) => (
                <Button
                  key={count}
                  onClick={() => setTempCount(count)}
                  colorScheme={colorScheme}
                  size="md"
                  fontSize="xl"
                  width="80px"
                  height="80px"
                  _hover={{ transform: 'scale(1.05)' }}
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
              {t('practicePage.selectDifficulty')}
            </Text>

            <HStack spacing={3} flexWrap="wrap" justify="center">
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  onClick={() => handleStart(level)}
                  colorScheme={colorScheme}
                  variant="outline"
                  size="md"
                  fontSize="2xl"
                  width="80px"
                  height="80px"
                  _hover={{ transform: 'scale(1.05)', bg: `${colorScheme}.50` }}
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
              ← {t('fractionTest.back')}
            </Button>
          </>
        )}
      </VStack>
    </Container>
  );
}

