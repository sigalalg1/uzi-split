import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, VStack, Heading, Button, Tooltip } from "@chakra-ui/react";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handlePractice = () => {
    navigate("/practice");
  };

  return (
    <Box
      minH="calc(100vh - 70px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Heading
        fontSize={{ base: "4xl", md: "6xl" }}
        fontWeight="bold"
        mb={16}
        color="blue.600"
      >
        {t("app.title")}
      </Heading>

      <VStack spacing={5} width="100%" maxW="400px">
        <Tooltip
          label={t("app.testNotAvailable")}
          fontSize="md"
          placement="top"
          hasArrow
        >
          <Button
            size="lg"
            width="100%"
            colorScheme="blue"
            fontSize="lg"
            py={6}
            isDisabled
            cursor="not-allowed"
            opacity={0.6}
            _hover={{}}
          >
            {t("app.test")}
          </Button>
        </Tooltip>

        <Button
          size="lg"
          width="100%"
          colorScheme="blue"
          fontSize="lg"
          py={6}
          onClick={handlePractice}
          _hover={{ bg: "blue.600" }}
        >
          {t("app.practice")}
        </Button>
      </VStack>
    </Box>
  );
}

