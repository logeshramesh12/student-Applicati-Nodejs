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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  useDisclosure
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE_URL;

function Teacher() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  //  Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("role") !== "teacher") {
      navigate("/login/teacher");
    } else {
      fetchStudents();
    }
  }, []);

  //  Fetch students
  const fetchStudents = async () => {
    const res = await fetch(`${API}/student`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    setStudents(data);
  };

  //  Delete
  const handleDelete = async (id) => {
    await fetch(`${API}/student/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    fetchStudents();
  };

  //  Open edit modal
  const handleEdit = (student) => {
    setEditData(student);
    onOpen();
  };

  //  Update student
  const handleUpdate = async () => {
    await fetch(`${API}/student/${editData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(editData)
    });

    onClose();
    fetchStudents();
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Teacher Dashboard</Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>phone</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {students.map((s) => (
            <Tr key={s.id}>
              <Td>{s.name}</Td>
              <Td>{s.email}</Td>
              <Td>{s.phone}</Td>

              <Td>
                <Button
                  colorScheme="yellow"
                  size="sm"
                  mr={2}
                  onClick={() => handleEdit(s)}
                >
                  Edit
                </Button>

                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDelete(s.id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/*  EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Edit Student</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Input
              mb={3}
              placeholder="Name"
              value={editData?.name || ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />

            <Input
              mb={3}
              placeholder="Email"
              value={editData?.email || ""}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            />

            <Input
              placeholder="phone"
              value={editData?.phone || ""}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
            />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>

            <Button colorScheme="blue" onClick={handleUpdate}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Teacher;