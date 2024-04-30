import * as React from 'react';
import Box from '@mui/material/Box';
import {DataGrid, GridCellEditStopReasons, GridColDef} from '@mui/x-data-grid';
import { Button, Container } from "@mui/material";
import {GridCellEditStopParams} from "@mui/x-data-grid";
import {MuiEvent} from "@mui/x-data-grid";
import {GridRowsProp} from "@mui/x-data-grid";
import {useState} from "react";

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
    width: 110,
    editable: true,
  },
  {
    field: 'address',
    headerName: 'Address',
    width: 'auto',
    editable: true,
  }
];

const MyDataGrid = () => {
    const [rows, setRows] = useState<GridRowsProp>([
        { id: 1, lastName: 'Snow', firstName: 'Jon', email: 'snow@example.com', phoneNumber: 234567890, address: 'Winterfell' },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', email: 'cer@queen.com', phoneNumber: 987654321, address: 'King\'s Landing' },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', email: 'jaime@queen.com', phoneNumber: 111222333, address: 'King\'s Landing' },
        { id: 4, lastName: 'Stark', firstName: 'Arya', email: 'stark@example.com', phoneNumber: 444555666, address: 'Winterfell' },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', email: 'daenerys@gotdragons.com', phoneNumber: 777888999, address: 'Dragonstone' },
    ]);

const handleCellEditStop = (params: GridCellEditStopParams, event: React.SyntheticEvent) => {
    if (params.reason === GridCellEditStopReasons.cellFocusOut) {
        if (params.field === 'email' && !params.value.includes('@')) {
            alert('Invalid email')
            params.row.email = '';
            // now update the state to reset the invalid email


            // prevent any default action Material-UI might have
            event.stopPropagation();
        }
    }
};


function App() {
  return (
      <Container sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      }}
      >
        <Box sx={{
          height: 400,
          width: '80%',
        }}>
          <Button sx={{
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
                      variant="outlined">
            Remove
          </Button>
          <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
              onCellEditStop={handleCellEditStop}
          />
        </Box>
      </Container>
  );
}

export default App;