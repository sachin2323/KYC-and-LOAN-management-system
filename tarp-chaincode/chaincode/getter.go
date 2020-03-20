package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"time"

	// "errors"
	// "fmt"
	"github.com/chaincode/claim"
	"github.com/chaincode/common"
	eh "github.com/chaincode/errorhandler"
	fc "github.com/chaincode/fabcrypt"
	"github.com/chaincode/kyc"
	org "github.com/chaincode/organization"
	txn "github.com/chaincode/transaction"
	"github.com/chaincode/user"
	"github.com/chaincode/utils"

	// "github.com/chaincode/utils"
	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// PopulatedRecord is kycRecord with status
type PopulatedRecord struct {
	kyc.Record
	Status    string        `json:"status"`
	Addresses []kyc.Address `json:"addresses"`
}

// GetUserFromAttribute will get user from an attribute
func GetUserFromAttribute(APIstub shim.ChaincodeStubInterface, attribute string) sc.Response {

	userID, ok, err := cid.GetAttributeValue(APIstub, "id")
	if err != nil {
		return shim.Error(err.Error())
	}
	if !ok {
		return shim.Error("The client identity does not possess the attribute - id")
	}

	currentUserUserDetails, _ := APIstub.GetState(userID)

	currentUserUser := user.User{}
	_ = json.Unmarshal(currentUserUserDetails, &currentUserUser)

	orgAsResponse := eh.AbsentError(APIstub, currentUserUser.OrganizationID)
	if orgAsResponse.GetMessage() != "" {
		return orgAsResponse
	}

	return shim.Success(currentUserUserDetails)
}

// Prereqs definition
type Prereqs struct {
	User user.User
	Org  org.Organization
}

// GetPrerequisites will get prerequisites for every request
func GetPrerequisites(APIstub shim.ChaincodeStubInterface) (Prereqs, sc.Response) {

	userDetails := GetUserFromAttribute(APIstub, "id")
	if userDetails.GetMessage() != "" {
		return Prereqs{}, userDetails
	}
	payload := userDetails.GetPayload()
	currentUser := user.User{}
	err := json.Unmarshal(payload, &currentUser)
	if err != nil {
		return Prereqs{}, shim.Error(err.Error())
	}

	orgAsBytes, err := APIstub.GetState(currentUser.OrganizationID)
	currentUserOrg := org.Organization{}
	if err != nil {
		return Prereqs{}, shim.Error(err.Error())
	}
	err = json.Unmarshal(orgAsBytes, &currentUserOrg)
	if err != nil {
		return Prereqs{}, shim.Error(err.Error())
	}
	fmt.Println(currentUserOrg)
	// userMSPID, err := cid.GetMSPID(APIstub)
	// if err != nil {
	// 	return Prereqs{}, shim.Error(err.Error())
	// }
	// if currentUserOrg.MSPID != userMSPID {
	// 	return Prereqs{}, shim.Error("MSPIDs do not match")
	// }

	prereqs := Prereqs{
		User: currentUser,
		Org:  currentUserOrg,
	}
	return prereqs, shim.Success(nil)

}

// GetNameFromAadhar fetches the aadhar record that is stored in state and returns all kyc
// ids ever created
//
// args : [aadharNumber, aadharHash]
func GetNameFromAadhar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	fmt.Println("getRecordsCalled")
	var aadharRecordID string
	if len(args) != 2 {
		aadharRecordID = fc.GetMD5Hash(args[0])
	} else {
		aadharRecordID = args[1]
	}

	aadharAsResponse := eh.AbsentError(APIstub, aadharRecordID)
	if aadharAsResponse.GetMessage() != "" {
		return shim.Success([]byte("[]"))
	}
	fmt.Println("adhar found")
	aadhar := kyc.AadharRecord{}
	err := json.Unmarshal(aadharAsResponse.GetPayload(), &aadhar)
	if err != nil {
		return shim.Error(err.Error())
	}
	if len(aadhar.SubRecords) == 0 {
		return shim.Success([]byte("{}"))
	}
	// first kyc id is enough
	kycID := aadhar.SubRecords[0].KYCID
	kycAsResponse := GetKYCRecordDetails(APIstub, []string{kycID})
	if kycAsResponse.GetMessage() != "" {
		return kycAsResponse
	}
	fmt.Println(string(kycAsResponse.GetPayload()))
	kycRecord := kyc.Record{}
	err = json.Unmarshal(kycAsResponse.GetPayload(), &kycRecord)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println(kycRecord)
	fmt.Println("{\"aadharNumber\":\"" + args[0] + "\",\"name\":\"" + kycRecord.Name + "\"}")
	return shim.Success([]byte("{\"aadharNumber\":\"" + args[0] + "\",\"name\":\"" + kycRecord.Name + "\"}"))
}

// GetRecordIDsByAadharNumber fetches the aadhar record that is stored in state and returns all kyc
// ids ever created
//
// args : [aadharNumber, aadharHash]
func GetRecordIDsByAadharNumber(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	fmt.Println("getRecordsCalled")
	fmt.Println(args)
	var aadharRecordID string
	if len(args) != 2 {
		aadharRecordID = fc.GetMD5Hash(args[0])
	} else {
		aadharRecordID = args[1]
	}
	aadharAsResponse := eh.AbsentError(APIstub, aadharRecordID)
	if aadharAsResponse.GetMessage() != "" {
		return aadharAsResponse
	}
	fmt.Println("adhar found")
	aadhar := kyc.AadharRecord{}
	err := json.Unmarshal(aadharAsResponse.GetPayload(), &aadhar)
	if err != nil {
		return shim.Error(err.Error())
	}
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	for i := 0; i < len(aadhar.SubRecords); i++ {
		fmt.Println(i)
		fmt.Println("LOOP BEGEN")
		subRecord := aadhar.SubRecords[i]
		subRecordBytes, err := json.Marshal(subRecord)
		if err != nil {
			return shim.Error(err.Error())
		}
		kycID := subRecord.KYCID
		verificationRecordAsResponse := GetVerificationRecordByKYCID(APIstub, []string{kycID})
		// if verificationRecordAsResponse.GetMessage() != "" {
		// 	return verificationRecordAsResponse
		// }
		fmt.Println("verification record is found for kycid:", kycID)
		fmt.Println(string(verificationRecordAsResponse.GetPayload()))
		kycAsResponse := GetKYCRecordDetails(APIstub, []string{kycID})
		if kycAsResponse.GetMessage() != "" {
			return kycAsResponse
		}
		fmt.Println("kyc record is found for kycid:", kycID)
		fmt.Println(string(kycAsResponse.GetPayload()))
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		objectBytes := join(subRecordBytes, kycAsResponse.GetPayload(), verificationRecordAsResponse.GetPayload())
		buffer.WriteString(string(objectBytes))
		bArrayMemberAlreadyWritten = true
		fmt.Println(string(objectBytes))
		fmt.Println("Loop End")
	}
	buffer.WriteString("]")
	return shim.Success(buffer.Bytes())
}

func join(args ...[]byte) []byte {
	var buffer bytes.Buffer
	buffer.WriteString("{\"aadhar_subrecord\":")
	if args[0] == nil {
		args[0] = []byte("{}")
	}
	buffer.WriteString(string(args[0]))
	buffer.WriteString(", \"kyc_record\":")
	if args[1] == nil {
		args[1] = []byte("{}")
	}
	buffer.WriteString(string(args[1]))
	buffer.WriteString(", \"verification_record\":")
	if args[2] == nil {
		args[2] = []byte("{}")
	}
	buffer.WriteString(string(args[2]))
	buffer.WriteString("}")
	return buffer.Bytes()
}

// GetVerificationRecordByKYCID retrieves the verification record for a KYC ID
//
// args : [kycId]
func GetVerificationRecordByKYCID(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	verificationRecordID := fc.GetMD5Hash(args[0] + "VerificationRecord")
	verificationRecordAsResponse := eh.AbsentError(APIstub, verificationRecordID)

	return verificationRecordAsResponse

}

// GetKYCRecordDetails retreives KYC record details
//
// args : [kycId]
func GetKYCRecordDetails(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	fmt.Println("GetKYCRecordDetails Starts")
	fmt.Println(args)
	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}
	populatedRecord := PopulatedRecord{}

	recordAsResponse := eh.AbsentError(APIstub, args[0])
	if recordAsResponse.GetMessage() != "" {
		return recordAsResponse
	}
	record := kyc.Record{}
	err := json.Unmarshal(recordAsResponse.GetPayload(), &record)
	if err != nil {
		return shim.Error(err.Error())
	}
	addresses := []kyc.Address{}
	addressIDs := record.AddressIDs
	for i := 0; i < len(addressIDs); i++ {
		address := kyc.Address{}
		addressResponse := GetAddressDetails(APIstub, []string{addressIDs[i]})
		if addressResponse.GetMessage() != "" {
			return addressResponse
		}
		err = json.Unmarshal(addressResponse.GetPayload(), &address)
		if err != nil {
			return shim.Error(err.Error())
		}
		addresses = append(addresses, address)

	}

	populatedRecord.Addresses = addresses
	verificationRecordAsResponse := GetVerificationRecordByKYCID(APIstub, args)
	if verificationRecordAsResponse.GetMessage() != "" {
		populatedRecord.Status = "Unprocessed"
		populatedRecord.Record = record
	} else {
		verificationRecord := kyc.VerificationRecord{}
		err = json.Unmarshal(verificationRecordAsResponse.GetPayload(), &verificationRecord)
		if err != nil {
			return shim.Error(err.Error())
		}
		populatedRecord.Status = verificationRecord.Status
		populatedRecord.Record = record
	}
	populatedRecordAsBytes, err := json.Marshal(populatedRecord)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("Ends")
	fmt.Println(string(populatedRecordAsBytes))
	return shim.Success(populatedRecordAsBytes)
}

// GetAddressDetails retrieves the address given an ID
//
// args : [addressID]
func GetAddressDetails(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	addressAsResponse := eh.AbsentError(APIstub, args[0])
	return addressAsResponse

}

// GetCurrentUser retrieves the user given an ID
//
// args : [userID]
func GetCurrentUser(APIstub shim.ChaincodeStubInterface, args []string, currentUserOrg org.Organization) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	userAsResponse := eh.AbsentError(APIstub, args[0])
	if userAsResponse.GetMessage() != "" {
		return userAsResponse
	}

	existingUser := user.User{}
	err := json.Unmarshal(userAsResponse.GetPayload(), &existingUser)
	if err != nil {
		return shim.Error(err.Error())
	}

	type PopulatedUser struct {
		user.User
		OrganizationDetails org.Organization `json:"organizationDetails"`
		OrganizationType    string           `json:"organizationType"`
	}

	populatedUser := PopulatedUser{}
	populatedUser.OrganizationDetails = currentUserOrg
	populatedUser.User = existingUser
	populatedUser.OrganizationType = currentUserOrg.Type
	fmt.Println(populatedUser)
	userAsBytes, err := json.Marshal(populatedUser)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(userAsBytes)

}

// GetUserDetails retrieves the user given an ID
//
// args : [userID]
func GetUserDetails(APIstub shim.ChaincodeStubInterface, args []string, currentUserOrg org.Organization) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}

	return eh.AbsentError(APIstub, args[0])
}

// GetUserEnrollments retrieves all identity records of a user
//
// args : [userID]
func GetUserEnrollments(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	argAsResponse := eh.ArgumentError(1, args)
	if argAsResponse.GetMessage() != "" {
		return argAsResponse
	}
	userAsResponse := eh.AbsentError(APIstub, args[0])
	if userAsResponse.GetMessage() != "" {
		return userAsResponse
	}
	return user.GetEnrollments(APIstub, userAsResponse.GetPayload())

}

// GetAllUsers will get all users of org
//
// args: []
func GetAllUsers(APIstub shim.ChaincodeStubInterface, args []string, currentUserOrg org.Organization, currentUserID string) sc.Response {
	users := []user.User{}
	fmt.Println(currentUserOrg)
	for i := 0; i < len(currentUserOrg.UserIDs); i++ {

		userAsResponse := GetUserDetails(APIstub, []string{currentUserOrg.UserIDs[i]}, currentUserOrg)
		user := user.User{}
		err := json.Unmarshal(userAsResponse.GetPayload(), &user)
		if err != nil {
			return shim.Error(err.Error())
		}
		if currentUserID != user.ID {
			users = append(users, user)
		}
	}
	usersAsBytes, err := json.Marshal(users)
	return eh.SystemError(err, usersAsBytes)
}

// GetAllRecords will get all users of org
//
// args: []
func GetAllRecords(APIstub shim.ChaincodeStubInterface, args []string, currentUserOrg org.Organization) sc.Response {
	records := []PopulatedRecord{}
	for i := 0; i < len(currentUserOrg.RecordIDs); i++ {
		recordAsResponse := GetKYCRecordDetails(APIstub, []string{currentUserOrg.RecordIDs[i]})
		record := PopulatedRecord{}
		err := json.Unmarshal(recordAsResponse.GetPayload(), &record)
		if err != nil {
			return shim.Error(err.Error())
		}

		records = append(records, record)
	}
	recordsAsBytes, err := json.Marshal(records)
	return eh.SystemError(err, recordsAsBytes)
}

// GetUserRecords will get all records of a user
//
// args : []
func GetUserRecords(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User) sc.Response {
	records := []PopulatedRecord{}
	for i := 0; i < len(currentUser.RecordIDs); i++ {
		recordAsResponse := GetKYCRecordDetails(APIstub, []string{currentUser.RecordIDs[i]})
		record := PopulatedRecord{}
		err := json.Unmarshal(recordAsResponse.GetPayload(), &record)
		if err != nil {
			return shim.Error(err.Error())
		}
		records = append(records, record)
	}
	recordsAsBytes, err := json.Marshal(records)
	return eh.SystemError(err, recordsAsBytes)
}

// GetUserRequests will fetch all kyc requests for a given user
//
// args : []
func GetUserRequests(APIstub shim.ChaincodeStubInterface, args []string, userID string) sc.Response {
	return eh.AbsentError(APIstub, fc.GetMD5Hash(userID+"-BankApproval"))
}

// GetOrgRequests will fetch all kyc requests made by a given org
//
// args : []
func GetOrgRequests(APIstub shim.ChaincodeStubInterface, args []string, currentOrg org.Organization) sc.Response {

	approvalIDs := currentOrg.ApprovalRequestIDs
	fmt.Println(approvalIDs)
	var approvedBuffer bytes.Buffer
	approvedBuffer.WriteString("[")
	approvedBArrayMemberAlreadyWritten := false

	var rejectedBuffer bytes.Buffer
	rejectedBuffer.WriteString("[")
	rejectedBArrayMemberAlreadyWritten := false

	var pendingBuffer bytes.Buffer
	pendingBuffer.WriteString("[")
	pendingBArrayMemberAlreadyWritten := false

	var approvedinfosBuffer bytes.Buffer
	approvedinfosBuffer.WriteString("[")
	approvedinfosBArrayMemberAlreadyWritten := false

	for i := 0; i < len(approvalIDs); i++ {
		bankApproval := common.BankApproval{}
		bankApprovalAsBytes, err := APIstub.GetState(approvalIDs[i])
		if err != nil {
			return shim.Error(err.Error())
		}
		if bankApprovalAsBytes == nil {
			return shim.Error("Approval with ID :" + approvalIDs[i] + " doesn't exist")
		}

		err = json.Unmarshal(bankApprovalAsBytes, &bankApproval)
		for j := 0; j < len(bankApproval.Banks); j++ {
			currentBank := bankApproval.Banks[j]
			if currentBank.BankID == currentOrg.ID {
				currentTimeInSeconds := time.Now().Unix()
				expireTime, _ := time.Parse(time.RFC3339, currentBank.ExpireTime)
				expireTimeInSeconds := expireTime.Unix()
				if currentTimeInSeconds > expireTimeInSeconds {
					continue
				}
				fmt.Println("================")
				fmt.Println(currentBank.BankStatus)
				fmt.Println("================")

				if currentBank.BankStatus == "Approved" {
					approvedResponse := GetRecordIDsByAadharNumber(APIstub, []string{"", bankApproval.AadharID})
					if approvedResponse.GetMessage() != "" {
						fmt.Println("Exiting through line 498.")
						return approvedResponse
					}
					if approvedBArrayMemberAlreadyWritten == true {
						approvedBuffer.WriteString(",")
					}

					if approvedinfosBArrayMemberAlreadyWritten == true {
						approvedinfosBuffer.WriteString(",")
					}
					// Filtering Algo starts
					response := approvedResponse.GetPayload()

					var responseMapper map[string]interface{}
					var masterRecord kyc.MasterRecord
					json.Unmarshal(response, masterRecord)
					approvedInfos := currentBank.ApprovedInfos
					kycRecordBytes, _ := json.Marshal(masterRecord.KycRecord)
					json.Unmarshal(kycRecordBytes, &responseMapper)

					type temporaryApprovedInfos struct {
						Infos []string `json:"infos"`
					}

					var infos temporaryApprovedInfos
					infos.Infos = approvedInfos
					infosBytes, _ := json.Marshal(infos)
					// Filtering Algo ends
					approvedBuffer.WriteString(string(response))
					approvedinfosBuffer.WriteString(string(infosBytes))
					approvedBArrayMemberAlreadyWritten = true
					approvedinfosBArrayMemberAlreadyWritten = true

				} else if currentBank.UserStatus == "Rejected" {
					rejectedResponse := GetRecordIDsByAadharNumber(APIstub, []string{"", bankApproval.AadharID})
					if rejectedResponse.GetMessage() != "" {
						return rejectedResponse
					}
					if rejectedBArrayMemberAlreadyWritten == true {
						rejectedBuffer.WriteString(",")
					}

					rejectedBuffer.WriteString(string(rejectedResponse.GetPayload()))
					rejectedBArrayMemberAlreadyWritten = true
				} else {
					if pendingBArrayMemberAlreadyWritten == true {
						pendingBuffer.WriteString(",")
					}
					bankAsBytes, err := json.Marshal(currentBank)
					if err != nil {
						return shim.Error(err.Error())
					}
					pendingBuffer.WriteString(string(bankAsBytes))
					pendingBArrayMemberAlreadyWritten = true
				}
			}
		}

	}
	approvedBuffer.WriteString("]")
	rejectedBuffer.WriteString("]")
	pendingBuffer.WriteString("]")
	approvedinfosBuffer.WriteString("]")
	return shim.Success(joinFullApprovalBytes(approvedBuffer.Bytes(), pendingBuffer.Bytes(), rejectedBuffer.Bytes(), approvedinfosBuffer.Bytes()))

}

// GetAllOrgRequests will fetch all kyc requests made by all orgs
//
// args : []
func GetAllOrgRequests(APIstub shim.ChaincodeStubInterface, args []string, currentOrg org.Organization) sc.Response {
	CbrBytes, _ := APIstub.GetState("CBR")
	cbr := common.CBRequestIDs{}
	json.Unmarshal(CbrBytes, &cbr)
	approvalIDs := utils.UniqueSlicer(cbr.RequestIDS)

	var responseBytes []string

	for i := 0; i < len(approvalIDs); i++ {
		bankApproval := common.BankApproval{}
		bankApprovalAsBytes, err := APIstub.GetState(approvalIDs[i])
		if err != nil {
			return shim.Error(err.Error())
		}
		if bankApprovalAsBytes == nil {
			return shim.Error("Approval with ID :" + approvalIDs[i] + " doesn't exist")
		}

		err = json.Unmarshal(bankApprovalAsBytes, &bankApproval)
		if err == nil {
			responseBytes = append(responseBytes, string(bankApprovalAsBytes))
		}
	}
	return shim.Success(JoinResponseBytes(responseBytes))

}

func joinFullApprovalBytes(args ...[]byte) []byte {
	var buffer bytes.Buffer
	buffer.WriteString("{\"approved_requests\":")
	if args[0] == nil {
		args[0] = []byte("{}")
	}
	buffer.WriteString(string(args[0]))
	buffer.WriteString(", \"pending_requests\":")
	if args[1] == nil {
		args[1] = []byte("{}")
	}
	buffer.WriteString(string(args[1]))
	buffer.WriteString(", \"rejected_requests\":")
	if args[2] == nil {
		args[2] = []byte("{}")
	}
	buffer.WriteString(string(args[2]))
	buffer.WriteString(", \"approved_infos\":")
	if args[3] == nil {
		args[3] = []byte("{}")
	}
	buffer.WriteString(string(args[3]))
	buffer.WriteString("}")

	fmt.Println(string(buffer.Bytes()))
	return buffer.Bytes()
}
func joinApprovalBytes(args ...[]byte) []byte {
	var buffer bytes.Buffer
	buffer.WriteString("{\"approved_requests\":")
	if args[0] == nil {
		args[0] = []byte("{}")
	}
	buffer.WriteString(string(args[0]))
	buffer.WriteString(", \"pending_requests\":")
	if args[1] == nil {
		args[1] = []byte("{}")
	}
	buffer.WriteString(string(args[1]))
	buffer.WriteString(", \"rejected_requests\":")
	if args[2] == nil {
		args[2] = []byte("{}")
	}
	buffer.WriteString(string(args[2]))
	buffer.WriteString("}")
	return buffer.Bytes()
}

// GetCurrentUserKYC will return current user's kyc
func GetCurrentUserKYC(APIstub shim.ChaincodeStubInterface, args []string, currentUser user.User) sc.Response {
	var recordIDs []string
	fmt.Println(args)
	recordsResponse := GetRecordIDsByAadharNumber(APIstub, []string{args[0]})
	recordsResponseBytes := recordsResponse.GetPayload()
	fmt.Println(string(recordsResponseBytes))
	json.Unmarshal(recordsResponseBytes, &recordIDs)

	fmt.Println(recordIDs)
	if len(recordIDs) == 0 {
		return shim.Success([]byte("[]"))
	}
	return shim.Success(recordsResponseBytes)
	// return GetKYCRecordDetails(APIstub, []string{recordIDs[0]})
}

// JoinResponseBytes Function
func JoinResponseBytes(byteArgs []string) []byte {
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	for _, arg := range byteArgs {
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString(arg)
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	return buffer.Bytes()
}

// GetAllClaims lists all the claims of an org
func GetAllClaims(APIstub shim.ChaincodeStubInterface, args []string, orgID string) sc.Response {
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"class\": \"Claim\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	return populateClaims(APIstub, searchResultsBytes)
}

// GetUserClaims returns all the claims for a user
func GetUserClaims(APIstub shim.ChaincodeStubInterface, args []string, userID string) sc.Response {
	fmt.Println("get user claims called")
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"insureeId\":\""+userID+"\"},{\"class\": \"Claim\"}]}}")
	if err != nil {
		fmt.Println(err.Error())
		if err.Error() == "No records found" {
			return shim.Success(searchResultsBytes)
		}
		return shim.Error(err.Error())
	}
	return populateClaims(APIstub, searchResultsBytes)
}

// GetOrgClaims returns all claims of an org
func GetOrgClaims(APIstub shim.ChaincodeStubInterface, args []string, orgID string) sc.Response {
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"organizationId\":\""+orgID+"\"},{\"class\": \"Claim\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	return populateClaims(APIstub, searchResultsBytes)
}

// GetInsurerClaims returns all claims of an org
func GetInsurerClaims(APIstub shim.ChaincodeStubInterface, args []string, orgID string) sc.Response {
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"insurerOrgId\":\""+orgID+"\"},{\"class\": \"Claim\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	return populateClaims(APIstub, searchResultsBytes)
}

// GetClaimProofs returns all proofs that have specified claimid
//
// args : [claimId]
func GetClaimProofs(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"claimId\":\""+args[0]+"\"},{\"class\": \"Proof\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(searchResultsBytes)
}

// GetStatusTimeline sends an object with all status updates related to a claim
//
// args : [claimID]
func GetStatusTimeline(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	// claimAsBytes := APIstub.GetState(args[0])
	// claim, _ := json.Marshal(claimAsBytes)
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"claimId\":\""+args[0]+"\"},{\"class\": \"Transaction\"},{\"action\":\"CSU - Claim Status Update\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(searchResultsBytes)

}

// SearchOrganizationsByDomainName gets the organization by name - Useful while Ajaxing with partial word search
func SearchOrganizationsByDomainName(APIstub shim.ChaincodeStubInterface, name string) ([]org.Organization, int) {

	/*
	   Arguments:
	     * Name
	*/

	type SearchResult struct {
		Key    string           `json:"key"`
		Record org.Organization `json:"record"`
	}
	organizations := []org.Organization{}
	length := 0
	queryString := "{\"selector\": {\"$and\" : [{\"name\": {\"$regex\": \"(?i)" + name + "\"},\"class\": \"Organization\", \"type\":\"Hospital\"}]}}"
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, queryString)
	if err != nil {
		return organizations, length
	}

	searchResults := []SearchResult{}
	json.Unmarshal([]byte(searchResultsBytes), &searchResults)

	if len(searchResults) < 1 {
		return organizations, length
	}
	for i := 0; i < len(searchResults); i++ {
		organizations = append(organizations, searchResults[i].Record)
		length++
	}

	return organizations, length
}

// GetAllOrganization will return all orgs
func GetAllOrganization(APIstub shim.ChaincodeStubInterface) sc.Response {
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"class\": \"Organization\" }}")
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(searchResultsBytes)
}

// GetAllOrganizationUsers will return all users of an organization
func GetAllOrganizationUsers(APIstub shim.ChaincodeStubInterface, organizationID string, currentUserID string) sc.Response {
	type SearchResult struct {
		Key    string    `json:"key"`
		Record user.User `json:"record"`
	}
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"organizationId\":\""+organizationID+"\"},{\"class\": \"User\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	users := []user.User{}
	searchResults := []SearchResult{}
	json.Unmarshal([]byte(searchResultsBytes), &searchResults)

	if len(searchResults) < 1 {
		return shim.Error("No records found")
	}
	for i := 0; i < len(searchResults); i++ {
		if searchResults[i].Key == currentUserID {
			continue
		}
		users = append(users, searchResults[i].Record)
	}
	usersAsBytes, err := json.Marshal(users)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(usersAsBytes)
}

func populateClaims(APIstub shim.ChaincodeStubInterface, searchResultsBytes []byte) sc.Response {

	type SearchResult struct {
		Key    string      `json:"key"`
		Record claim.Claim `json:"record"`
	}
	type TxnSearchResult struct {
		Key    string          `json:"key"`
		Record txn.Transaction `json:"record"`
	}

	type PopulatedClaim struct {
		claim.Claim
		InsureeDetails    user.User        `json:"insureeDetails"`
		InsurerDetails    org.Organization `json:"insurerDetails"`
		InsureeOrg        org.Organization `json:"insureeOrg"`
		TransactionDetail txn.Transaction  `json:"transactionDetail"`
	}

	// claims := []claim.Claim{}
	searchResults := []SearchResult{}
	json.Unmarshal([]byte(searchResultsBytes), &searchResults)

	if len(searchResults) < 1 {
		fmt.Println("no records")
		return shim.Success(searchResultsBytes)
	}

	populatedClaims := []PopulatedClaim{}

	for i := 0; i < len(searchResults); i++ {

		claim := searchResults[i].Record
		populatedClaim := PopulatedClaim{}

		// adding the insurer
		insurer := org.Organization{}
		insurerAsBytes, _ := APIstub.GetState(claim.InsurerOrgID)
		err := json.Unmarshal(insurerAsBytes, &insurer)
		if err != nil {
			return shim.Error(err.Error())
		}
		populatedClaim.InsurerDetails = insurer

		// adding the user details
		user := user.User{}
		userAsBytes, _ := APIstub.GetState(claim.InsureeID)
		err = json.Unmarshal(userAsBytes, &user)
		if err != nil {
			return shim.Error(err.Error())
		}
		populatedClaim.InsureeDetails = user

		// adding the insuree org details
		insureeOrg := org.Organization{}
		insureeOrgAsBytes, _ := APIstub.GetState(user.OrganizationID)
		err = json.Unmarshal(insureeOrgAsBytes, &insureeOrg)
		if err != nil {
			return shim.Error(err.Error())
		}
		populatedClaim.InsureeOrg = insureeOrg

		populatedClaim.Claim = claim

		populatedClaims = append(populatedClaims, populatedClaim)

	}
	populatedClaimsAsBytes, err := json.Marshal(populatedClaims)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(populatedClaimsAsBytes)

}
