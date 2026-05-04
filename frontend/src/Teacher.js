import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


function Teacher() {
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState([]);
  const API = process.env.REACT_APP_API_BASE_URL;

  // 🔐 Protect route
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "teacher") {
      navigate("/login?role=teacher");
    } else {
      fetchStudents();
    }
  }, []);

  // ✅ FETCH STUDENTS FROM BACKEND
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API}/student`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const result = await res.json();
      setData(result);
    } catch (err) {
      toast({
        title: "Failed to load students",
        status: "error"
      });
    }
  };

  // ✅ DELETE STUDENT (FROM DB)
  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/student/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      toast({
        title: "Student deleted",
        status: "success"
      });

      // refresh data
      fetchStudents();

    } catch (err) {
      toast({
        title: "Delete failed",
        status: "error"
      });
    }
  };

  return (
    <Box>
      <Heading mb={6}>Teacher Dashboard</Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan="4">No students found</Td>
            </Tr>
          ) : (
            data.map((d) => (
              <Tr key={d.id}>
                <Td>{d.name}</Td>
                <Td>{d.email}</Td>
                <Td>{d.phone}</Td>
                <Td>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleDelete(d.id)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}

export default Teacher;