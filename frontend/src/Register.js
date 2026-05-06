import {
  Box,
  Button,
  Heading,
  Input,
  VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE_URL;

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    alert("Registered successfully");
    navigate("/login/student");
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <Box bg="#1e293b" p={8} rounded="xl" shadow="xl" w="300px">
        <Heading size="md" mb={6} textAlign="center">
          Student Register
        </Heading>

        <VStack spacing={4}>
          <Input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

          <Button colorScheme="green" w="full" onClick={handleRegister}>
            Register
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default Register;