package main

import (
	// "encoding/json"
	// "crypto/rand"
	// "github.com/hyperledger/fabric/core/chaincode/shim/ext/entities"

	"encoding/json"
	"fmt"

	"github.com/chaincode/claim"
	"github.com/chaincode/common"
	eh "github.com/chaincode/errorhandler"
	fc "github.com/chaincode/fabcrypt"
	"github.com/chaincode/kyc"
	org "github.com/chaincode/organization"
	txn "github.com/chaincode/transaction"
	"github.com/chaincode/user"
	"github.com/chaincode/utils"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
	// "github.com/hyperledger/fabric/bccsp/factory"
)

// SmartContract definition
type SmartContract struct {
}

// Init definition
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {

	responseBytes, err := APIstub.GetState("CBR")
	// CBR - Central Bank Requests
	cbr := common.CBRequestIDs{}

	if err != nil {
		cbrBytes, err := json.Marshal(cbr)
		if err != nil {
			return shim.Error(err.Error())
		}
		APIstub.PutState("CBR", cbrBytes)
	} else if responseBytes == nil {
		cbrBytes, err := json.Marshal(cbr)
		if err != nil {
			return shim.Error(err.Error())
		}
		APIstub.PutState("CBR", cbrBytes)
	} else {
		fmt.Println("CBR exists")
	}

	return shim.Success(nil)
}

// Invoke definition
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	fmt.Println("FunctionAndArgs", function, args)

	if function == "testEncrypt" {
		return s.testEncrypt(APIstub)
	} else if function == "testDecrypt" {
		return s.testDecrypt(APIstub)
	}

	userMSPID, _ := cid.GetMSPID(APIstub)

	if function == "addOrganization" {
		return s.addOrganization(APIstub, args, userMSPID)
	} else if function == "addIDRecordForUser" {
		return s.addIDRecordForUser(APIstub, args)
	}

	// // // *---- for testing without attrs ----*
	// currentUser := user.User{
	// 	ID:             "User-Client1",
	// 	OrganizationID: "InsuranceCompany1",
	// 	Role:           "Client",
	// }
	// currentUserOrg := org.Organization{
	// 	ID:    "InsuranceCompany1",
	// 	Roles: []string{"Admin", "Client"},
	// }

	// *---- for testing with attrs ----*
	prereqs, shimError := GetPrerequisites(APIstub)
	if shimError.GetMessage() != "" {
		return shimError
	}

	currentUser := prereqs.User
	currentUserOrg := prereqs.Org

	if function == "getCurrentUser" {
		return GetCurrentUser(APIstub, []string{currentUser.ID}, currentUserOrg)
	}
	txnID := APIstub.GetTxID()

	// auth middleware
	// authStatus := VerifyAuth(APIstub, function, currentUser, currentUserOrg)

	// if authStatus.GetMessage() != "" {
	// 	return authStatus
	// }

	// Insurance Functions
	if function == "addClaim" {
		return s.addClaim(APIstub, args, txnID, currentUser, currentUserOrg)
	} else if function == "addProofToClaim" {
		return s.addProofToClaim(APIstub, args, txnID)
	} else if function == "updateClaimStatus" {
		return s.updateClaimStatus(APIstub, args, txnID)
	} else if function == "getClaimDetails" {
		return s.getClaimDetails(APIstub, args, txnID)
	} else if function == "getTxnsByMonth" {
		return s.getTxnsByMonth(APIstub, args)
	} else if function == "getAllClaims" {
		return GetAllClaims(APIstub, args, currentUserOrg.ID)
	} else if function == "getUserClaims" {
		return GetUserClaims(APIstub, args, currentUser.ID)
	} else if function == "getClaimsByOrg" {
		return GetOrgClaims(APIstub, args, currentUserOrg.ID)
	} else if function == "getInsurerClaims" {
		return GetInsurerClaims(APIstub, args, currentUserOrg.ID)
	} else if function == "getUserEnrollments" {
		return GetUserEnrollments(APIstub, args)
	} else if function == "getStatusTimeline" {
		return GetStatusTimeline(APIstub, args)
	} else if function == "getClaimProofs" {
		return GetClaimProofs(APIstub, args)
	} else if function == "searchOrganization" {
		return s.searchOrganization(APIstub, args)
	} else if function == "getAllOrganizationUsers" {
		return GetAllOrganizationUsers(APIstub, currentUserOrg.ID, currentUser.ID)
	} else if function == "getAllOrganization" {
		return GetAllOrganization(APIstub)
	} else if function == "addUser" {
		return s.addUser(APIstub, args, currentUserOrg)
	} else if function == "revokeIdentityRecord" {
		return s.revokeIdentityRecord(APIstub, args)
	} else if function == "revokeUser" {
		return s.revokeUser(APIstub, args)
	} else if function == "addRoleToOrganization" {
		return s.addRoleToOrganization(APIstub, args, currentUserOrg)
	} else if function == "addKYCRecord" {
		return s.addKYCRecord(APIstub, args, currentUser, userMSPID, currentUserOrg)
	} else if function == "updateKYCRecord" {
		return s.updateKYCRecord(APIstub, args, userMSPID)
	} else if function == "addAddressToKYC" {
		return s.addAddressToKYC(APIstub, args, currentUser)
	} else if function == "addRequestForRecord" {
		return s.addRequestForRecord(APIstub, args, currentUserOrg)
	} else if function == "approveBankRequest" {
		return s.approveBankRequest(APIstub, args, currentUser)
	} else if function == "approveCBBankRequest" {
		return s.approveCBBankRequest(APIstub, args, currentUser)
	} else if function == "addVerificationRecord" {
		return s.addVerificationRecord(APIstub, args, currentUser, userMSPID)
	} else if function == "updateVerificationRecord" {
		return s.updateVerificationRecord(APIstub, args, currentUser, userMSPID)
	} else if function == "getKYCRecordDetails" {
		return GetKYCRecordDetails(APIstub, args)
	} else if function == "getRecordIDsByAadharNumber" {
		return GetRecordIDsByAadharNumber(APIstub, args)
	} else if function == "getNameFromAadhar" {
		return GetNameFromAadhar(APIstub, args)
	} else if function == "getVerificationRecordByKYCID" {
		return GetVerificationRecordByKYCID(APIstub, args)
	} else if function == "getAddressDetails" {
		return GetAddressDetails(APIstub, args)
	} else if function == "getUserDetails" {
		return GetUserDetails(APIstub, args, currentUserOrg)
	} else if function == "getUserEnrollments" {
		return GetUserEnrollments(APIstub, args)
	} else if function == "getAllUsers" {
		return GetAllUsers(APIstub, args, currentUserOrg, currentUser.ID)
	} else if function == "getAllRecords" {
		return GetAllRecords(APIstub, args, currentUserOrg)
	} else if function == "getUserRecords" {
		return GetUserRecords(APIstub, args, currentUser)
	} else if function == "getCurrentUserKYC" {
		return GetCurrentUserKYC(APIstub, args, currentUser)
	} else if function == "getUserRequests" {
		return GetUserRequests(APIstub, args, currentUser.ID)
	} else if function == "getOrgRequests" {
		return GetOrgRequests(APIstub, args, currentUserOrg)
	} else if function == "getAllOrgRequests" {
		return GetAllOrgRequests(APIstub, args, currentUserOrg)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) testEncrypt(APIstub shim.ChaincodeStubInterface) sc.Response {
	value := "WakandaForeva"
	// _, err := rand.Read(valueAsBytes)
	// fmt.Println(valueAsBytes)
	key := "testId"
	err := APIstub.PutState(key, []byte(value))
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

func (s *SmartContract) testDecrypt(APIstub shim.ChaincodeStubInterface) sc.Response {
	// valueAsBytes := make([]byte, 32)
	key := "testId"
	val, err := APIstub.GetState(key)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(val)
}

func (s *SmartContract) addOrganization(APIstub shim.ChaincodeStubInterface, args []string, mspid string) sc.Response {

	argAsResponse := eh.ArgumentError(5, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	orgAsResponse := eh.ExistError(APIstub, args[0])
	if orgAsResponse.GetMessage() != "" {
		return orgAsResponse
	}
	return org.Add(APIstub, args, mspid)
}

func (s *SmartContract) addIDRecordForUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	argAsResponse := eh.ArgumentError(2, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	idRecordAsResponse := eh.ExistError(APIstub, fc.GetMD5Hash(args[0]))
	if idRecordAsResponse.GetMessage() != "" {
		return idRecordAsResponse
	}

	userAsResponse := eh.AbsentError(APIstub, args[1])
	if userAsResponse.GetMessage() != "" {
		return userAsResponse
	}
	fmt.Println(string(userAsResponse.GetPayload()[:]))

	return user.AddIDRecord(APIstub, args, userAsResponse.GetPayload())
}

func (s *SmartContract) addUser(APIstub shim.ChaincodeStubInterface, args []string, userOrg org.Organization) sc.Response {

	userAsResponse := eh.ExistError(APIstub, "User-"+args[0])
	if userAsResponse.GetMessage() != "" {
		return userAsResponse
	}

	if !utils.StringInSlice(args[2], userOrg.Roles) {
		fmt.Println(userOrg)
		return shim.Error("Incorrect role specified for user")
	}

	if args[2] == "Client" {
		if len(args[4]) < 1 {
			return shim.Error("National ID should be provided")
		}
	} else {
		args = append(args, "")
	}

	payloadAsResponse := user.Add(APIstub, args, userOrg.ID)
	if payloadAsResponse.GetMessage() != "" {
		return payloadAsResponse
	}
	return org.AddUserID(APIstub, payloadAsResponse.GetPayload(), userOrg)
}

func (s *SmartContract) revokeIdentityRecord(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	argAsResponse := eh.ArgumentError(2, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	userAsResponse := eh.AbsentError(APIstub, args[1])
	if userAsResponse.GetMessage() != "" {
		return userAsResponse
	}

	return user.RevokeIdentityRecord(APIstub, args)
}

func (s *SmartContract) revokeUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	userAsResponse := eh.AbsentError(APIstub, args[0])
	if userAsResponse.GetMessage() != "" {
		return userAsResponse
	}

	return user.Revoke(APIstub, args)
}

func (s *SmartContract) addRoleToOrganization(APIstub shim.ChaincodeStubInterface, args []string, currentUserOrg org.Organization) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	// orgAsResponse := eh.AbsentError(APIstub, args[0])
	// if orgAsResponse.GetMessage() != "" {
	// 	return orgAsResponse
	// }

	return org.AddRole(APIstub, args, currentUserOrg.ID)
}

func (s *SmartContract) addKYCRecord(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User, mspID string, userOrg org.Organization) sc.Response {

	kycAsResponse := eh.ExistError(APIstub, args[0])
	if kycAsResponse.GetMessage() != "" {
		return kycAsResponse
	}

	var payloadAsResponse, recordAsResponse sc.Response
	if currentUser.Role == "Client" {
		payloadAsResponse, recordAsResponse = kyc.Add(APIstub, args, currentUser.ID, mspID, currentUser.ID, "Unprocessed")
	} else {
		payloadAsResponse, recordAsResponse = kyc.Add(APIstub, args, currentUser.ID, mspID, "", args[15])
		if args[15] == "Processed" {
			kyc.AddVerificationRecord(APIstub, payloadAsResponse.GetPayload(), []string{args[0], args[15], ""}, currentUser.ID, mspID, currentUser.OrganizationID)
		}
	}

	if payloadAsResponse.GetMessage() != "" {
		return payloadAsResponse
	}
	fmt.Println("added kyc record")

	addresses, err := utils.SliceFromString(args[14])
	if err != nil {
		return shim.Error(err.Error())
	}
	addressArgs := []string{args[0]}
	addressArgs = append(addressArgs, addresses...)
	addressAsResponse := kyc.AddAddress(APIstub, recordAsResponse.GetPayload(), addressArgs, currentUser.ID)
	if addressAsResponse.GetMessage() != "" {
		return addressAsResponse
	}

	orgResponse := org.AddRecordID(APIstub, recordAsResponse.GetPayload(), userOrg)
	if orgResponse.GetMessage() != "" {
		return orgResponse
	}

	if currentUser.Role == "Client" {
		userResponse := user.AddRecordID(APIstub, recordAsResponse.GetPayload(), currentUser)
		if userResponse.GetMessage() != "" {
			return userResponse
		}
	}

	return shim.Success(recordAsResponse.GetPayload())
}

func (s *SmartContract) updateKYCRecord(APIstub shim.ChaincodeStubInterface, args []string, mspID string) sc.Response {

	argAsResponse := eh.ArgumentError(4, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	kycAsResponse := eh.AbsentError(APIstub, args[0])
	if kycAsResponse.GetMessage() != "" {
		return kycAsResponse
	}

	return kyc.UpdateRecord(APIstub, args, kycAsResponse.GetPayload(), mspID)
}

func (s *SmartContract) addAddressToKYC(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User) sc.Response {

	argAsResponse := eh.ArgumentError(9, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	addressAsResponse := eh.ExistError(APIstub, args[1])
	if addressAsResponse.GetMessage() != "" {
		return addressAsResponse
	}

	kycAsResponse := eh.AbsentError(APIstub, args[0])
	if kycAsResponse.GetMessage() != "" {
		return kycAsResponse
	}
	return kyc.AddAddress(APIstub, kycAsResponse.GetPayload(), args, currentUser.ID)
}

// args : aadharId
func (s *SmartContract) addRequestForRecord(APIstub shim.ChaincodeStubInterface, args []string, currentUserOrg org.Organization) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}
	fmt.Println("going to addrequest")

	return org.AddRequest(APIstub, args, currentUserOrg)
}

// args : bankID
func (s *SmartContract) approveBankRequest(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User) sc.Response {

	// argAsResponse := eh.ArgumentError(2, args)
	// if argAsResponse.GetMessage() != "" {
	// 	return argAsResponse
	// }

	orgAsResponse := eh.AbsentError(APIstub, args[0])
	if orgAsResponse.GetMessage() != "" {
		return orgAsResponse
	}

	return user.ApproveRequest(APIstub, args, currentUser.ID)
}

// args : bankID
func (s *SmartContract) approveCBBankRequest(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User) sc.Response {

	// argAsResponse := eh.ArgumentError(2, args)
	// if argAsResponse.GetMessage() != "" {
	// 	return argAsResponse
	// }

	orgAsResponse := eh.AbsentError(APIstub, args[0])
	if orgAsResponse.GetMessage() != "" {
		return orgAsResponse
	}

	return org.ApproveRequest(APIstub, args)
}

func (s *SmartContract) addVerificationRecord(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User, mspID string) sc.Response {
	argAsResponse := eh.ArgumentError(3, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	kycAsResponse := eh.AbsentError(APIstub, args[0])
	if kycAsResponse.GetMessage() != "" {
		return kycAsResponse
	}

	// colllapse into a function
	verificationRecordID := fc.GetMD5Hash(args[0] + "VerificationRecord")
	verificationRecordAsResponse := eh.ExistError(APIstub, verificationRecordID)
	if verificationRecordAsResponse.GetMessage() != "" {
		return verificationRecordAsResponse
	}

	return kyc.AddVerificationRecord(APIstub, kycAsResponse.GetPayload(), args, currentUser.ID, mspID, currentUser.OrganizationID)
}

func (s *SmartContract) updateVerificationRecord(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User, mspID string) sc.Response {

	argAsResponse := eh.ArgumentError(4, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	recordAsResponse := eh.AbsentError(APIstub, args[1])
	if recordAsResponse.GetMessage() != "" {
		return recordAsResponse
	}

	verificationRecordAsResponse := eh.AbsentError(APIstub, args[0])
	if verificationRecordAsResponse.GetMessage() != "" {
		return verificationRecordAsResponse
	}

	return kyc.UpdateVerificationRecordStatus(APIstub, args, recordAsResponse.GetPayload(), verificationRecordAsResponse.GetPayload(), currentUser.ID, mspID)
}

func (s *SmartContract) addUserToClaim(APIstub shim.ChaincodeStubInterface, args []string, txnID string, currentUser user.User) sc.Response {

	argAsResponse := eh.ArgumentError(2, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	existingClaimAsBytes, err := APIstub.GetState(args[0])
	if existingClaimAsBytes == nil {
		return shim.Error("Claim with id " + args[0] + " not found")
	}
	if err != nil {
		return shim.Error(err.Error())
	}

	return claim.AddUser(APIstub, args, txnID, currentUser.ID)
}
func (s *SmartContract) addProofToClaim(APIstub shim.ChaincodeStubInterface, args []string, txnID string) sc.Response {

	argAsResponse := eh.ArgumentError(4, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	existingProofAsBytes, err := APIstub.GetState(args[0])
	if existingProofAsBytes != nil {
		return shim.Error("Proof with id " + args[0] + " already exists")
	}
	if err != nil {
		return shim.Error(err.Error())
	}

	existingClaimAsBytes, err := APIstub.GetState(args[1])
	if existingClaimAsBytes == nil {
		return shim.Error("Claim with id " + args[1] + " not found")
	}
	if err != nil {
		return shim.Error(err.Error())
	}

	return claim.AddProof(APIstub, args, txnID)
}

func (s *SmartContract) addClaim(APIstub shim.ChaincodeStubInterface, args []string, txnID string, currentUser user.User, currentOrg org.Organization) sc.Response {

	fmt.Println("Entered addClaim")
	argAsResponse := eh.ArgumentError(4, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	existingClaimAsBytes, err := APIstub.GetState(args[0])
	if existingClaimAsBytes != nil {
		return shim.Error("Claim with id " + args[0] + " already exists")
	}
	if err != nil {
		return shim.Error(err.Error())
	}

	// orgAsResponse := eh.AbsentError(APIstub, args[3])
	// if orgAsResponse.GetMessage() != "" {
	// 	return orgAsResponse
	// }

	// acceptedStatus := []string{"Pending"}
	// if !utils.StringInSlice(args[2], acceptedStatus) {
	// 	return shim.Error("Status update rejected.")
	// }

	fmt.Println("Attempting addClaim")
	return claim.Add(APIstub, args, txnID, currentUser.ID, currentOrg.ID)
}

func (s *SmartContract) updateClaimStatus(APIstub shim.ChaincodeStubInterface, args []string, txnID string) sc.Response {

	argAsResponse := eh.ArgumentError(2, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	existingClaimAsBytes, err := APIstub.GetState(args[0])
	if existingClaimAsBytes == nil {
		return shim.Error("Claim with id " + args[0] + " not found")
	}
	if err != nil {
		return shim.Error(err.Error())
	}

	// acceptedStatus := []string{"Approved", "Processed", "Rejected"}
	// if !utils.StringInSlice(args[1], acceptedStatus) {
	// 	return shim.Error("Status update rejected.")
	// }

	return claim.UpdateStatus(APIstub, args, txnID)
}

func (s *SmartContract) getClaimDetails(APIstub shim.ChaincodeStubInterface, args []string, txnID string) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	existingClaimAsBytes, err := APIstub.GetState(args[0])
	if existingClaimAsBytes == nil {
		return shim.Error("Claim with id " + args[0] + " not found")
	}
	if err != nil {
		return shim.Error(err.Error())
	}

	return claim.GetDetails(APIstub, args, txnID)
}
func (s *SmartContract) getTxnsByMonth(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	argAsResponse := eh.ArgumentError(2, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}
	return txn.GetTxnByMonth(APIstub, args)
}

// args : [orgId]
func (s *SmartContract) searchOrganization(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	organizations, length := SearchOrganizationsByDomainName(APIstub, args[0])
	if length < 0 {
		return shim.Error("No organization found.")
	}
	organizationsBytes, _ := json.Marshal(organizations)
	fmt.Println(string(organizationsBytes))
	return shim.Success(organizationsBytes)
}

func main() {

	// factory.InitFactories(nil)

	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting SmartContract chaincode: %s", err)
	}
}
