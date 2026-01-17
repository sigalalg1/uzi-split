import React from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { i18n } = useTranslation();

  const handleLogin = () => {
    console.log("Login clicked");
    // TODO: Implement login functionality
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "he" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.dir = newLang === "he" ? "rtl" : "ltr";
  };

  React.useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <Box minH="100vh" position="relative">
      {/* Fixed Header with Login and Language Selector */}
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        justify="space-between"
        align="center"
        p={4}
        bg="white"
        shadow="sm"
        borderBottomWidth={1}
        borderColor="gray.200"
        dir="ltr"
      >
        {/* Language Switcher */}
        <Button
          onClick={toggleLanguage}
          colorScheme="gray"
          variant="outline"
          size="md"
        >
          {i18n.language === "en" ? "עברית" : "English"}
        </Button>

        {/* Login Button */}
        <Button onClick={handleLogin} colorScheme="blue" size="md">
          {i18n.language === "en" ? "Login" : "התחברות"}
        </Button>
      </Flex>

      {/* Main Content with padding for fixed header */}
      <Box pt="70px">{children}</Box>
    </Box>
  );
}

