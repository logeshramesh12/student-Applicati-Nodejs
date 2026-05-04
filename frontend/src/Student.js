import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  FormLabel,
  FormControl,
  VStack,
  useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

 const API = process.env.REACT_APP_API_BASE_URL;

function Student() {
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const toast = useToast();
  const navigate = useNavigate();

  // 🔐 Protect route
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/login?role=student");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

 

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API}/addstudent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(studentData)
    });

    const data = await res.json();

    toast({
      title: "Student saved successfully",
      status: "success"
    });

    setStudentData({ name: "", email: "", phone: "" });

  } catch (err) {
    toast({
      title: "Error saving student",
      status: "error"
    });
  }
};

  return (
    <Box>
      <Heading mb={6}>Student Form</Heading>

      <Box as="form" onSubmit={handleSubmit} maxW="lg">
        <VStack spacing={4}>

          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={studentData.name} onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name="email" value={studentData.email} onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input name="phone" value={studentData.phone} onChange={handleChange} />
          </FormControl>

          <Button type="submit" colorScheme="teal">
            Submit
          </Button>

        </VStack>
      </Box>
    </Box>
  );
}

export default Student;