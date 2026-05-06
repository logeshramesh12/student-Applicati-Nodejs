import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Text
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE_URL;

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    if (data.role === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-form");
    }
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <Box bg="#1e293b" p={8} rounded="xl" shadow="xl" w="300px">
        <Heading size="md" mb={6} textAlign="center">
          {role === "teacher" ? "Teacher Login" : "Student Login"}
        </Heading>

        <VStack spacing={4}>
          <Input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

          <Button colorScheme="teal" w="full" onClick={handleLogin}>
            Login
          </Button>

          {role === "student" && (
  <Text fontSize="sm">
    New user?{" "}
    <Text
      as="span"
      color="blue.300"
      cursor="pointer"
      fontWeight="bold"
      _hover={{ textDecoration: "underline" }}
      onClick={() => navigate("/register")}
    >
      Register
    </Text>
  </Text>
)}


        </VStack>
      </Box>
    </Box>
  );
}

export default Login;