import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  RadioGroup,
  Radio,
  Stack,
  Divider,
  useToast,
  Badge,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon } from '@chakra-ui/icons';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleFeedbackTimingChange = (value: string) => {
    updateSettings({ feedbackTiming: value as 'afterEach' | 'atEnd' });
    toast({
      title: t('settings.saved'),
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
  };

  const handleDelayChange = (value: number) => {
    updateSettings({ feedbackDelay: value });
  };

  const getDelayLabel = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleReset = () => {
    resetSettings();
    toast({
      title: t('settings.resetSuccess'),
      description: t('settings.resetDescription'),
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  };

  return (
    <Container maxW="container.md" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate('/profile')}
              variant="ghost"
              colorScheme="purple"
            >
              {t('settings.back')}
            </Button>
            <Heading size="lg" color="purple.600">
              {t('settings.title')}
            </Heading>
          </HStack>
        </Flex>

        {/* Settings Sections */}
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          shadow="md"
          borderWidth={1}
          borderColor="gray.200"
        >
          <VStack spacing={6} align="stretch">
            {/* Feedback Timing Setting */}
            <Box>
              <HStack spacing={2} mb={3}>
                <Heading size="md" color="gray.700">
                  {t('settings.feedbackTiming')}
                </Heading>
                <Badge colorScheme="purple">{t('settings.practiceMode')}</Badge>
              </HStack>
              
              <Text color="gray.600" mb={4} fontSize="sm">
                {t('settings.feedbackTimingDescription')}
              </Text>

              <RadioGroup
                value={settings.feedbackTiming}
                onChange={handleFeedbackTimingChange}
              >
                <Stack spacing={4}>
                  <Box
                    p={4}
                    borderRadius="md"
                    borderWidth={2}
                    borderColor={
                      settings.feedbackTiming === 'afterEach' ? 'purple.400' : 'gray.200'
                    }
                    bg={settings.feedbackTiming === 'afterEach' ? 'purple.50' : 'white'}
                    cursor="pointer"
                    _hover={{ borderColor: 'purple.300' }}
                    transition="all 0.2s"
                    onClick={() => handleFeedbackTimingChange('afterEach')}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Radio value="afterEach" colorScheme="purple">
                            <Text fontWeight="bold" fontSize="md">
                              {t('settings.afterEach')}
                            </Text>
                          </Radio>
                          {settings.feedbackTiming === 'afterEach' && (
                            <CheckIcon color="purple.500" boxSize={4} />
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600" pl={6}>
                          {t('settings.afterEachDescription')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <Box
                    p={4}
                    borderRadius="md"
                    borderWidth={2}
                    borderColor={
                      settings.feedbackTiming === 'atEnd' ? 'purple.400' : 'gray.200'
                    }
                    bg={settings.feedbackTiming === 'atEnd' ? 'purple.50' : 'white'}
                    cursor="pointer"
                    _hover={{ borderColor: 'purple.300' }}
                    transition="all 0.2s"
                    onClick={() => handleFeedbackTimingChange('atEnd')}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Radio value="atEnd" colorScheme="purple">
                            <Text fontWeight="bold" fontSize="md">
                              {t('settings.atEnd')}
                            </Text>
                          </Radio>
                          {settings.feedbackTiming === 'atEnd' && (
                            <CheckIcon color="purple.500" boxSize={4} />
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600" pl={6}>
                          {t('settings.atEndDescription')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </Stack>
              </RadioGroup>
            </Box>

            <Divider />

            {/* Feedback Delay Setting */}
            <Box>
              <HStack spacing={2} mb={3}>
                <Heading size="md" color="gray.700">
                  {t('settings.feedbackDelay')}
                </Heading>
                <Badge colorScheme="green">{getDelayLabel(settings.feedbackDelay)}</Badge>
              </HStack>
              
              <Text color="gray.600" mb={6} fontSize="sm">
                {t('settings.feedbackDelayDescription')}
              </Text>

              <Box px={4}>
                <Slider
                  value={settings.feedbackDelay}
                  onChange={handleDelayChange}
                  min={200}
                  max={3000}
                  step={100}
                  colorScheme="purple"
                >
                  <SliderMark value={200} mt={3} fontSize="xs" color="gray.500">
                    0.2s
                  </SliderMark>
                  <SliderMark value={800} mt={3} ml={-2} fontSize="xs" color="gray.500">
                    0.8s
                  </SliderMark>
                  <SliderMark value={1500} mt={3} ml={-2} fontSize="xs" color="gray.500">
                    1.5s
                  </SliderMark>
                  <SliderMark value={3000} mt={3} ml={-4} fontSize="xs" color="gray.500">
                    3.0s
                  </SliderMark>
                  <SliderMark
                    value={settings.feedbackDelay}
                    textAlign="center"
                    bg="purple.500"
                    color="white"
                    mt={-10}
                    ml={-8}
                    w="16"
                    fontSize="sm"
                    fontWeight="bold"
                    borderRadius="md"
                    py={1}
                  >
                    {getDelayLabel(settings.feedbackDelay)}
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
              </Box>

              <HStack justify="space-between" mt={8} spacing={2}>
                <Text fontSize="xs" color="gray.500">⚡ {t('settings.faster')}</Text>
                <Text fontSize="xs" color="gray.500">🐢 {t('settings.slower')}</Text>
              </HStack>
            </Box>

            <Divider />

            {/* Info Box */}
            <Box
              p={4}
              bg="blue.50"
              borderRadius="md"
              borderWidth={1}
              borderColor="blue.200"
            >
              <Text fontSize="sm" color="blue.800">
                <strong>💡 {t('settings.tip')}:</strong> {t('settings.tipDescription')}
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Action Buttons */}
        <HStack spacing={4}>
          <Button
            onClick={handleReset}
            colorScheme="gray"
            variant="outline"
            flex={1}
          >
            {t('settings.resetDefaults')}
          </Button>
          <Button
            onClick={() => navigate('/practice')}
            colorScheme="purple"
            flex={1}
          >
            {t('settings.startPracticing')}
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}

