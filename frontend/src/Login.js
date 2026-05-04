import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input, Button, VStack, Heading } from "@chakra-ui/react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [searchParams] = useSearchParams();
  const role = searchParams.get("role"); // student / teacher

  const navigate = useNavigate();

  const handleLogin = () => {
    // 🔥 TEMP login (frontend only)
    if (!username || !password) {
      alert("Enter username & password");
      return;
    }

    localStorage.setItem("token", "dummy-token");
    localStorage.setItem("role", role);

    if (role === "student") {
      navigate("/student-form");
    } else {
      navigate("/teacher-dashboard");
    }
  };

  return (
    <VStack spacing={4} mt={10}>
      <Heading>Login ({role})</Heading>

      <Input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button colorScheme="teal" onClick={handleLogin}>
        Login
      </Button>
    </VStack>
  );
}

export default Login;