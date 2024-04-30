import * as React from 'react';
import Box from '@mui/material/Box';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import { Button, Container } from "@mui/material";
import {useState} from "react";

function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const validateBirthDate = (birthDate) => {
    const inputDate = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // normalize today date to start of day
    return inputDate <= today;
};

const validateEmail = (email) => {
    return email.includes('@');
};

const validatePhoneNumber = (phoneNumber) => {
    // at least 4 digits
    let regex = /^\d{4,}$/;
    return regex.test(phoneNumber);
};

const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
        editable: true,
    },
    {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: true,
    },
    {
        field: 'email',
        headerName: 'E-mail',
        sortable: true,
        width: 200,
        editable: true,
    },
    {
        field: 'phoneNumber',
        headerName: 'Phone number',
        type: 'number',
        width: 115,
        editable: true,
    },
    {
        field: 'birthDate',
        headerName: 'Birth Date',
        type: 'date',
        width: 125,
        editable: true
    },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 50,
        editable: false,
        valueGetter: (value, row) => calculateAge(row.birthDate)
    }
];


function App() {
    const [rows, setRows] = useState([
        { id: 1, lastName: 'Snow', firstName: 'Jon', email: 'snow@example.com', phoneNumber: 234567890, birthDate: new Date('1990-01-01') },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', email: 'cer@queen.com', phoneNumber: 987654321, birthDate: new Date('1992-05-10') },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', email: 'jaime@queen.com', phoneNumber: 111222333, birthDate: new Date('1995-12-12') },
        { id: 4, lastName: 'Stark', firstName: 'Arya', email: 'stark@example.com', phoneNumber: 444555666, birthDate: new Date('1998-02-02') },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', email: 'daenerys@dragons.com', phoneNumber: 777888999, birthDate: new Date('1991-03-03') }
    ]);

    const [selectionModel, setSelectionModel] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});

    const processRowUpdate = (newRow, oldRow) => {
        // validations
        if (newRow.email && !validateEmail(newRow.email)) {
            alert('Invalid email address. An email must include "@" symbol.');
            return oldRow;
        }
        if (newRow.phoneNumber && !validatePhoneNumber(newRow.phoneNumber)) {
            alert('Invalid phone number. Phone number must be numeric and at least 4 numbers long.');
            return oldRow;
        }
        if (!newRow.birthDate) {
            alert('Invalid birth date. Date must be correct.');
            return oldRow;
        }
        if (!validateBirthDate(newRow.birthDate)) {
            alert('Invalid birth date. Date must not be in the future.');
            return oldRow;
        }

        // all validations passed
        setRows(rows.map(row => row.id === newRow.id ? newRow : row));
        return { ...newRow, isNew: false };
    };

    const handleAddRow = () => {
        const newId = rows.length > 0 ? Math.max(...rows.map(row => row.id)) + 1 : 1;
        const newRow = {
            id: newId,
            lastName: '',
            firstName: '',
            email: '',
            phoneNumber: '',
            birthDate: new Date()
        };
        newRow.birthDate.setHours(0, 0, 0, 0);  // normalize birth date to start of day
        if (!validateBirthDate(newRow.birthDate)) {
            alert('Default birth date validation failed');
        }
        setRows([...rows, newRow]);
    };

    const handleRowModesModelChange = (newModel) => {
        setRowModesModel(newModel);
    };


    const handleRemoveSelected = () => {
        // sanity check
        if (selectionModel.length === 0) {
            alert('Nothing to remove');
            return;
        }
        // dialog to confirm deletion
        if (!window.confirm(`Are you sure you want to delete ${selectionModel.length} rows?`)) {
            return;
        }
        setRows(rows.filter(row => !selectionModel.includes(row.id)));
    };

    return (
      <Container sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      height: '100vh',
                      }}
      >
        <Box sx={{
          width: '90%',
          height: '80vh',
        }}>
          <Button
              sx={{
                  margin: '1vh',
                  ml: 0,
                  color: 'gray',
                  borderColor: 'gray',
                  '&:hover': {
                      color: 'white',
                      backgroundColor: 'red',
                      borderColor: 'red',
                  }
              }}
              variant="outlined"
              onClick={handleRemoveSelected}
          >
            Remove
          </Button>
          <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    // pageSize: 5,
                  },
                },
              }}
              hideFooter
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(newSelection) => {
                  setSelectionModel(newSelection);
              }}
              rowSelectionModel={selectionModel}
              processRowUpdate={processRowUpdate}
              onRowModesModelChange={handleRowModesModelChange}
              rowModesModel={rowModesModel}
              sx={{
                  fontSize: '1vw',
              }}
          />
            <Button
                sx={{
                    margin: '1vh',
                    ml: 0,
                    color: 'gray',
                    borderColor: 'gray',
                    '&:hover': {
                        color: 'white',
                        backgroundColor: 'green',
                        borderColor: 'green',
                    }
                }}
                variant="outlined"
                onClick={handleAddRow}
            >
                Add
            </Button>
        </Box>
      </Container>
  );
}

export default App;