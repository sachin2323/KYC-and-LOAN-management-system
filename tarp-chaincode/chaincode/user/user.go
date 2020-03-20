package user

import (
	"encoding/json"
	// "errors"
	"fmt"
	// "strconv"

	"github.com/chaincode/common"
	eh "github.com/chaincode/errorhandler"
	fc "github.com/chaincode/fabcrypt"
	"github.com/chaincode/kyc"
	"github.com/chaincode/utils"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// User is a user in the network
type User struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Role           string   `json:"role"`
	Email          string   `json:"email"`
	OrganizationID string   `json:"organizationId"`
	NationalID     string   `json:"national_id"`
	Status         string   `json:"status"`
	EnrollmentIDs  []string `json:"enrollmentIds"`
	RecordIDs      []string `json:"recordIds"`
	CreatedAt      string   `json:"createdAt"`
	UpdatedAt      string   `json:"updatedAt"`
	Class          string   `json:"class"`
}

// SearchResult definition
type SearchResult struct {
	ID   string         `json:"key"`
	Data IdentityRecord `json:"record"`
}

// IdentityRecord definition
type IdentityRecord struct {
	ID           string `json:"id"`
	EnrollmentID string `json:"enrollmentId"`
	UserID       string `json:"userId"`
	Status       string `json:"status"`
	CreatedAt    string `json:"createdAt"`
	RevokedAt    string `json:"revokedAt"`
	Class        string `json:"class"`
}

// type Organization org.Organization

func getFlags() ([]string, []string) {

	blockStatusFlags := []string{"Block"}
	allowStatusFlags := []string{"Allow"}

	return blockStatusFlags, allowStatusFlags

}

// Add is used to add a new user to state
//
// args : [id, name, role, email]
func Add(APIstub shim.ChaincodeStubInterface, args []string, organizationID string) sc.Response {

	userID := "User-" + args[0]
	user := User{
		ID:             userID,
		Name:           args[1],
		Role:           args[2],
		Email:          args[3],
		OrganizationID: organizationID,
		Status:         "Allow",
		CreatedAt:      args[4],
		NationalID:     args[5],
		Class:          "User",
	}
	userAsBytes, _ := json.Marshal(user)

	err := APIstub.PutState(userID, userAsBytes)
	// Add UserID to aadhar record
	if args[5] != "" {
		aadharAsHash := fc.GetMD5Hash(args[5])
		existingAadharRecordAsBytes, err := APIstub.GetState(aadharAsHash)
		// if err != nil {
		// 	return shim.Error(err.Error())
		// }
		if existingAadharRecordAsBytes != nil {
			aadharRecord := kyc.AadharRecord{}
			err = json.Unmarshal(existingAadharRecordAsBytes, &aadharRecord)
			if err == nil {
				aadharRecord.UserID = userID
			}
			aadharRecordAsBytes, _ := json.Marshal(aadharRecord)
			err = APIstub.PutState(aadharAsHash, aadharRecordAsBytes)
			eh.SystemError(err, aadharRecordAsBytes)
		}
	}

	// End
	return eh.SystemError(err, userAsBytes)

}

// AddIDRecord is used to add a new Identity Record for an existing user
//
// args: [newEnrollmentId, userId]
func AddIDRecord(APIstub shim.ChaincodeStubInterface, args []string, userAsBytes []byte) sc.Response {

	user := User{}
	err := json.Unmarshal(userAsBytes, &user)

	enrollmentIDHash := fc.GetMD5Hash(args[0])
	idRecord := IdentityRecord{enrollmentIDHash, args[0], args[1], "Allow", utils.GetTimestampAsISO(APIstub), "", "IdentityRecord"}

	idRecordAsBytes, _ := json.Marshal(idRecord)

	user.EnrollmentIDs = append(user.EnrollmentIDs, args[0])
	user.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	updatedUserAsBytes, _ := json.Marshal(user)
	err = APIstub.PutState(user.ID, updatedUserAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = APIstub.PutState(enrollmentIDHash, idRecordAsBytes)
	return eh.SystemError(err, idRecordAsBytes)

}

// RevokeIdentityRecord is used to revoke an Identity Record belonging to a user
//
// args : [enrollmentId, userId]
func RevokeIdentityRecord(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	identityRecord, err := getIdentityRecordByEnrollmentID(APIstub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	identityRecord.RevokedAt = utils.GetTimestampAsISO(APIstub)
	identityRecord.Status = "Block"

	revokedIDRecordAsBytes, _ := json.Marshal(identityRecord)

	err = APIstub.PutState(identityRecord.ID, revokedIDRecordAsBytes)
	return eh.SystemError(err, revokedIDRecordAsBytes)
	// APIstub.PutState( identityRecord.ID, revokedIDRecordAsBytes)
	// fmt.Println("Successfully Revoked")
	// return shim.Success(revokedIDRecordAsBytes)
}

// Revoke is used to revoke a user completely
//
// args : [userId]
func Revoke(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	existingUserAsBytes, _ := APIstub.GetState(args[0])
	user := User{}
	_ = json.Unmarshal(existingUserAsBytes, &user)
	user.Status = "Block"
	user.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	userAsBytes, _ := json.Marshal(user)
	// APIstub.PutState( args[0], userAsBytes)

	// return shim.Success(userAsBytes)
	err := APIstub.PutState(args[0], userAsBytes)
	return eh.SystemError(err, userAsBytes)
}

// RevokeCheck is used to check if the identity record access is revoked
//
// args : [enrollmentId, userId]
func RevokeCheck(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	identityRecord, err := getIdentityRecordByEnrollmentID(APIstub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	if identityRecord.UserID != args[1] {
		return shim.Error("EnrollmentID and UserID do not match")
	}

	blockFlag, _ := getFlags()

	if utils.StringInSlice(identityRecord.Status, blockFlag) {
		return shim.Error("You shall not pass")
	}

	return shim.Success(nil)

}

// AddRecordID adds a recordID to an user
func AddRecordID(APIstub shim.ChaincodeStubInterface, recordAsBytes []byte, currentUser User) sc.Response {
	record := kyc.Record{}
	err := json.Unmarshal(recordAsBytes, &record)
	if err != nil {
		return shim.Error(err.Error())
	}
	currentUser.RecordIDs = append(currentUser.RecordIDs, record.ID)
	currentUser.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	currentUserAsBytes, err := json.Marshal(currentUser)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = APIstub.PutState(currentUser.ID, currentUserAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(currentUserAsBytes)
}

func getIdentityRecordByEnrollmentID(APIstub shim.ChaincodeStubInterface, info []string) (IdentityRecord, error) {

	id := fc.GetMD5Hash(info[0])
	val, err := APIstub.GetState(id)
	identityRecord := IdentityRecord{}
	if err != nil {
		return identityRecord, err
	}

	err = json.Unmarshal(val, &identityRecord)
	return identityRecord, nil
}

// GetEnrollments returns all enrollments of a user
func GetEnrollments(APIstub shim.ChaincodeStubInterface, userAsBytes []byte) sc.Response {

	user := User{}
	err := json.Unmarshal(userAsBytes, &user)
	payloads := []string{}
	idRecord := IdentityRecord{}
	for i := 0; i < len(user.EnrollmentIDs); i++ {
		idRecord, err = getIdentityRecordByEnrollmentID(APIstub, []string{user.EnrollmentIDs[i]})
		fmt.Println(idRecord)
		if err != nil {
			return shim.Error(err.Error())
		}
		idRecordAsBytes, _ := json.Marshal(idRecord)
		payloads = append(payloads, string(idRecordAsBytes[:]))
	}
	return shim.Success(utils.JoinResponseBytes(payloads))
}

// ApproveRequest will update the status
//
// args : [bankId, statusUpdate, expireTime, allowedParams]
// accepted status : ["Approved", "Rejected"]
func ApproveRequest(APIstub shim.ChaincodeStubInterface, args []string, userID string) sc.Response {

	organizationID, status, expireTime := args[0], args[1], args[2]
	approvedInfos, err := utils.SliceFromString(args[3])

	if status != "Approved" && status != "Rejected" {
		return shim.Error("Incorrect Status supplied")
	}
	bankApprovalID := fc.GetMD5Hash(userID + "-BankApproval")
	bankApproval := common.BankApproval{}
	bankApprovalAsBytes, err := APIstub.GetState(bankApprovalID)
	if err != nil {
		return shim.Error(err.Error())
	}
	if bankApprovalAsBytes == nil {
		return shim.Error("Requests Not Found for user")
	}
	err = json.Unmarshal(bankApprovalAsBytes, &bankApproval)
	if err != nil {
		return shim.Error(err.Error())
	}
	for i := 0; i < len(bankApproval.Banks); i++ {
		bankRequest := bankApproval.Banks[i]
		if organizationID == bankRequest.BankID {
			if bankRequest.UserStatus == "Approved" {
				return shim.Error("Already approved for given bankID")
			}
			bankRequest.UserStatus = status
			bankRequest.ExpireTime = expireTime
			bankRequest.ApprovedInfos = approvedInfos

			bankApproval.Banks[i] = bankRequest
			bankApproval.UpdatedAt = utils.GetTimestampAsISO(APIstub)
			updatedApprovalAsBytes, err := json.Marshal(bankApproval)
			if err != nil {
				return shim.Error(err.Error())
			}
			err = APIstub.PutState(bankApproval.ID, updatedApprovalAsBytes)
			if err != nil {
				return shim.Error(err.Error())
			}
			return shim.Success(updatedApprovalAsBytes)
		}
	}
	return shim.Error("No request found for given bankID")
}
