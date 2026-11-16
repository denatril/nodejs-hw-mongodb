const Contact = require('../db/models/contact');

const getAllContacts = async (userId, {
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
} = {}) => {
  const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageSize = Math.max(Number.parseInt(perPage, 10) || 10, 1);
  const skip = (currentPage - 1) * pageSize;
  const allowedSortFields = [
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'contactType',
    'createdAt',
    'updatedAt',
  ];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const queryFilter = { userId: userId.toString() };

  if (filter.contactType) {
    queryFilter.contactType = filter.contactType;
  }

  if (filter.isFavourite === 'true' || filter.isFavourite === true) {
    queryFilter.isFavourite = true;
  }

  if (filter.isFavourite === 'false' || filter.isFavourite === false) {
    queryFilter.isFavourite = false;
  }

  const [data, totalItems] = await Promise.all([
    Contact.find(queryFilter)
      .skip(skip)
      .limit(pageSize)
      .sort({ [sortField]: sortDirection }),
    Contact.countDocuments(queryFilter),
  ]);
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    page: currentPage,
    perPage: pageSize,
    totalItems,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
};

const getContactById = (contactId, userId) =>
  Contact.findOne({ _id: contactId, userId: userId.toString() });

const createContact = (payload, userId) =>
  Contact.create({ ...payload, userId: userId.toString() });

const updateContact = (contactId, payload, userId) =>
  Contact.findOneAndUpdate(
    { _id: contactId, userId: userId.toString() },
    payload,
    { new: true },
  );

const deleteContact = (contactId, userId) =>
  Contact.findOneAndDelete({ _id: contactId, userId: userId.toString() });

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
