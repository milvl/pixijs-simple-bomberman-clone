import * as React from 'react';
import Box from '@mui/material/Box';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import { Button, Container } from "@mui/material";
import {useState} from "react";
import i18next from "i18next";
import { initReactI18next} from "react-i18next";
import { useTranslation } from "react-i18next";

i18next.
    use(initReactI18next).
    init({
    fallbackLng: 'cs',
    lng: 'en',
    resources: {
        en: {
            translation: {
                "First name": "First name",
                "Last name": "Last name",
                "E-mail": "E-mail",
                "Phone number": "Phone number",
                "Birth Date": "Birth Date",
                "Age": "Age",
                "Salary": "Salary",
                "Remove": "Remove",
                "Add": "Add",
                "invalid_email": 'Invalid email address. An email must include "@" symbol.',
                "invalid_phone": 'Invalid phone number. Phone number must be numeric and at least 4 numbers long.',
                "invalid_birth_date": 'Invalid birth date. Date must be correct.',
                "invalid_future_date": 'Invalid birth date. Date must not be in the future.',
                "invalid_salary": "Invalid salary. Salary must be a positive number.",
                "failed_validation": 'Default birth date validation failed',
                "Nothing to remove": 'Nothing to remove',
                "delete_prompt_single": "Are you sure you want to delete {{count}} row?",
                "delete_prompt_couple": "Are you sure you want to delete {{count}} rows?",
                "delete_prompt_plural": "Are you sure you want to delete {{count}} rows?",
            }
        },
        cs: {
            translation: {
                "First name": "Jméno",
                "Last name": "Příjmení",
                "E-mail": "E-mail",
                "Phone number": "Telefonní číslo",
                "Birth Date": "Datum narození",
                "Age": "Věk",
                "Salary": "Plat",
                "Remove": "Odebrat",
                "Add": "Přidat",
                "invalid_email": 'Neplatná e-mailová adresa. E-mail musí obsahovat znak "@".',
                "invalid_phone": 'Neplatné telefonní číslo. Telefonní číslo musí být číslo a mít alespoň 4 číslice.',
                "invalid_birth_date": 'Neplatné datum narození. Datum musí být správné.',
                "invalid_future_date": 'Neplatné datum narození. Datum nesmí být v budoucnosti.',
                "invalid_salary": "Neplatný plat. Plat musí být kladné číslo.",
                "failed_validation": 'Výchozí ověření data narození selhalo',
                "Nothing to remove": 'Nic k odstranění',
                "delete_prompt_single": 'Opravdu chcete smazat {{count}} řádek?',
                "delete_prompt_couple": 'Opravdu chcete smazat {{count}} řádky?',
                "delete_prompt_plural": 'Opravdu chcete smazat {{count}} řádků?',
            }
        }
    }
});

function App() {
    /** Translation hook */
    const { t } = useTranslation();

    /**
     * Calculates age from birth date.
     * @param birthDate Birth date to calculate age from.
     * @returns {number} Calculated age.
     */
    function calculateAge(birthDate: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    /**
     * Validates birth date.
     * @param birthDate Birth date to validate.
     * @returns {boolean} True if birth date is valid, false otherwise.
     */
    const validateBirthDate = (birthDate) => {
        const inputDate = new Date(birthDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);  // normalize today date to start of day
        return inputDate <= today;
    };

    /**
     * Validates email address.
     * @param email Email address to validate.
     * @returns {*} True if email is valid, false otherwise.
     */
    const validateEmail = (email) => {
        return email.includes('@');
    };

    /**
     * Validates phone number.
     * @param phoneNumber Number to validate.
     * @returns {boolean} True if phone number is valid, false otherwise.
     */
    const validatePhoneNumber = (phoneNumber) => {
        // at least 4 digits
        let regex = /^\d{4,}$/;
        return regex.test(phoneNumber);
    };

    /**
     * Data grid columns definition.
     */
    const columns: GridColDef<(typeof rows)[number]>[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'firstName',
            headerName: t("First name"),
            width: 150,
            editable: true,
        },
        {
            field: 'lastName',
            headerName: t("Last name"),
            width: 150,
            editable: true,
        },
        {
            field: 'email',
            headerName: t("E-mail"),
            sortable: true,
            width: 200,
            editable: true,
        },
        {
            field: 'phoneNumber',
            headerName: t("Phone number"),
            type: 'number',
            width: 150,
            editable: true,
            renderCell: (params) => {
                const formattedPhone = params.value.toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
                return <span>{formattedPhone}</span>;
            }
        },
        {
            field: 'birthDate',
            headerName: t("Birth Date"),
            type: 'date',
            width: 150,
            editable: true,
            renderCell: (params) => {
                const formattedDate = new Intl.DateTimeFormat(i18next.language, {
                    day: 'numeric', month: 'numeric', year: 'numeric'
                }).format(new Date(params.value));
                return <span>{formattedDate}</span>;
            }
        },
        {
            field: 'age',
            headerName: t("Age"),
            type: 'number',
            width: 60,
            editable: false,
            valueGetter: (value, row) => calculateAge(row.birthDate)
        },
        {
            field: 'salary',
            headerName: t("Salary"),
            type: 'number',
            width: 150,
            editable: true,
            renderCell: (params) => {
                const currency = i18next.language === 'en' ? 'CZK' : 'Kč';
                const formattedSalary = new Intl.NumberFormat(i18next.language, {
                    style: 'currency', currency: 'CZK', currencyDisplay: 'code'
                }).format(params.value);
                return <span>{formattedSalary.replace('CZK', currency)}</span>;
            }
        },
    ];

    /** Initial rows state */
    const [rows, setRows] = useState([
        { id: 1, lastName: 'Snow', firstName: 'Jon', email: 'snow@example.com', phoneNumber: 234567890, birthDate: new Date('1990-01-01'), salary: 50000 },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', email: 'cer@queen.com', phoneNumber: 987654321, birthDate: new Date('1992-05-10'), salary: 100000 },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', email: 'jaime@queen.com', phoneNumber: 111222333, birthDate: new Date('1995-12-12'), salary: 80000 },
        { id: 4, lastName: 'Stark', firstName: 'Arya', email: 'stark@example.com', phoneNumber: 444555666, birthDate: new Date('1998-02-02'), salary: 60000 },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', email: 'daenerys@dragons.com', phoneNumber: 777888999, birthDate: new Date('1991-03-03'), salary: 120000 },
    ]);

    const [selectionModel, setSelectionModel] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});

    /**
     * Processes row update.
     * @param newRow New row data.
     * @param oldRow Old row data.
     * @returns Updated row data.
     */
    const processRowUpdate = (newRow, oldRow) => {
        // validations
        if (newRow.email && !validateEmail(newRow.email)) {
            alert(t("invalid_email"));
            return oldRow;
        }
        if (newRow.phoneNumber && !validatePhoneNumber(newRow.phoneNumber)) {
            alert(t("invalid_phone"));
            return oldRow;
        }
        if (!newRow.birthDate) {
            alert(t("invalid_birth_date"));
            return oldRow;
        }
        if (!validateBirthDate(newRow.birthDate)) {
            alert(t("invalid_future_date"));
            return oldRow;
        }
        if (newRow.salary < 0) {
            alert(t("invalid_salary"));
            return oldRow;
        }

        // all validations passed
        setRows(rows.map(row => row.id === newRow.id ? newRow : row));
        return { ...newRow, isNew: false };
    };

    /**
     * Handles adding a new row.
     */
    const handleAddRow = () => {
        const newId = rows.length > 0 ? Math.max(...rows.map(row => row.id)) + 1 : 1;
        const newRow = {
            id: newId,
            lastName: '',
            firstName: '',
            email: '',
            phoneNumber: '',
            birthDate: new Date(),
            salary: 0,
        };
        newRow.birthDate.setHours(0, 0, 0, 0);  // normalize birth date to start of day
        if (!validateBirthDate(newRow.birthDate)) {
            alert(t("failed_validation"));
        }
        setRows([...rows, newRow]);
    };

    /**
     * Handles row modes model change.
     * @param newModel New row modes model.
     */
    const handleRowModesModelChange = (newModel) => {
        setRowModesModel(newModel);
    };

    /**
     * Handles removal of selected rows.
     */
    const handleRemoveSelected = () => {
        // sanity check
        if (selectionModel.length === 0) {
            alert(t("Nothing to remove"));
            return;
        }
        // dialog to confirm deletion
        let msg = null;
        if (selectionModel.length === 1) {
            msg = t("delete_prompt_single", { count: selectionModel.length });
        }
        else if (selectionModel.length < 5) {
            msg = t("delete_prompt_couple", { count: selectionModel.length });
        }
        else {
            msg = t("delete_prompt_plural", { count: selectionModel.length });
        }
        if (!window.confirm(msg)) {
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
                width: '90vw',
                height: '80vh',
            }}>
                {/* header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1vh',
                }}>

                    {/* remove button */}
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
                        {t("Remove")}
                    </Button>

                    {/* language buttons */}
                    <Box sx={{
                        display: 'inline-block',
                        justifySelf: 'flex-end',
                    }} >
                        <Button
                            sx={{
                                margin: '1vh',
                                ml: 0,
                                color: 'gray',
                                borderColor: 'gray',
                                '&:hover': {
                                    color: 'white',
                                    backgroundColor: 'blue',
                                    borderColor: 'blue',
                                }
                            }}
                            variant="outlined"
                            onClick={() => i18next.changeLanguage('en')}
                        >
                            EN
                        </Button>
                        <Button
                            sx={{
                                margin: '1vh',
                                ml: 0,
                                color: 'gray',
                                borderColor: 'gray',
                                '&:hover': {
                                    color: 'white',
                                    backgroundColor: 'blue',
                                    borderColor: 'blue',
                                }
                            }}
                            variant="outlined"
                            onClick={() => i18next.changeLanguage('cs')}
                        >
                            CS
                        </Button>
                    </Box>
                </Box>
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
                    disableColumnMenu='false'
                    sx={{
                        fontSize: '1.75vh',
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
                    {t("Add")}
                </Button>
            </Box>
        </Container>
    );
}

export default App;