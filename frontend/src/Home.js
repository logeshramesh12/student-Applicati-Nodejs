import { Button, VStack, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <VStack spacing={6} mt={10}>
      <Heading>Student-Teacher Portal</Heading>

      <Button
        colorScheme="teal"
        onClick={() => navigate("/login?role=student")}
      >
        Student
      </Button>

      <Button
        colorScheme="blue"
        onClick={() => navigate("/login?role=teacher")}
      >
        Teacher
      </Button>
    </VStack>
  );
}

export default Home;