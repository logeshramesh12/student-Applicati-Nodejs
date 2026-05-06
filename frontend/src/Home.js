import { Box, Button, Heading, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

 return (
  <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
  <Box
    bg="#1e293b"
    w="full"
    maxW="450px"
    p={10}
    borderRadius="xl"
    boxShadow="xl"
    textAlign="center"
  >
    <Heading mb={6} color="white">
      Student Portal
    </Heading>

    <VStack spacing={4}>
      <Button
        colorScheme="teal"
        w="full"
        onClick={() => navigate("/login/student")}
      >
        Student
      </Button>

      <Button
        colorScheme="blue"
        w="full"
        onClick={() => navigate("/login/teacher")}
      >
        Teacher
      </Button>
    </VStack>
  </Box>
</Box>
);
}

export default Home;