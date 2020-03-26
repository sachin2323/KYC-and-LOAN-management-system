exports.userReqAttrs = [
  { name: "id" },
  { name: "name" },
  { name: "user_role" },
  { name: "enrollment_id" }
];

exports.userRoleReqAttrs = [
  { name: "hf.Registrar.Roles" },
  { name: "hf.Registrar.Attributes" }
];

exports.userRoleAttrs = [
  { name: "hf.Registrar.Roles", value: "client" },
  {
    name: "hf.Registrar.Attributes",
    value:
      "hf.Registrar.Roles, hf.Registrar.Attributes, id, email, name, user_role, enrollment_id"
  }
];

exports.adminRoleReqAttrs = [
  { name: "hf.Revoker" },
  { name: "hf.GenCRL" },
  { name: "hf.Registrar.Roles" },
  { name: "hf.Registrar.Attributes" }
];

exports.adminRoleAttrs = [
  { name: "hf.Revoker", value: "true" },
  { name: "hf.GenCRL", value: "true" },
  { name: "hf.Registrar.Roles", value: "client" },
  {
    name: "hf.Registrar.Attributes",
    value:
      "hf.Revoker, hf.GenCRL, hf.Registrar.Roles, hf.Registrar.Attributes, id, name, user_role, enrollment_id"
  }
];
