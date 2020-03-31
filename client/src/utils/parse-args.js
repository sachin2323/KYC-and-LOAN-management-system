let crypto = require("crypto");
let moment = require("moment");

let getRandomValue = value => {
  let bytes = value || 16;
  return crypto.randomBytes(bytes).toString("hex");
};

let addOrganizationArray = args => {
  let returnData = [
    getRandomValue(),
    args.name,
    args.email,
    args.organization_type,
    new Date().toUTCString()
  ];

  return returnData;
};

let addRoleToOrganizationArray = args => {
  let returnData = [args.role];

  return returnData;
};

let addUserArray = args => {
  console.log("TCL: args", args);
  if (args.PPSId) {
    return [
      getRandomValue(),
      args.name,
      args.role,
      args.email,
      args.timestamp || new Date().toISOString(),
      args.PPSId
    ];
  } else {
    return [
      getRandomValue(),
      args.name,
      args.role,
      args.email,
      args.timestamp || new Date().toISOString()
    ];
  }
};

let generateUserAttributes = function(userData, enrollmentId) {
  var resultArray = [
    { name: "id", value: userData.id },
    { name: "name", value: userData.name },
    { name: "user_role", value: userData.role },
    { name: "enrollment_id", value: enrollmentId }
  ];

  return resultArray;
};

let revokeIdentityRecordArray = function(args) {
  let returnData = [args.enrollment_id, args.user_id];

  return returnData;
};

let addKYCRecordArray = function(args) {
  // console.log(moment(args.dateOfBirth).format("DD/MM/YYYY"))
  let returnData = [
    getRandomValue(),
    args.name,
    args.PPS_number,
    JSON.stringify({ data: [args.phone_numbers] }),
    moment(args.dateOfBirth).format("DD/MM/YYYY"),
    args.birthMarks,
    args.mothersMaidenName,
    args.driversLicense,
    args.passport,
    args.other,
    args.nationality,
    args.emailAddress,
    args.national_age_card,
    args.identification_form,
    args.utility_bills,
    args.home_insurance,
    args.car_insurance,
    args.tax_credit_certificate,
    args.salary_certificate,
    args.employee_pay_slip,
    args.bank_statement,
    JSON.stringify({
      data: [
        getRandomValue(),
        "Home",
        args.line1,
        args.line2,
        args.line3,
        args.city_town_village,
        args.postal_code,
        args.state_ut
      ]
    })
  ];
  if (args.status) {
    returnData.push(args.status);
  }
  // console.log(returnData)
  return returnData;
};

let updateKYCRecordArray = function(args) {
  let returnData = [
    args.id,
    args.name,
    args.PPS_number,
    JSON.stringify({ data: args.phone_numbers })
  ];
  return returnData;
};

let addAddressToKYCArray = function(args) {
  let returnData = [
    args.kyc_id,
    getRandomValue(),
    args.type,
    args.line1,
    args.line2,
    args.line3,
    args.city_town_village,
    args.postal_code,
    args.state_ut
  ];
  return returnData;
};

let addVerificationRecordArray = function(args) {
  let returnData = [
    args.kyc_id,
    args.status,
    args.reference_verification_id ? args.reference_verification_id : ""
  ];
  return returnData;
};

let updateVerificationRecordArray = function(args) {
  let returnData = [
    args.verification_record_id,
    args.kyc_id,
    args.PPS_number,
    args.status_update
  ];
  return returnData;
};

let createRequestArray = function(args) {
  let returnData = [args.PPS_number, args.required_documents ? args.required_documents : "null"];
  return returnData;
};

let approveRequestArray = function(args) {
  let returnData = [
    args.organization_id,
    args.status,
    args.timeLimit ? args.timeLimit : "",
    args.allowed ? JSON.stringify({ data: args.allowed }) : []
  ];
  return returnData;
};

let addClaimArray = function(args) {
  return [
    getRandomValue(),
    args.description,
    args.seller_PPS,
    args.organization_name,
    args.surname,
    args.first_name,
    args.gender,
    args.address,
    args.country,
    args.eir_code,
    args.phone_number,
    args.email,
    args.pps_number,
    args.date_of_birth,
    args.martial_status,
    args.no_of_dependents,
    args.seller_name,
    args.seller_email
    /*
    args.owner_rent_living,
    args.outstanding_balance,
    args.current_value_property,
    args.occupation,
    args.postion,
    args.employer_name,
    args.company_address,
    args.years_of_employment,
    args.type_of_employment,
    args.gross_basic_income,
    args.net_monthly_income,
    args.purpose,
    args.purchase_cost,
    args.repair_cost,
    args.value_of_property,
    args.professional_fees,
    args.funding,
    args.agreed_price_of_sale,
    args.amount_of_loan_required,
    args.mortgage_term */
  ];
};

let updateClaimStatusArray = function(args) {
  return [args.claim_id, args.status_update, args.suggestion ? args.suggestion : "null"];
};

let addProofToClaimArray = function(args) {
  return [getRandomValue(), args.claim_id, getRandomValue(), args.proofUrl];
};
/*
let addProofToKYCArray = function(args) {
  return [getRandomValue(), args.kyc_id, getRandomValue(), args.proofUrl];
};*/

module.exports = {
  getRandomValue,
  addOrganizationArray,
  addRoleToOrganizationArray,
  addUserArray,
  generateUserAttributes,
  revokeIdentityRecordArray,
  addKYCRecordArray,
  updateKYCRecordArray,
  addAddressToKYCArray,
  addVerificationRecordArray,
  updateVerificationRecordArray,
  createRequestArray,
  approveRequestArray,
  addClaimArray,
  updateClaimStatusArray,
  addProofToClaimArray,
  //addProofToKYCArray
};
