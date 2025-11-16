// Simple DTO helpers for user objects

function toPublicDTO(user) {
  if (!user) return null;
  // user may be a Mongoose doc or plain object
  const u = (typeof user.toObject === 'function') ? user.toObject() : JSON.parse(JSON.stringify(user));
  delete u.password;
  return u;
}

function fromRequestBody(body) {
  // whitelist fields we accept from client
  return {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    age: body.age,
    password: body.password,
    cart: body.cart,
    role: body.role
  };
}

module.exports = { toPublicDTO, fromRequestBody };
