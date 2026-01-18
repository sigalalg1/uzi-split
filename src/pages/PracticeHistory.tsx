import React, { useState, useMemo } from 'react';
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
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  SimpleGrid,
  Progress,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon } from '@chakra-ui/icons';
import { useUser } from '../context/UserContext';
import * as userService from '../services/userService';

export default function PracticeHistory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { currentUser } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Get user data (safe even if currentUser is null)
  const allResults = useMemo(() =>
    currentUser ? userService.getUserTestResults(currentUser) : []
    , [currentUser]);

  const stats = useMemo(() =>
    currentUser ? userService.getUserStats(currentUser) : {
      totalTests: 0,
      averageScore: 0,
      averagePercentage: 0,
      totalTime: 0,
      bestScore: null,
      recentTests: [],
    }
    , [currentUser]);

  // Filter results by test type
  const filteredResults = useMemo(() => {
    if (filterType === 'all') return allResults;
    return allResults.filter(result => result.testType === filterType);
  }, [allResults, filterType]);

  // Sort results
  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];

    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => b.completedAt - a.completedAt);
      case 'date-asc':
        return sorted.sort((a, b) => a.completedAt - b.completedAt);
      case 'score-desc':
        return sorted.sort((a, b) => b.percentage - a.percentage);
      case 'score-asc':
        return sorted.sort((a, b) => a.percentage - b.percentage);
      case 'time-desc':
        return sorted.sort((a, b) => b.timeElapsed - a.timeElapsed);
      case 'time-asc':
        return sorted.sort((a, b) => a.timeElapsed - b.timeElapsed);
      default:
        return sorted;
    }
  }, [filteredResults, sortBy]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
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

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'teal';
    if (percentage >= 70) return 'yellow';
    if (percentage >= 60) return 'orange';
    return 'red';
  };

  // Calculate statistics for filtered results
  const filteredStats = useMemo(() => {
    if (filteredResults.length === 0) {
      return {
        totalTests: 0,
        averagePercentage: 0,
        totalTime: 0,
        bestScore: null,
      };
    }

    const totalTests = filteredResults.length;
    const averagePercentage = filteredResults.reduce((sum, r) => sum + r.percentage, 0) / totalTests;
    const totalTime = filteredResults.reduce((sum, r) => sum + r.timeElapsed, 0);
    const bestScore = filteredResults.reduce((best, current) => {
      if (!best || current.percentage > best.percentage) {
        return current;
      }
      return best;
    }, filteredResults[0]);

    return {
      totalTests,
      averagePercentage: Math.round(averagePercentage),
      totalTime,
      bestScore,
    };
  }, [filteredResults]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleClearHistory = () => {
    if (currentUser) {
      try {
        userService.clearUserHistory(currentUser);
        toast({
          title: t('history.historyCleared'),
          description: t('history.historyClearedDescription'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } catch (error) {
        toast({
          title: t('history.error'),
          description: String(error),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Redirect to login if not authenticated (after all hooks)
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={{ base: 2, md: 4 }}>
          <HStack spacing={{ base: 2, md: 4 }}>
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate('/profile')}
              variant="ghost"
              colorScheme="purple"
              size={{ base: "sm", md: "md" }}
            >
              {t('history.back')}
            </Button>
            <Heading size={{ base: "md", md: "lg" }} color="purple.600">
              {t('history.title')}
            </Heading>
          </HStack>

          {allResults.length > 0 && (
            <Button
              leftIcon={<DeleteIcon />}
              onClick={onOpen}
              colorScheme="red"
              variant="outline"
              size={{ base: "xs", md: "sm" }}
            >
              <Text display={{ base: "none", sm: "inline" }}>{t('history.clearHistory')}</Text>
              <Text display={{ base: "inline", sm: "none" }}>Clear</Text>
            </Button>
          )}
        </Flex>

        {/* Overall Statistics */}
        <Box
          bg={bgColor}
          p={{ base: 4, md: 6 }}
          borderRadius="lg"
          shadow="md"
          borderWidth={1}
          borderColor={borderColor}
        >
          <Heading size={{ base: "sm", md: "md" }} mb={4} color="gray.700">
            {t('history.overallStats')}
          </Heading>
          <SimpleGrid columns={[1, 2, 4]} spacing={4}>
            <Stat>
              <StatLabel fontSize={{ base: "xs", md: "sm" }}>{t('history.totalTests')}</StatLabel>
              <StatNumber color="purple.600" fontSize={{ base: "xl", md: "2xl" }}>{stats.totalTests}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>{t('history.averageScore')}</StatLabel>
              <StatNumber color="green.600">{stats.averagePercentage}%</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>{t('history.totalPracticeTime')}</StatLabel>
              <StatNumber color="blue.600">{formatTime(stats.totalTime)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>{t('history.bestScore')}</StatLabel>
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

        {/* Filters and Sorting */}
        <Box
          bg={bgColor}
          p={4}
          borderRadius="lg"
          shadow="md"
          borderWidth={1}
          borderColor={borderColor}
        >
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            <Box>
              <Text mb={2} fontWeight="bold" fontSize="sm" color="gray.600">
                {t('history.filterByType')}
              </Text>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">{t('history.allTypes')}</option>
                <option value="fraction">{t('practicePage.subjects.fractions')}</option>
                <option value="multiplication">{t('practicePage.subjects.multiplication')}</option>
                <option value="addition">{t('practicePage.subjects.addition')}</option>
                <option value="orderOfOperations">{t('practicePage.subjects.orderOfOperations')}</option>
              </Select>
            </Box>

            <Box>
              <Text mb={2} fontWeight="bold" fontSize="sm" color="gray.600">
                {t('history.sortBy')}
              </Text>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date-desc">{t('history.newestFirst')}</option>
                <option value="date-asc">{t('history.oldestFirst')}</option>
                <option value="score-desc">{t('history.highestScore')}</option>
                <option value="score-asc">{t('history.lowestScore')}</option>
                <option value="time-desc">{t('history.longestTime')}</option>
                <option value="time-asc">{t('history.shortestTime')}</option>
              </Select>
            </Box>

            <Box display="flex" alignItems="flex-end">
              <VStack align="start" w="100%">
                <Text fontWeight="bold" fontSize="sm" color="gray.600">
                  {t('history.showing')}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {filteredResults.length} {t('history.tests')}
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Filtered Statistics */}
        {filterType !== 'all' && filteredResults.length > 0 && (
          <Box
            bg="purple.50"
            p={4}
            borderRadius="lg"
            borderWidth={2}
            borderColor="purple.200"
          >
            <Text fontSize="sm" fontWeight="bold" color="purple.700" mb={2}>
              {t('history.filteredStats')} - {getTestTypeLabel(filterType)}
            </Text>
            <SimpleGrid columns={[2, 4]} spacing={4}>
              <Box>
                <Text fontSize="xs" color="gray.600">{t('history.tests')}</Text>
                <Text fontSize="xl" fontWeight="bold" color="purple.600">
                  {filteredStats.totalTests}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.600">{t('history.average')}</Text>
                <Text fontSize="xl" fontWeight="bold" color="green.600">
                  {filteredStats.averagePercentage}%
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.600">{t('history.totalTime')}</Text>
                <Text fontSize="xl" fontWeight="bold" color="blue.600">
                  {formatTime(filteredStats.totalTime)}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.600">{t('history.best')}</Text>
                <Text fontSize="xl" fontWeight="bold" color="orange.600">
                  {filteredStats.bestScore ? `${filteredStats.bestScore.percentage}%` : '-'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        )}

        {/* Test Results */}
        {sortedResults.length === 0 ? (
          <Box
            bg={bgColor}
            p={{ base: 6, md: 12 }}
            borderRadius="lg"
            shadow="md"
            textAlign="center"
            borderWidth={1}
            borderColor={borderColor}
          >
            <Text fontSize={{ base: "md", md: "xl" }} color="gray.500" mb={4}>
              {filterType === 'all'
                ? t('history.noTests')
                : t('history.noTestsForType', { type: getTestTypeLabel(filterType) })
              }
            </Text>
            <Button
              onClick={() => navigate('/practice')}
              colorScheme="purple"
              size={{ base: "md", md: "lg" }}
            >
              {t('history.startPracticing')}
            </Button>
          </Box>
        ) : (
          <Box
            bg={bgColor}
            borderRadius="lg"
            shadow="md"
            overflowX="auto"
            borderWidth={1}
            borderColor={borderColor}
          >
            <Table variant="simple" size={{ base: "sm", md: "md" }}>
              <Thead bg="purple.50">
                <Tr>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('history.dateTime')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>{t('history.testType')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('history.difficulty')}</Th>
                  <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", sm: "table-cell" }}>{t('history.questions')}</Th>
                  <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>{t('history.score')}</Th>
                  <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>{t('history.accuracy')}</Th>
                  <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>{t('history.time')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>{t('history.performance')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedResults.map((result, index) => (
                  <Tr
                    key={result.id}
                    _hover={{ bg: 'gray.50' }}
                    bg={index % 2 === 0 ? 'white' : 'gray.50'}
                  >
                    <Td>
                      <Text fontSize="sm">{formatDate(result.completedAt)}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple" fontSize="xs">
                        {getTestTypeLabel(result.testType)}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={0}>
                        {Array.from({ length: result.difficulty }).map((_, i) => (
                          <Text key={i} color="orange.400" fontSize="sm">⭐</Text>
                        ))}
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <Text fontSize="sm" fontWeight="medium">
                        {result.totalQuestions}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text fontSize="sm" fontWeight="bold">
                        {result.score}/{result.totalQuestions}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Badge
                        colorScheme={getScoreColor(result.percentage)}
                        fontSize="md"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {result.percentage}%
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <Text fontSize="sm">{formatTime(result.timeElapsed)}</Text>
                    </Td>
                    <Td>
                      <Progress
                        value={result.percentage}
                        colorScheme={getScoreColor(result.percentage)}
                        size="sm"
                        borderRadius="full"
                        w="100px"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Clear History Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('history.confirmClear')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="start">
                <Text>{t('history.confirmClearMessage')}</Text>
                <Box
                  p={3}
                  bg="red.50"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="red.200"
                  w="100%"
                >
                  <Text fontSize="sm" color="red.700" fontWeight="bold">
                    ⚠️ {t('history.warningPermanent')}
                  </Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="gray" mr={3} onClick={onClose}>
                {t('history.cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleClearHistory}>
                {t('history.clearAll')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}

