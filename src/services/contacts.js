const Contact = require('../db/models/contact');

const getAllContacts = () => Contact.find();

const getContactById = (contactId) => Contact.findById(contactId);

const createContact = (payload) => Contact.create(payload);

const updateContact = (contactId, payload) =>
  Contact.findByIdAndUpdate(contactId, payload, { new: true });

const deleteContact = (contactId) => Contact.findByIdAndDelete(contactId);

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
