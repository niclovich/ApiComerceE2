const BaseDAO = require('./baseDAO');
const User = require('../models/User');

// create a DAO instance using the BaseDAO class directly
const dao = new BaseDAO(User);

// convenience methods
dao.findByEmail = function (email) {
	return this.findOne({ email });
};

dao.createUser = async function (data) {
	const existing = await this.findByEmail(data.email);
	if (existing) {
		const err = new Error('Email already in use');
		err.code = 'DUPLICATE_EMAIL';
		throw err;
	}
	return this.create(data);
};

module.exports = dao;
