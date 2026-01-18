import React, { useRef } from "react";
import { VStack, Input, Box, Text, HStack, Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type FractionInputMode = "decimal" | "fraction";

type FractionInputProps = {
  // Fraction mode values
  numerator: string;
  denominator: string;
  onNumeratorChange: (value: string) => void;
  onDenominatorChange: (value: string) => void;

  // Decimal mode values
  decimalValue: string;
  onDecimalChange: (value: string) => void;

  // Mode control
  mode: FractionInputMode;
  onModeChange: (mode: FractionInputMode) => void;

  // Common props
  onSubmit?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  showLabels?: boolean;
  showModeToggle?: boolean;
  colorScheme?: string;
};

export default function FractionInput({
  numerator,
  denominator,
  onNumeratorChange,
  onDenominatorChange,
  decimalValue,
  onDecimalChange,
  mode,
  onModeChange,
  onSubmit,
  disabled = false,
  autoFocus = false,
  showLabels = true,
  showModeToggle = true,
  colorScheme = "teal",
}: FractionInputProps) {
  const { t } = useTranslation();
  const denominatorRef = useRef<HTMLInputElement>(null);

  const handleNumeratorKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && numerator !== "") {
      denominatorRef.current?.focus();
    }
  };

  const handleDenominatorKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  const handleDecimalKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <VStack spacing={2} align="center">
      {/* Mode Display - Fixed height container */}
      <Box minH="200px" display="flex" alignItems="center" justifyContent="center">
        {mode === "decimal" ? (
          // Decimal Input
          <Input
            name="decimal"
            value={decimalValue}
            onChange={(e) => onDecimalChange(e.target.value)}
            onKeyPress={handleDecimalKeyPress}
            placeholder="?"
            size="md"
            fontSize="2xl"
            fontWeight="bold"
            textAlign="center"
            width="120px"
            minWidth="120px"
            maxWidth="120px"
            autoFocus={autoFocus}
            type="number"
            inputMode="decimal"
            step="0.01"
            borderWidth={3}
            borderColor={`${colorScheme}.400`}
            _focus={{
              borderColor: `${colorScheme}.500`,
              boxShadow: `0 0 0 3px rgba(45, 212, 191, 0.3)`,
            }}
            disabled={disabled}
          />
        ) : (
          // Fraction Input
          <VStack spacing={1} align="center">
            {showLabels && (
              <Text fontSize="xs" color="gray.600" fontWeight="medium">
                {t("common.numerator")}
              </Text>
            )}
            <Input
              name="numerator"
              value={numerator}
              onChange={(e) => onNumeratorChange(e.target.value)}
              onKeyPress={handleNumeratorKeyPress}
              placeholder="?"
              size="md"
              fontSize="2xl"
              fontWeight="bold"
              textAlign="center"
              width="120px"
              minWidth="120px"
              maxWidth="120px"
              autoFocus={autoFocus}
              type="number"
              inputMode="numeric"
              borderWidth={3}
              borderColor={`${colorScheme}.400`}
              _focus={{
                borderColor: `${colorScheme}.500`,
                boxShadow: `0 0 0 3px rgba(45, 212, 191, 0.3)`,
              }}
              disabled={disabled}
            />
            <Box width="120px" height="3px" bg="gray.600" my={1} />
            <Input
              ref={denominatorRef}
              name="denominator"
              value={denominator}
              onChange={(e) => onDenominatorChange(e.target.value)}
              onKeyPress={handleDenominatorKeyPress}
              placeholder="?"
              size="md"
              fontSize="2xl"
              fontWeight="bold"
              textAlign="center"
              width="120px"
              minWidth="120px"
              maxWidth="120px"
              type="number"
              inputMode="numeric"
              borderWidth={3}
              borderColor={`${colorScheme}.400`}
              _focus={{
                borderColor: `${colorScheme}.500`,
                boxShadow: `0 0 0 3px rgba(45, 212, 191, 0.3)`,
              }}
              disabled={disabled}
            />
            {showLabels && (
              <Text fontSize="xs" color="gray.600" fontWeight="medium">
                {t("common.denominator")}
              </Text>
            )}
          </VStack>
        )}
      </Box>

      {/* Mode Toggle */}
      {showModeToggle && (
        <HStack spacing={2} mt={2}>
          <Button
            size="xs"
            variant={mode === "decimal" ? "solid" : "outline"}
            colorScheme={colorScheme}
            onClick={() => onModeChange("decimal")}
            disabled={disabled}
          >
            {t("common.decimal")}
          </Button>
          <Button
            size="xs"
            variant={mode === "fraction" ? "solid" : "outline"}
            colorScheme={colorScheme}
            onClick={() => onModeChange("fraction")}
            disabled={disabled}
          >
            {t("common.fraction")}
          </Button>
        </HStack>
      )}
    </VStack>
  );
}

