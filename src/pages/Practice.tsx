import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSubjectsWithTests } from "../config/configHelper";
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

export default function Practice() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const subjectsWithTests = getSubjectsWithTests();

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/practice/${subjectId}`);
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
          dir="ltr"
        >
          {subjectsWithTests.map((subjectData, index) => {
            const colorScheme = subjectData.color;
            const icon = subjectData.icon;

            return (
              <MotionBox
                key={subjectData.id}
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
                  onClick={() => handleSubjectClick(subjectData.id)}
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
                    <Text fontSize="6xl" role="img" aria-label={subjectData.id}>
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
                    {t(subjectData.i18nKey)}
                  </Heading>

                  {/* View Tests Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubjectClick(subjectData.id);
                    }}
                    colorScheme={colorScheme}
                    variant="solid"
                    size="md"
                    width="100%"
                    _hover={{
                      transform: "scale(1.05)",
                    }}
                    transition="all 0.2s"
                    mt="auto"
                  >
                    {t("practicePage.viewTests")}
                  </Button>

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
