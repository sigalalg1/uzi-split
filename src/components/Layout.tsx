import React from "react";
import { Box, Button, Flex, Heading, HStack, Image, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text, Menu, MenuButton, MenuList, MenuItem, Avatar } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import * as userService from "../services/userService";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useUser();

  const user = currentUser ? userService.getUser(currentUser) : null;

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
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

  const isHomePage = location.pathname === "/";

  // Build breadcrumb from pathname
  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: t("app.title"), path: "/" }];

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      let name = path;

      // Translate known paths
      if (path === "practice") {
        name = t("app.practice");
      } else if (path === "addition") {
        name = t("practicePage.subjects.addition");
      } else if (path === "multiplication") {
        name = t("practicePage.subjects.multiplication");
      } else if (path === "fractions") {
        name = t("practicePage.subjects.fractions");
      } else if (path === "order-of-operations") {
        name = t("practicePage.subjects.orderOfOperations");
      } else if (path === "add-without-conversion") {
        name = t("practicePage.exercises.addWithoutConversion");
      } else if (path === "add-with-conversion") {
        name = t("practicePage.exercises.addWithConversion");
      } else if (path === "multiplication-table") {
        name = t("practicePage.exercises.multiplicationTable");
      } else if (path === "fraction-addition") {
        name = t("practicePage.exercises.fractionAddition");
      } else if (path === "least-common-denominator") {
        name = t("practicePage.exercises.leastCommonDenominator");
      } else if (path === "fraction") {
        name = t("practicePage.exercises.fraction");
      }

      breadcrumbs.push({ name, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Box minH="100vh" position="relative">
      {/* Fixed Header */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        bg="white"
        shadow="md"
        borderBottomWidth={1}
        borderColor="gray.200"
        dir="ltr"
      >
        {/* Main Header Bar */}
        <Flex
          justify="space-between"
          align="center"
          px={6}
          py={4}
        >
          {/* Left Side: Logo and Title */}
          <HStack spacing={3} cursor="pointer" onClick={() => navigate("/")} _hover={{ opacity: 0.8 }}>
            <Image
              src="/logo.png"
              alt="Logo"
              height="60px"
            />
            <Heading
              size="lg"
              color="blue.600"
            >
              {t("app.title")}
            </Heading>
          </HStack>

          {/* Right Side: User Menu | Language */}
          <HStack spacing={3} divider={<Text color="gray.300">|</Text>}>
            {isAuthenticated && user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                  leftIcon={
                    <Avatar
                      name={user.username}
                      size="xs"
                      bg="purple.500"
                      color="white"
                    >
                      {user.avatar}
                    </Avatar>
                  }
                >
                  {user.username}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={handleProfile}>
                    {t("layout.profile")}
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/history")}>
                    {t("layout.history")}
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/settings")}>
                    {t("layout.settings")}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    {t("layout.logout")}
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                onClick={handleLogin}
                variant="ghost"
                colorScheme="blue"
                size="sm"
              >
                {t("layout.login")}
              </Button>
            )}

            <Button
              onClick={toggleLanguage}
              variant="ghost"
              colorScheme="blue"
              size="sm"
            >
              {i18n.language === "en" ? "עברית" : "English"}
            </Button>
          </HStack>
        </Flex>

        {/* Breadcrumb Navigation */}
        {!isHomePage && (
          <Box
            px={6}
            py={2}
            bg="gray.50"
            borderTopWidth={1}
            borderColor="gray.200"
          >
            <Breadcrumb separator="›" fontSize="sm">
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={crumb.path} isCurrentPage={index === breadcrumbs.length - 1}>
                  <BreadcrumbLink
                    onClick={() => navigate(crumb.path)}
                    color={index === breadcrumbs.length - 1 ? "blue.600" : "gray.600"}
                    fontWeight={index === breadcrumbs.length - 1 ? "bold" : "normal"}
                    cursor="pointer"
                    _hover={{ color: "blue.600" }}
                  >
                    {crumb.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          </Box>
        )}
      </Box>

      {/* Main Content with padding for fixed header */}
      <Box pt={isHomePage ? "90px" : "140px"}>{children}</Box>
    </Box>
  );
}

