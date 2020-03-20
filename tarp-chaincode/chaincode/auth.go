package main

import (
	// "encoding/json"
	// "errors"
	"fmt"
	// eh "github.com/chaincode/errorhandler"
	org "github.com/chaincode/organization"
	"github.com/chaincode/user"
	"github.com/chaincode/utils"
	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

func getFunctionsByOrgAndRole(orgType string, role string) []string {

	switch orgType {

	case "Bank":
		switch role {
		case "Admin":
			return []string{"getAddressDetails", "getVerificationRecordByKYCID", "getRecordIDsByAadharNumber", "addVerificationRecord", "updateVerificationRecord", "getKYCRecordDetails", "addUser", "revokeUser", "revokeIdentityRecord", "addRoleToOrganization", "getUserDetails", "getUserEnrollments"}
		case "Manager":
			return []string{"getAddressDetails", "getVerificationRecordByKYCID", "getRecordIDsByAadharNumber", "addVerificationRecord", "updateVerificationRecord", "getKYCRecordDetails", "getUserDetails"}
		}

	case "CentralBank":
		switch role {
		case "Admin":
			return []string{"getAddressDetails", "getRecordIDsByAadharNumber", "getRecordIDsByAadharNumber", "addVerificationRecord", "updateVerificationRecord", "getKYCRecordDetails", "addUser", "revokeUser", "revokeIdentityRecord", "addRoleToOrganization", "getUserDetails", "getUserEnrollments"}
		case "Client":
			return []string{"addKYCRecord", "addAddressToKYC", "getKYCRecordDetails", "updateKYCRecord"}
		}

	case "Buyer":
		switch role {
		case "Admin":
			return []string{"getVerificationRecordByKYCID","getRecordIDsByAadharNumber","getKYCRecordDetails", "addUser", "revokeUser", "revokeIdentityRecord", "addRoleToOrganization", "getUserDetails", "getUserEnrollments"}
		case "Client":
			return []string{"addKYCRecord", "addAddressToKYC", "getKYCRecordDetails", "updateKYCRecord"}
		}

	case "Seller":
		switch role {
		case "Admin":
			return []string{"getVerificationRecordByKYCID", "getRecordIDsByAadharNumber", "getKYCRecordDetails", "addUser", "revokeUser", "revokeIdentityRecord", "addRoleToOrganization", "getUserDetails", "getUserEnrollments"}
		case "Client":
			return []string{"addKYCRecord", "addAddressToKYC", "getKYCRecordDetails", "updateKYCRecord"}
		}

	case "ExternalSource":
		switch role {
		case "Admin":
			return []string{"getKYCRecordDetails", "updateVerificationRecord", "addUser", "revokeUser", "revokeIdentityRecord", "addRoleToOrganization", "getUserDetails", "getUserEnrollments"}
		}
	}

	return []string{"Error", "Incorrect role specified"}
}

// VerifyAuth verifies auth
func VerifyAuth(APIstub shim.ChaincodeStubInterface, functionName string, currentUser user.User, currentUserOrg org.Organization) sc.Response {

	// fmt.Println("verifying auth")
	// userMSPID, err := cid.GetMSPID(APIstub)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }
	// if currentUserOrg.MSPID != userMSPID {
	// 	return shim.Error("MSPIDs do not match")
	// }

	enrollmentID, ok, err := cid.GetAttributeValue(APIstub, "enrollment_id")
	if err != nil {
		return shim.Error(err.Error())
	}
	if !ok {
		return shim.Error("The client identity does not possess the attribute - enrollment_id")
	}

	revokeAsResponse := user.RevokeCheck(APIstub, []string{enrollmentID, currentUser.ID})
	message := revokeAsResponse.GetMessage()
	if message != "" {
		return shim.Error(message)
	}

	fmt.Println(currentUserOrg.Type, currentUser.Role)
	functions := getFunctionsByOrgAndRole(currentUserOrg.Type, currentUser.Role)

	if !utils.StringInSlice(functionName, functions) {
		return shim.Error("You shall not pass!")
	}

	fmt.Println("Verified auth")
	return shim.Success(nil)
}
