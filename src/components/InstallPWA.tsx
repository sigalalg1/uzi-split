import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  VStack,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      // Automatically show the modal when install is available
      setTimeout(() => onOpen(), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [onOpen]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
      setIsInstallable(false);
    }

    onClose();
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>{t('pwa.installTitle')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>{t('pwa.installDescription')}</Text>
            <VStack spacing={2} align="start" fontSize="sm" color="gray.600">
              <Text>✓ {t('pwa.benefit1')}</Text>
              <Text>✓ {t('pwa.benefit2')}</Text>
              <Text>✓ {t('pwa.benefit3')}</Text>
              <Text>✓ {t('pwa.benefit4')}</Text>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t('pwa.notNow')}
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={DownloadIcon} />}
            onClick={handleInstallClick}
          >
            {t('pwa.install')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

