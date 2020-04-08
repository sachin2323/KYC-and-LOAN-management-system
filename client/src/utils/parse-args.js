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
    args.birthMarks ? args.birthMarks:"null",
    args.mothersMaidenName ? args.mothersMaidenName : "null",
    args.driversLicense ? args.driversLicense : "null",
    args.passport ? args.passport: "null",
    args.other ? args.other:"null",
    args.nationality ? args.nationality : "null",
    args.emailAddress,
    args.national_age_card ? args.national_age_card : "null",
    args.identification_form ? args.identification_form : "null",
    args.utility_bills? args.utility_bills :"null",
    args.home_insurance? args.home_insurance : "null",
    args.car_insurance ? args.car_insurance : "null",
    args.tax_credit_certificate ? args.tax_credit_certificate : "null",
    args.salary_certificate ? args.salary_certificate : "null",
    args.employee_pay_slip ? args.employee_pay_slip : "null", 
    args.bank_statement ? args.bank_statement: "null",
    args.PPS_number_url ? args.PPS_number_url[0].url : "null",
    args.driversLicense_url ? args.driversLicense_url[0].url: "null",
    args.passport_url ? args.passport_url[0].url : "null",
    args.national_age_card_url ? args.national_age_card_url[0].url : "null",
    args.identification_form_url?args.identification_form_url[0].url : "null",
    args.utility_bills_url?  args.utility_bills_url[0].url : "null",
    args.home_insurance_url ? args.home_insurance_url[0].url : "null",
    args.car_insurance_url ? args.car_insurance_url[0].url : "null",
    args.tax_credit_certificate_url ? args.tax_credit_certificate_url[0].url : "null",
    args.salary_certificate_url ? args.salary_certificate_url[0].url : "null",
    args.employee_pay_slip_url? args.employee_pay_slip_url[0].url : "null",
    args.bank_statement_url ? args.bank_statement_url[0].url : "null",
    args.other_url ? args.other_url[0].url : "null",
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
  console.log(returnData);
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

let addKYCProofToKYC = function(args) {
  let returnData = [
    args.kyc_id,
    getRandomValue(),
    args.PPS_number_url ? args.PPS_number_url : "null",
    args.driversLicense_url ? args.driversLicense_url: "null",
    args.passport_url ? args.passport_url : "null",
    args.national_age_card_url ? args.national_age_card_url : "null",
    args.identification_form_url?args.identification_form_url : "null",
    args.utility_bills_url?  args.utility_bills_url : "null",
    args.home_insurance_url ? args.home_insurance_url : "null",
    args.car_insurance_url ? args.car_insurance_url : "null",
    args.tax_credit_certificate_url ? args.tax_credit_certificate_url : "null",
    args.salary_certificate_url ? args.salary_certificate_url : "null",
    args.employee_pay_slip_url? args.employee_pay_slip_url : "null",
    args.bank_statement_url ? args.bank_statement_url : "null",
    args.other_url ? args.other_url : "null",
  ];
  return returnData;
};

let addVerificationRecordArray = function(args) {
  let returnData = [
    args.kyc_id,
    args.status,
    args.reference_verification_id ? args.reference_verification_id : "",
    args.suggestion ? args.suggestion : "null"
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
    args.seller_email,
    args.eir_code_url?args.eir_code_url[0].url:"null",
    args.pps_number_url?args.pps_number_url[0].url:"null",
    args.martial_status_url?args.martial_status_url[0].url:"null",
    args.current_value_property_url?args.current_value_property_url[0].url:"null",
    args.outstanding_balance_url?args.outstanding_balance_url[0].url:"null",
    args.mortgage_term_url?args.mortgage_term_url[0].url:"null",
    args.agreed_price_of_sale_url?args.agreed_price_of_sale_url[0].url:"null",
    args.purchase_cost_url?args.purchase_cost_url[0].url:"null",
    args.repair_cost_url?args.repair_cost_url[0].url:"null",
    args.value_of_property_url?args.value_of_property_url[0].url:"null",
    args.professional_fees_url?args.professional_fees_url[0].url:"null",
	  args.funding_url?args.funding_url[0].url:"null",
    args.job_profile_url?args.job_profile_url[0].url:"null",
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
  return [getRandomValue(), args.claim_id, getRandomValue(), JSON.stringify({ data: [args.imageUrl] })];
};


let addProofToKYCArray = function(args) {
  return [getRandomValue(), args.kyc_id, getRandomValue(), JSON.stringify({ data: [args.imageUrl] })];
};

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
  addKYCProofToKYC,
  addVerificationRecordArray,
  updateVerificationRecordArray,
  createRequestArray,
  approveRequestArray,
  addClaimArray,
  updateClaimStatusArray,
  addProofToClaimArray,
  addProofToKYCArray
};
