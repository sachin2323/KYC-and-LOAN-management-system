var atrmapping = {
  name: "Name",
  PPSId: "PPSID",
  phoneNumbers: "PhoneNumbers",
  date_of_birth: "DateOfBirth",
  birth_marks: "BirthMarks",
  mothers_maiden_name: "MothersMaidenName",
  drivers_license: "DriversLicense",
  passport: "Passport",
  //card_information: "CardInformation",
  nationality: "Nationality",
  email_address: "EmailAddress",
  //loyalty_cards: "LoyaltyCards",
  //preferences: "Preferences",
  national_age_card:"NationalAgeCard",
  identificationForm:"IdentificationForm",
  utilityBills:"UtilityBills",
  homeInsurance:"HomeInsurance",
  carInsurance:"CarInsurance",
  taxCreditCertificate:"TaxCreditCertificate",
  salaryCertificate:"SalaryCertificate",
  employeePayslip:"EmployeePayslip",
  bankStatement:"BankStatement",
  other:"Other",
};

let parseOrgReq = data => {
  let returnData = [];

  if (data.approved_requests.length) {
    for (let i = 0; i < data.approved_requests.length; i++) {
      let record = data.approved_requests[i][0].kyc_record;
      let allowedFields = data.approved_infos[i].infos;
      for (var key in record) {
        console.log(key);
        if (allowedFields.indexOf(atrmapping[key]) < 0) {
          delete record[key];
        }
      }
      console.log(record);
      returnData.push(record);
    }
  }
  return returnData;
};

module.exports = {
  parseOrgReq
};
