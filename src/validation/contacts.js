const Joi = require('joi');

const contactFields = {
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().email().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal').min(3).max(20),
};

const createContactSchema = Joi.object({
  ...contactFields,
  name: contactFields.name.required(),
  phoneNumber: contactFields.phoneNumber.required(),
  contactType: contactFields.contactType.required(),
});

const updateContactSchema = Joi.object(contactFields).min(1);

module.exports = {
  createContactSchema,
  updateContactSchema,
};
