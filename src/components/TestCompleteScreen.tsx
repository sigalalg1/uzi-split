import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Progress,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/testHelpers';

const MotionBox = motion(Box);

interface TestCompleteScreenProps {
  score: number;
  totalQuestions: number;
  percentage: number;
  elapsedTime: number;
  testType: string;
  onRestart: () => void;
  colorScheme?: string;
}

export default function TestCompleteScreen({
  score,
  totalQuestions,
  percentage,
  elapsedTime,
  testType,
  onRestart,
  colorScheme = 'purple',
}: TestCompleteScreenProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getMessage = () => {
    if (percentage === 100) return t(`${testType}.perfectScore`);
    if (percentage >= 80) return t(`${testType}.greatJob`);
    if (percentage >= 60) return t(`${testType}.wellDone`);
    return t(`${testType}.keepPracticing`);
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8}>
        <MotionBox
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Heading size="2xl" textAlign="center">
            {getMessage()}
          </Heading>
        </MotionBox>

        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          shadow="2xl"
          borderWidth={3}
          borderColor={`${colorScheme}.400`}
          width="100%"
        >
          <VStack spacing={6}>
            <Heading size="lg" color="gray.700">
              {t(`${testType}.testComplete`)}
            </Heading>

            <HStack spacing={8} fontSize="3xl" fontWeight="bold" flexWrap="wrap" justify="center">
              <VStack>
                <Text color="gray.500" fontSize="lg">
                  {t(`${testType}.score`)}
                </Text>
                <Text color={`${colorScheme}.600`}>
                  {score}/{totalQuestions}
                </Text>
              </VStack>
              <VStack>
                <Text color="gray.500" fontSize="lg">
                  {t(`${testType}.accuracy`)}
                </Text>
                <Text color="green.600">{percentage}%</Text>
              </VStack>
              <VStack>
                <Text color="gray.500" fontSize="lg">
                  {t(`${testType}.time`)}
                </Text>
                <Text color="blue.600">{formatTime(elapsedTime)}</Text>
              </VStack>
            </HStack>

            <Progress
              value={percentage}
              colorScheme={
                percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red'
              }
              size="lg"
              borderRadius="full"
              width="100%"
            />
          </VStack>
        </Box>

        <HStack spacing={4} width="100%">
          <Button onClick={onRestart} colorScheme={colorScheme} size="lg" flex={1}>
            {t(`${testType}.startNew`)}
          </Button>
          <Button
            onClick={() => navigate('/practice')}
            colorScheme="gray"
            variant="outline"
            size="lg"
            flex={1}
          >
            {t(`${testType}.backToTests`)}
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}

