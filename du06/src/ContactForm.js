import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { CustomTextField } from './ContactFormStyle';

function ContactForm({ contact, onChange, onSave, onDelete }) {
    const [localContact, setLocalContact] = useState(contact);

    // updates localContact when contact changes
    useEffect(() => {
        setLocalContact(contact);
    }, [contact]);

    const handleChange = (prop) => (event) => {
        const updatedContact = { ...localContact, [prop]: event.target.value };
        setLocalContact(updatedContact);
        onChange(updatedContact);
    };

    return (
        <Grid container spacing={2} padding={2}>
            <CustomTextField
                label="First Name"
                value={localContact.firstName || ''}
                onChange={handleChange('firstName')}
                fullWidth
            />
            <CustomTextField
                label="Last Name"
                value={localContact.lastName || ''}
                onChange={handleChange('lastName')}
                fullWidth
            />
            <CustomTextField
                label="Email"
                value={localContact.email || ''}
                onChange={handleChange('email')}
                fullWidth
            />
            <CustomTextField
                label="Street"
                value={localContact.street || ''}
                onChange={handleChange('street')}
                fullWidth
            />
            <CustomTextField
                label="House Number"
                value={localContact.houseNumber || ''}
                onChange={handleChange('houseNumber')}
                fullWidth
            />
            <Grid item xs={12}>
                <Button variant="contained" onClick={onSave}>
                    Save
                </Button>
                <Button
                    variant="contained"
                    onClick={onDelete}
                    sx={{
                        backgroundColor: 'red',
                        '&:hover': {
                            backgroundColor: 'darkRed',
                        },
                        marginLeft: '8px',
                        marginRight: '8px'
                    }}
                >
                    Delete
                </Button>
                <Button
                    variant="text"
                    onClick={() => onChange(null)}
                    sx={{ color: "gray" }}
                >
                    Cancel
                </Button>
            </Grid>
        </Grid>
    );
}

export default ContactForm;
