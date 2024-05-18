import { List, ListItem, ListItemText } from '@mui/material';

function ContactList({ contacts, onSelect }) {
    const sortedContacts = contacts.sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { sensitivity: 'base' }));

    return (
        <List>
            {sortedContacts.map((contact) => (
                <ListItem button
                          key={contact.id}
                          onClick={() => onSelect(contact)}
                          sx={{ border: '1px solid #ccc' }}
                >
                    <ListItemText primary={`${contact.firstName} ${contact.lastName}`} />
                </ListItem>
            ))}
        </List>
    );
}

export default ContactList;