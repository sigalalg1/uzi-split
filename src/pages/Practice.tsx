import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { testData } from "../data/tests";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

// Subject icons/emojis
const subjectIcons: Record<string, string> = {
  addition: "➕",
  subtraction: "➖",
  multiplication: "✖️",
  "order-of-operations": "🔢",
  fractions: "½",
  "number-line": "📏",
};

const subjectColors: Record<string, string> = {
  addition: "blue",
  subtraction: "pink",
  multiplication: "red",
  "order-of-operations": "purple",
  fractions: "green",
  "number-line": "purple",
};

export default function Practice() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleTestClick = (url: string) => {
    navigate(url);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="center" align="center" direction="column" gap={2}>
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="bold"
            color="blue.600"
            textAlign="center"
          >
            {t("practicePage.title")}
          </Heading>
          <Text fontSize="lg" color="gray.600" textAlign="center">
            {t("practicePage.subtitle")}
          </Text>
        </Flex>

        {/* Grid of Subject Cards */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={6}
          mt={4}
        >
          {testData.map((subjectData, index) => {
            const colorScheme = subjectColors[subjectData.subject] || "blue";
            const icon = subjectIcons[subjectData.subject] || "📚";

            return (
              <MotionBox
                key={subjectData.subject}
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
                  }}
                  transition="all 0.3s"
                  height="100%"
                  display="flex"
                  flexDirection="column"
                >
                  {/* Icon/Logo Area */}
                  <Flex
                    justify="center"
                    align="center"
                    mb={4}
                    bg={`${colorScheme}.50`}
                    borderRadius="xl"
                    p={4}
                    height="100px"
                  >
                    <Text fontSize="6xl" role="img" aria-label={subjectData.subject}>
                      {icon}
                    </Text>
                  </Flex>

                  {/* Subject Title */}
                  <Heading
                    size="md"
                    color={`${colorScheme}.700`}
                    textAlign="center"
                    mb={4}
                  >
                    {t(subjectData.subjectKey)}
                  </Heading>

                  {/* Practice Links */}
                  <VStack spacing={2} flex={1} align="stretch">
                    {subjectData.tests.map((test) => (
                      <Button
                        key={test.name}
                        onClick={() => handleTestClick(test.url)}
                        colorScheme={colorScheme}
                        variant="outline"
                        size="sm"
                        justifyContent="flex-start"
                        px={4}
                        py={2}
                        height="auto"
                        whiteSpace="normal"
                        textAlign="left"
                        _hover={{
                          bg: `${colorScheme}.50`,
                          transform: "translateX(4px)",
                        }}
                        transition="all 0.2s"
                      >
                        <Text fontSize="sm" fontWeight="medium">
                          {t(test.text)}
                        </Text>
                      </Button>
                    ))}
                  </VStack>

                  {/* Practice Count Badge */}
                  <Text
                    mt={4}
                    fontSize="xs"
                    color="gray.500"
                    textAlign="center"
                  >
                    {subjectData.tests.length} {t("practicePage.exercisesLabel")}
                  </Text>
                </Box>
              </MotionBox>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
