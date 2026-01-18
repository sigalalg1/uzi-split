import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useUser } from '../context/UserContext';
import * as userService from '../services/userService';

export default function UserProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser } = useUser();

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const user = userService.getUser(currentUser);
  const stats = userService.getUserStats(currentUser);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTestTypeLabel = (testType: string): string => {
    const labels: Record<string, string> = {
      fraction: t('practicePage.subjects.fractions'),
      multiplication: t('practicePage.subjects.multiplication'),
      orderOfOperations: t('practicePage.subjects.orderOfOperations'),
      addition: t('practicePage.subjects.addition'),
    };
    return labels[testType] || testType;
  };

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap">
          <HStack spacing={4}>
            <Text fontSize="4xl">{user?.avatar || '👤'}</Text>
            <VStack align="start" spacing={0}>
              <Heading size="xl" color="purple.600">
                {user?.username}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                {t('profile.memberSince')} {new Date(user?.createdAt || 0).toLocaleDateString()}
              </Text>
            </VStack>
          </HStack>
          <Button
            onClick={() => navigate('/practice')}
            colorScheme="purple"
            size="lg"
          >
            {t('profile.backToPractice')}
          </Button>
        </HStack>

        <Divider />

        {/* Statistics */}
        <Box>
          <Heading size="md" mb={4} color="gray.700">
            {t('profile.statistics')}
          </Heading>
          <SimpleGrid columns={[1, 2, 4]} spacing={4}>
            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              shadow="md"
              borderWidth={2}
              borderColor="purple.200"
            >
              <StatLabel>{t('profile.totalTests')}</StatLabel>
              <StatNumber color="purple.600">{stats.totalTests}</StatNumber>
            </Stat>

            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              shadow="md"
              borderWidth={2}
              borderColor="green.200"
            >
              <StatLabel>{t('profile.averageScore')}</StatLabel>
              <StatNumber color="green.600">{stats.averagePercentage}%</StatNumber>
              <StatHelpText>
                {stats.averageScore.toFixed(1)} {t('profile.correct')}
              </StatHelpText>
            </Stat>

            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              shadow="md"
              borderWidth={2}
              borderColor="blue.200"
            >
              <StatLabel>{t('profile.totalTime')}</StatLabel>
              <StatNumber color="blue.600">{formatTime(stats.totalTime)}</StatNumber>
            </Stat>

            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              shadow="md"
              borderWidth={2}
              borderColor="orange.200"
            >
              <StatLabel>{t('profile.bestScore')}</StatLabel>
              <StatNumber color="orange.600">
                {stats.bestScore ? `${stats.bestScore.percentage}%` : '-'}
              </StatNumber>
              {stats.bestScore && (
                <StatHelpText>
                  {stats.bestScore.score}/{stats.bestScore.totalQuestions}
                </StatHelpText>
              )}
            </Stat>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Recent Tests */}
        <Box>
          <Flex justify="space-between" align="center" mb={4} flexWrap="wrap">
            <Heading size="md" color="gray.700">
              {t('profile.recentTests')}
            </Heading>
            {stats.recentTests.length > 0 && (
              <Button
                onClick={() => navigate('/history')}
                colorScheme="purple"
                variant="outline"
                size="sm"
              >
                {t('profile.viewAllHistory')}
              </Button>
            )}
          </Flex>

          {stats.recentTests.length === 0 ? (
            <Box
              bg="gray.50"
              p={8}
              borderRadius="lg"
              textAlign="center"
            >
              <Text color="gray.500" fontSize="lg">
                {t('profile.noTests')}
              </Text>
              <Button
                onClick={() => navigate('/practice')}
                colorScheme="purple"
                mt={4}
              >
                {t('profile.startFirstTest')}
              </Button>
            </Box>
          ) : (
            <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
              <Table variant="simple">
                <Thead bg="purple.50">
                  <Tr>
                    <Th>{t('profile.date')}</Th>
                    <Th>{t('profile.testType')}</Th>
                    <Th>{t('profile.difficulty')}</Th>
                    <Th isNumeric>{t('profile.score')}</Th>
                    <Th isNumeric>{t('profile.percentage')}</Th>
                    <Th isNumeric>{t('profile.time')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stats.recentTests.map((result) => (
                    <Tr key={result.id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <Text fontSize="sm">{formatDate(result.completedAt)}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple">
                          {getTestTypeLabel(result.testType)}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          {Array.from({ length: result.difficulty }).map((_, i) => (
                            <Text key={i} color="orange.400">⭐</Text>
                          ))}
                        </HStack>
                      </Td>
                      <Td isNumeric>
                        <Text fontWeight="bold">
                          {result.score}/{result.totalQuestions}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Badge
                          colorScheme={
                            result.percentage >= 80 ? 'green' :
                              result.percentage >= 60 ? 'yellow' : 'red'
                          }
                          fontSize="md"
                          px={2}
                        >
                          {result.percentage}%
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Text fontSize="sm">{formatTime(result.timeElapsed)}</Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
}

