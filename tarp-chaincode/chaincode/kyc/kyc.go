// Package kyc deals with all kyc record related operations
package kyc

import (
	"encoding/json"
	"fmt"

	// "errors"
	eh "github.com/chaincode/errorhandler"
	fc "github.com/chaincode/fabcrypt"
	"github.com/chaincode/utils"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
	// "time"
)

// MasterRecord definition
type MasterRecord struct {
	PPSSubrecord    SubRecord          `json:"PPS_subrecord"`
	KycRecord          Record             `json:"kyc_record"`
	VerificationRecord VerificationRecord `json:"verification_record"`
}

// Address belongs to a KYC record
type Address struct {
	ID                  string `json:"id"`
	AddressType         string `json:"addressType"`
	AddressLine1        string `json:"addressLine1"`
	AddressLine2        string `json:"addressLine2"`
	AddressLine3        string `json:"addressLine3"`
	CityOrTownOrVillage string `json:"cityOrTownOrVillage"`
	PostalCode          string `json:"postalCode"`
	StateOrUT           string `json:"stateOrUT"`
	CreatedAt           string `json:"createdAt"`
	UpdatedAt           string `json:"updatedAt"`
	Class               string `json:"class"`
}

// Record is the model for a sample KYC Record
type Record struct {
	ID                string   `json:"id"`
	Name              string   `json:"name"`
	PPSID          string   `json:"PPSId"`
	PhoneNumbers      []string `json:"phoneNumbers"`
	AddressIDs        []string `json:"addressIds"`
	Owner             string   `json:"owner"`
	CreatedBy         string   `json:"created_by"`
	MSPID             string   `json:"mspId"`
	CreatedAt         string   `json:"createdAt"`
	UpdatedAt         string   `json:"updatedAt"`
	Class             string   `json:"class"`
	DateOfBirth       string   `json:"date_of_birth"`
	BirthMarks        string   `json:"birth_marks"`
	MothersMaidenName string   `json:"mothers_maiden_name"`
	DriversLicense    string   `json:"drivers_license"`
	Passport          string   `json:"passport"`
	CardInformation   string   `json:"card_information"`
	Nationality       string   `json:"nationality"`
	EmailAddress      string   `json:"email_address"`
	LoyaltyCards      string   `json:"loyalty_cards"`
	Preferences       string   `json:"preferences"`
}

// SubRecord belongs to a single PPS record
type SubRecord struct {
	KYCID string `json:"kycId"`
	MSPID string `json:"mspId"`
}

// PPSRecord is the model with PPS card as the primary key
type PPSRecord struct {
	PPSID   string      `json:"PPSId"`
	UserID     string      `json:"userId"`
	SubRecords []SubRecord `json:"subRecords"`
	CreatedAt  string      `json:"createdAt"`
	UpdatedAt  string      `json:"updatedAt"`
	Class      string      `json:"class"`
}

// VerificationRecord belongs to a single KYC Record
type VerificationRecord struct {
	ID             string `json:"id"`
	KYCID          string `json:"kycId"`
	Status         string `json:"status"`
	VerifiedBy     string `json:"verifiedBy"`
	ReferencedFrom string `json:"referencedFrom"`
	OrganizationID string `json:"organizationId"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
	Class          string `json:"class"`
}

// Add is used to add a KYC record and store to the state - CouchDB
//
// args : [id, name, PPSId, phoneNumbers(stringified array), dateOfBirth, birthMarks, mothersMaidenName, driversLicense, passport, cardInformation, nationality, emailAddress, loyaltyCards, preferences]
func Add(APIstub shim.ChaincodeStubInterface, args []string, userID string, mspID string, OwnerID string, processed string) (sc.Response, sc.Response) {

	phoneNumbers, err := utils.SliceFromString(args[3])
	if err != nil {
		return shim.Error(err.Error()), shim.Success(nil)
	}

	fmt.Println(args[2])
	fmt.Println(phoneNumbers)
	record := Record{
		ID:                args[0],
		Name:              args[1],
		PPSID:          args[2],
		PhoneNumbers:      phoneNumbers,
		Owner:             OwnerID,
		CreatedBy:         userID,
		MSPID:             mspID,
		CreatedAt:         utils.GetTimestampAsISO(APIstub),
		Class:             "Record",
		DateOfBirth:       args[4],
		BirthMarks:        args[5],
		MothersMaidenName: args[6],
		DriversLicense:    args[7],
		Passport:          args[8],
		CardInformation:   args[9],
		Nationality:       args[10],
		EmailAddress:      args[11],
		LoyaltyCards:      args[12],
		Preferences:       args[13]}

	fmt.Println(record)
	recordAsBytes, _ := json.Marshal(record)

	PPSRecordAsSCResponse := addPPSRecord(APIstub, []string{args[2], args[0]}, mspID, OwnerID)
	if PPSRecordAsSCResponse.GetMessage() != "" {
		return PPSRecordAsSCResponse, shim.Success(recordAsBytes)
	}

	err = APIstub.PutState(args[0], recordAsBytes)
	if err != nil {
		return shim.Error(err.Error()), shim.Success(recordAsBytes)
	}

	PPSRecordAsBytes := PPSRecordAsSCResponse.GetPayload()
	completePayloadAsBytes := utils.JoinResponseBytes([]string{string(recordAsBytes[:]), string(PPSRecordAsBytes[:])})

	return shim.Success(completePayloadAsBytes), shim.Success(recordAsBytes)

}

// args : [PPSID, KYCID]
func addPPSRecord(APIstub shim.ChaincodeStubInterface, args []string, mspID string, userID string) sc.Response {

	PPSRecord := PPSRecord{}
	PPSRecord.CreatedAt = utils.GetTimestampAsISO(APIstub)
	subRecord := SubRecord{args[1], mspID}

	PPSAsHash := fc.GetMD5Hash(args[0])
	existingPPSRecordAsBytes, err := APIstub.GetState(PPSAsHash)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	if existingPPSRecordAsBytes != nil {
		err = json.Unmarshal(existingPPSRecordAsBytes, &PPSRecord)
		if err != nil {
			return shim.Error(err.Error())
		}
		// if !verifyPPSMSP(PPSRecord, mspID) {
		// 	return shim.Error("KYC record for given PPS number already exists for this organization.")
		// }
		PPSRecord.SubRecords = append(PPSRecord.SubRecords, subRecord)
		PPSRecordAsBytes, _ := json.Marshal(PPSRecord)
		err = APIstub.PutState(PPSAsHash, PPSRecordAsBytes)
		return eh.SystemError(err, PPSRecordAsBytes)
	}

	PPSRecord.PPSID = PPSAsHash
	PPSRecord.UserID = userID
	PPSRecord.Class = "PPSRecord"
	PPSRecord.SubRecords = append(PPSRecord.SubRecords, subRecord)

	PPSRecordAsBytes, _ := json.Marshal(PPSRecord)
	err = APIstub.PutState(PPSAsHash, PPSRecordAsBytes)
	return eh.SystemError(err, PPSRecordAsBytes)

}

func deletePPSRecord(APIstub shim.ChaincodeStubInterface, oldPPSNumber string) error {
	PPSID := fc.GetMD5Hash(oldPPSNumber)
	err := APIstub.DelState(PPSID)
	return err
}

// UpdateRecord will update an existing record
//
// args : [id, name, PPSId, phoneNumbers(stringified array)]
func UpdateRecord(APIstub shim.ChaincodeStubInterface, args []string, kycRecordAsBytes []byte, mspID string) sc.Response {

	record := Record{}
	record.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	err := json.Unmarshal(kycRecordAsBytes, &record)
	if err != nil {
		return shim.Error(err.Error())
	}
	if record.MSPID != mspID {
		return shim.Error("MSPID don't match.")
	}

	record.Name = args[1]
	fmt.Println(record.PPSID, args[2])
	if record.PPSID != args[2] {
		err := deletePPSRecord(APIstub, record.PPSID)
		if err != nil {
			return shim.Error(err.Error())
		}
		fmt.Println("deleted PPS redcord")
		response := addPPSRecord(APIstub, []string{args[2], record.ID}, mspID, record.Owner)
		if response.GetMessage() != "" {
			return response
		}
		fmt.Println("PPS record added")
	}

	record.PPSID = args[2]

	phoneNumbers, err := utils.SliceFromString(args[3])
	if err != nil {
		return shim.Error(err.Error())
	}
	record.PhoneNumbers = phoneNumbers

	updatedRecordAsBytes, _ := json.Marshal(record)

	err = APIstub.PutState(record.ID, updatedRecordAsBytes)
	return eh.SystemError(err, updatedRecordAsBytes)
}

func verifyPPSMSP(PPSRecord PPSRecord, mspID string) bool {
	for i := 0; i < len(PPSRecord.SubRecords); i++ {
		if PPSRecord.SubRecords[i].MSPID == mspID {
			return false
		}
	}
	return true
}

// AddAddress will add an address to an existing KYC record.
// Since a user can have multiple addresses, this is used.
//
// args : [kycID, ID, AddressType, AddressLine1, AddressLine2, AddressLine3, CityOrTownOrVillage, PostalCode, StateOrUT ]
func AddAddress(APIstub shim.ChaincodeStubInterface, recordAsBytes []byte, args []string, userID string) sc.Response {

	address := Address{
		ID:                  args[1],
		AddressType:         args[2],
		AddressLine1:        args[3],
		AddressLine2:        args[4],
		AddressLine3:        args[5],
		CityOrTownOrVillage: args[6],
		PostalCode:          args[7],
		StateOrUT:           args[8],
		CreatedAt:           utils.GetTimestampAsISO(APIstub),
		Class:               "Address",
	}

	addressAsBytes, _ := json.Marshal(address)
	err := APIstub.PutState(args[1], addressAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	record := Record{}
	err = json.Unmarshal(recordAsBytes, &record)
	record.AddressIDs = append(record.AddressIDs, address.ID)
	updatedRecordAsBytes, _ := json.Marshal(record)

	err = APIstub.PutState(args[0], updatedRecordAsBytes)
	return eh.SystemError(err, updatedRecordAsBytes)
}

// AddVerificationRecord will verify a KYCID and update the status
//
// args : [kycId, Status, referenceVerificationRecordID]
func AddVerificationRecord(APIstub shim.ChaincodeStubInterface, kycRecordAsBytes []byte, args []string, userID string, mspID string, organizationID string) sc.Response {

	kycRecord := Record{}
	err := json.Unmarshal(kycRecordAsBytes, &kycRecord)
	if err != nil {
		return shim.Error(err.Error())
	}

	// if args[2] != "" {
	// 	if kycRecord.MSPID != mspID {
	// 		return shim.Error("MSPIDs don't match")
	// 	}
	// }

	verificationRecordID := fc.GetMD5Hash(args[0] + "VerificationRecord")
	verificationRecord := VerificationRecord{
		ID:             verificationRecordID,
		KYCID:          args[0],
		Status:         args[1],
		VerifiedBy:     userID,
		ReferencedFrom: args[2],
		OrganizationID: organizationID,
		CreatedAt:      utils.GetTimestampAsISO(APIstub),
		Class:          "VerificationRecord",
	}

	verificationRecordAsBytes, _ := json.Marshal(verificationRecord)
	err = APIstub.PutState(verificationRecordID, verificationRecordAsBytes)
	return eh.SystemError(err, verificationRecordAsBytes)
}

// UpdateVerificationRecordStatus updates the KYC record status
//
// args : [verificationRecordID, kycID, PPSId, statusUpdate]
func UpdateVerificationRecordStatus(APIstub shim.ChaincodeStubInterface, args []string, existingRecordAsBytes []byte, existingVerificationRecordAsBytes []byte, userID string, mspID string) sc.Response {

	verificationRecord := VerificationRecord{}
	verificationRecord.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	err := json.Unmarshal(existingVerificationRecordAsBytes, &verificationRecord)
	if err != nil {
		return shim.Error(err.Error())
	}
	record := Record{}
	err = json.Unmarshal(existingRecordAsBytes, &record)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println(record)

	if record.PPSID != args[2] {
		return shim.Error("PPS ID don't match")
	}
	if record.MSPID != mspID {
		return shim.Error("MSP IDs don't match")
	}
	verificationRecord.Status = args[3]
	verificationRecord.VerifiedBy = userID
	verificationRecordAsBytes, _ := json.Marshal(verificationRecord)

	err = APIstub.PutState(args[0], verificationRecordAsBytes)
	return eh.SystemError(err, verificationRecordAsBytes)
}
