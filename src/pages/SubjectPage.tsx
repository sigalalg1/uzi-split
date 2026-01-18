import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Button,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { getSubject, getTestsForSubject } from "../config/configHelper";

const MotionBox = motion(Box);

export default function SubjectPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { subject } = useParams<{ subject: string }>();

  // Find the subject from config
  const subjectData = subject ? getSubject(subject) : undefined;
  const tests = subject ? getTestsForSubject(subject) : [];

  if (!subjectData) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6}>
          <Heading color="red.600">{t("practicePage.subjectNotFound")}</Heading>
          <Button onClick={() => navigate("/practice")} colorScheme="blue">
            {t("additionTest.backToTests")}
          </Button>
        </VStack>
      </Container>
    );
  }

  const colorScheme = subjectData.color;

  const handleTestClick = (url: string) => {
    navigate(url);
  };

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Compact Header with Back Button */}
        <Flex justify="space-between" align="center" mb={2}>
          {/* Back Button */}
          <Button
            onClick={() => navigate("/practice")}
            colorScheme={colorScheme}
            variant="ghost"
            leftIcon={<span>←</span>}
            size="sm"
          >
            {t("additionTest.back")}
          </Button>

          {/* Center: Icon and Title */}
          <Flex align="center" gap={3} flex={1} justify="center">
            <Text fontSize="5xl" role="img" aria-label={subjectData.id}>
              {subjectData.icon}
            </Text>
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color={`${colorScheme}.600`}
            >
              {t(subjectData.i18nKey)}
            </Heading>
            <Badge colorScheme={colorScheme} fontSize="sm" px={2} py={1}>
              {tests.length}
            </Badge>
          </Flex>

          {/* Right spacer to center the title */}
          <Box width="80px" />
        </Flex>

        {/* Grid of Test Cards */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={6}
          dir="ltr"
        >
          {tests.map((test, index) => (
            <MotionBox
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Box
                bg="white"
                borderRadius="2xl"
                borderWidth={3}
                borderColor={`${colorScheme}.400`}
                p={6}
                shadow="lg"
                _hover={{
                  shadow: "2xl",
                  borderColor: `${colorScheme}.500`,
                  cursor: "pointer",
                }}
                transition="all 0.3s"
                height="100%"
                display="flex"
                flexDirection="column"
                onClick={() => handleTestClick(test.url)}
              >
                {/* Test Name */}
                <VStack spacing={4} flex={1} justify="center">
                  <Heading
                    size="md"
                    color={`${colorScheme}.700`}
                    textAlign="center"
                  >
                    {t(test.i18nKey)}
                  </Heading>

                  {/* Difficulty Badge */}
                  <Badge colorScheme={colorScheme} fontSize="sm">
                    {test.config.difficultyLevels.max - test.config.difficultyLevels.min + 1} {t("practicePage.difficultyLevels")}
                  </Badge>

                  {/* Operation Badge */}
                  <Text fontSize="4xl" color={`${colorScheme}.500`}>
                    {test.config.operation}
                  </Text>
                </VStack>

                {/* Practice Button */}
                <Button
                  mt={4}
                  colorScheme={colorScheme}
                  size="md"
                  width="100%"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestClick(test.url);
                  }}
                >
                  {t("practicePage.startPractice")}
                </Button>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}

