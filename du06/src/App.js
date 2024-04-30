

import { Container, Grid, Typography, Button } from '@mui/material';
import React from 'react';
import ContactList from "./ContactList";
import ContactForm from "./ContactForm";

function App() {
    const [contacts, setContacts] = React.useState([
        { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com",
            phoneNumber: "123456789", street: "First St", houseNumber: 100 },
        { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com",
            phoneNumber: "987654321", street: "Second St", houseNumber: 200 },
        { id: 3, firstName: "Alice", lastName: "Johnson", email: "alice@example.com",
            phoneNumber: "456789123", street: "Third St", houseNumber: 300 },
        { id: 4, firstName: "Bob", lastName: "Brown", email: "bobb@example.com",
            phoneNumber: "789123456"}
    ]);
    const [selectedContact, setSelectedContact] = React.useState(null);

    const handleSelectContact = (contact) => setSelectedContact(contact);

    const handleContactChange = (updatedContact) => setSelectedContact(updatedContact);

    const handleSaveContact = () => {
        if (!selectedContact.firstName.trim() && !selectedContact.lastName.trim()) {
            alert("Please enter at least a first name or a last name.");
            return;
        }

        if (selectedContact.id) {
            setContacts(contacts.map(c => c.id === selectedContact.id ? selectedContact : c));
        } else {
            setContacts([...contacts, { ...selectedContact, id: Math.max(0, ...contacts.map(c => c.id)) + 1 }]);
        }
        setSelectedContact(null);
    };

    const handleAddNewContact = () => {
        setSelectedContact({ id: null, firstName: '', lastName: '', email: '', phoneNumber: '', street: '', houseNumber: '' });
    };

    const handleDeleteContact = (contactId) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            const updatedContacts = contacts.filter(contact => contact.id !== contactId);
            setContacts(updatedContacts);
            setSelectedContact(null);
            alert("Contact has been deleted successfully.");
        }
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mt: 4, pt: 2, border: '4px solid #555', borderRadius: '4px', padding: '8px' }} width="fit-content">
                Contacts Manager
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Button variant="outlined" color="primary" onClick={handleAddNewContact} sx={{ mb: "0.5vh", color: '#555', borderColor: '#555' }}>
                        Add New Contact
                    </Button>
                    <ContactList contacts={contacts} onSelect={handleSelectContact} />
                </Grid>
                <Grid item xs={9}>
                    {selectedContact &&
                        <ContactForm contact={selectedContact} onChange={handleContactChange} onSave={handleSaveContact} onDelete={() => handleDeleteContact(selectedContact.id)} />
                    }
                </Grid>
            </Grid>
        </Container>
    );
}

export default App;
