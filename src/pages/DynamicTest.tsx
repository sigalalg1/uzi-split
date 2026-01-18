import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, VStack, Heading, Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import MathTest from "../components/MathTest";
import { getTest } from "../config/configHelper";

export default function DynamicTest() {
  const { subject, testName } = useParams<{ subject: string; testName: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Find the test configuration
  const testConfig = subject && testName ? getTest(subject, testName) : undefined;

  if (!testConfig) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6}>
          <Heading color="red.600">Test not found</Heading>
          <Button onClick={() => navigate("/practice")} colorScheme="blue">
            {t("additionTest.backToTests")}
          </Button>
        </VStack>
      </Container>
    );
  }

  return <MathTest testConfig={testConfig} />;
}

