import {
  Box,
  Button,
  Heading,
  Input,
  VStack
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE_URL;

function Student() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (localStorage.getItem("role") !== "student") {
      navigate("/login/student");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  // validation
  if (!data.name || !data.email || !data.phone) {
    alert("Enter all details");
    return;
  }
    await fetch(`${API}/addstudent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(data)
    });

    alert("Saved!");
    setData({ name: "", email: "", phone: "" });
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <Box bg="#1e293b" p={8} rounded="xl" shadow="xl" w="350px">
        <Heading size="md" mb={6} textAlign="center">
          Student Details
        </Heading>

        <VStack spacing={4}>
        <Input
  placeholder="Name"
  value={data.name}
  onChange={(e) => setData({ ...data, name: e.target.value })}
/>

<Input
  placeholder="Email"
  value={data.email}
  onChange={(e) => setData({ ...data, email: e.target.value })}
/>

<Input
  placeholder="Phone"
  value={data.phone}
  onChange={(e) => setData({ ...data, phone: e.target.value })}
/>

          <Button colorScheme="teal" w="full" onClick={handleSubmit}>
            Save
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default Student;
/* Student.css */