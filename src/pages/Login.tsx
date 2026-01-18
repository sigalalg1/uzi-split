import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  SimpleGrid,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useUser } from '../context/UserContext';

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👨', '👩', '🧑', '👴', '👵', '🎨', '🎯', '⭐', '🚀', '🎓', '🏆', '💡', '🔢'];

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { login, createUser, deleteUser, getAllUsers } = useUser();
  
  const [newUsername, setNewUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const existingUsers = getAllUsers();

  const handleLogin = (username: string) => {
    try {
      login(username);
      toast({
        title: t('login.welcomeBack', { username }),
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('login.error'),
        description: String(error),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateUser = () => {
    const trimmedUsername = newUsername.trim();
    
    if (!trimmedUsername) {
      toast({
        title: t('login.emptyUsername'),
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (trimmedUsername.length < 2) {
      toast({
        title: t('login.usernameTooShort'),
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      createUser(trimmedUsername, selectedAvatar);
      toast({
        title: t('login.accountCreated'),
        description: t('login.welcomeUser', { username: trimmedUsername }),
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('login.userExists'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const confirmDelete = (username: string) => {
    setUserToDelete(username);
    onOpen();
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      try {
        deleteUser(userToDelete);
        toast({
          title: t('login.userDeleted'),
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        onClose();
        setUserToDelete(null);
      } catch (error) {
        toast({
          title: t('login.deleteError'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" color="purple.600" mb={2}>
            {t('login.title')}
          </Heading>
          <Text fontSize="lg" color="gray.600">
            {t('login.subtitle')}
          </Text>
        </Box>

        {!showNewUser && existingUsers.length > 0 && (
          <Box w="100%" bg="white" p={8} borderRadius="xl" shadow="lg" borderWidth={2} borderColor="purple.200">
            <VStack spacing={4}>
              <Heading size="md" color="gray.700">
                {t('login.selectUser')}
              </Heading>
              
              <SimpleGrid columns={[2, 3]} spacing={4} w="100%">
                {existingUsers.map((user) => (
                  <Box key={user.username} position="relative">
                    <Button
                      onClick={() => handleLogin(user.username)}
                      colorScheme="purple"
                      variant="outline"
                      size="lg"
                      width="100%"
                      height="100px"
                      flexDirection="column"
                      fontSize="xl"
                      _hover={{ transform: 'scale(1.05)', shadow: 'md' }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="3xl" mb={1}>
                        {user.avatar || '👤'}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" isTruncated maxW="100%">
                        {user.username}
                      </Text>
                    </Button>
                    <IconButton
                      aria-label="Delete user"
                      icon={<DeleteIcon />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      position="absolute"
                      top={1}
                      right={1}
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(user.username);
                      }}
                    />
                  </Box>
                ))}
              </SimpleGrid>

              <Button
                onClick={() => setShowNewUser(true)}
                colorScheme="green"
                variant="outline"
                size="md"
                mt={4}
              >
                + {t('login.createNew')}
              </Button>
            </VStack>
          </Box>
        )}

        {(showNewUser || existingUsers.length === 0) && (
          <Box w="100%" bg="white" p={8} borderRadius="xl" shadow="lg" borderWidth={2} borderColor="green.200">
            <VStack spacing={6}>
              <Heading size="md" color="gray.700">
                {t('login.createAccount')}
              </Heading>

              <VStack spacing={4} w="100%">
                <Box w="100%">
                  <Text mb={2} fontWeight="bold" color="gray.600">
                    {t('login.chooseAvatar')}
                  </Text>
                  <SimpleGrid columns={8} spacing={2}>
                    {AVATAR_OPTIONS.map((avatar) => (
                      <Button
                        key={avatar}
                        onClick={() => setSelectedAvatar(avatar)}
                        size="lg"
                        fontSize="2xl"
                        variant={selectedAvatar === avatar ? 'solid' : 'ghost'}
                        colorScheme={selectedAvatar === avatar ? 'purple' : 'gray'}
                        _hover={{ transform: 'scale(1.1)' }}
                      >
                        {avatar}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box w="100%">
                  <Text mb={2} fontWeight="bold" color="gray.600">
                    {t('login.enterUsername')}
                  </Text>
                  <Input
                    placeholder={t('login.usernamePlaceholder')}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    size="lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateUser();
                      }
                    }}
                  />
                </Box>

                <HStack spacing={4} w="100%">
                  <Button
                    onClick={handleCreateUser}
                    colorScheme="green"
                    size="lg"
                    flex={1}
                    isDisabled={!newUsername.trim()}
                  >
                    {t('login.start')}
                  </Button>
                  
                  {existingUsers.length > 0 && (
                    <Button
                      onClick={() => {
                        setShowNewUser(false);
                        setNewUsername('');
                      }}
                      colorScheme="gray"
                      variant="outline"
                      size="lg"
                    >
                      {t('login.cancel')}
                    </Button>
                  )}
                </HStack>
              </VStack>
            </VStack>
          </Box>
        )}
      </VStack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('login.confirmDelete')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {t('login.confirmDeleteMessage', { username: userToDelete })}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              {t('login.cancel')}
            </Button>
            <Button colorScheme="red" onClick={handleDeleteUser}>
              {t('login.delete')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

