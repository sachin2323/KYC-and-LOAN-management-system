package organization

import (
	"encoding/json"
	"fmt"

	// "fmt"

	"github.com/chaincode/common"
	eh "github.com/chaincode/errorhandler"
	fc "github.com/chaincode/fabcrypt"
	"github.com/chaincode/kyc"
	"github.com/chaincode/user"
	"github.com/chaincode/utils"

	// "github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Organization can have multiple roles, and users can be added only according to these roles
type Organization struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	Email              string   `json:"email"`
	Roles              []string `json:"roles"`
	Type               string   `json:"type"`
	MSPID              string   `json:"mspid"`
	UserIDs            []string `json:"userIds"`
	RecordIDs          []string `json:"recordIds"`
	ApprovalRequestIDs []string `json:"approvalRequestIds"`
	CreatedAt          string   `json:"createdAt"`
	UpdatedAt          string   `json:"updatedAt"`
	Class              string   `json:"class"`
}

// GetRoles returns 'constant' values for defined Role Type
//
// roleType is the type of organization in question.
func GetRoles(roleType string) []string {
	if roleType == "Bank" {
		return []string{"Admin", "Manager"}
	} else if roleType == "CentralBank" {
		return []string{"Admin", "Client"}
	} else if roleType == "Buyer" {
		return []string{"Admin", "Client"}
	} else if roleType == "Seller" {
		return []string{"Admin", "Client"}

	}

	return []string{"Error", "Unexpected role type specified."}
}

// Add adds an organization to the state
//
// args : [id, name, email, type, createdAt]
func Add(APIstub shim.ChaincodeStubInterface, args []string, mspid string) sc.Response {

	roles := GetRoles(args[3])
	if roles[0] == "Error" {
		return shim.Error(roles[1])
	}

	userInfo := []string{args[0], args[1] + "-AdminUser", "Admin", args[2], args[4], ""}
	payload := user.Add(APIstub, userInfo, args[0])
	payloadAsBytes := payload.GetPayload()

	organization := Organization{
		ID:        args[0],
		Name:      args[1],
		Email:     args[2],
		Roles:     roles,
		Type:      args[3],
		MSPID:     mspid,
		CreatedAt: args[4],
		Class:     "Organization",
	}
	organization.UserIDs = append(organization.UserIDs, "User-"+args[0])
	organizationAsBytes, _ := json.Marshal(organization)
	err := APIstub.PutState(args[0], organizationAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	completePayloadAsBytes := utils.JoinResponseBytes([]string{string(payloadAsBytes[:]), string(organizationAsBytes[:])})
	return shim.Success(completePayloadAsBytes)

}

// AddRequest will add a request to the user ledger
//
// args : [PPSID]
func AddRequest(APIstub shim.ChaincodeStubInterface, args []string, currentOrg Organization) sc.Response {
	PPSRecordID := fc.GetMD5Hash(args[0])
	PPSAsResponse := eh.AbsentError(APIstub, PPSRecordID)
	if PPSAsResponse.GetMessage() != "" {
		return PPSAsResponse
	}
	PPSRecord := kyc.PPSRecord{}
	err := json.Unmarshal(PPSAsResponse.GetPayload(), &PPSRecord)
	userID := PPSRecord.UserID

	bankApproval := common.BankApproval{}
	bankApproval.CreatedAt = utils.GetTimestampAsISO(APIstub)
	bankApprovalID := fc.GetMD5Hash(userID + "-BankApproval")
	var bankApprovalAsBytes []byte

	existingBankApprovalAsBytes, err := APIstub.GetState(bankApprovalID)
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }

	if existingBankApprovalAsBytes == nil {
		bankApproval.ID = bankApprovalID
		bankApproval.PPSID = PPSRecordID
		bankApproval.PPSRaw = args[0]
		bankApproval.UserID = userID
		bankApproval.Banks = append(bankApproval.Banks, common.BankRequest{BankID: currentOrg.ID, Name: currentOrg.Name, UserStatus: "Request", BankStatus: "Request"})
		bankApprovalAsBytes, err = json.Marshal(bankApproval)
		if err != nil {
			return shim.Error(err.Error())
		}

	} else {
		err = json.Unmarshal(existingBankApprovalAsBytes, &bankApproval)
		for i := 0; i < len(bankApproval.Banks); i++ {
			if currentOrg.ID == bankApproval.Banks[i].BankID {
				return shim.Error("Already applied for the user")
			}
		}
		bankApproval.Banks = append(bankApproval.Banks, common.BankRequest{BankID: currentOrg.ID, Name: currentOrg.Name, UserStatus: "Request", BankStatus: "Request"})
		bankApprovalAsBytes, err = json.Marshal(bankApproval)
		if err != nil {
			return shim.Error(err.Error())
		}
	}

	err = APIstub.PutState(bankApproval.ID, bankApprovalAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	currentOrg.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	currentOrg.ApprovalRequestIDs = append(currentOrg.ApprovalRequestIDs, bankApproval.ID)
	currentOrgAsBytes, err := json.Marshal(currentOrg)
	err = APIstub.PutState(currentOrg.ID, currentOrgAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	CbrBytes, err := APIstub.GetState("CBR")
	cbr := common.CBRequestIDs{}
	json.Unmarshal(CbrBytes, &cbr)
	cbr.RequestIDS = append(cbr.RequestIDS, bankApproval.ID)

	cbrBytes, err := json.Marshal(cbr)
	if err != nil {
		return shim.Error(err.Error())
	}
	APIstub.PutState("CBR", cbrBytes)

	return shim.Success(bankApprovalAsBytes)
}

// ApproveRequest will update the status
//
// args : [userID, bankId, statusUpdate]
// accepted status : ["Approved", "Rejected"]
func ApproveRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	userID, organizationID, status := args[0], args[1], args[2]
	fmt.Println(userID)
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
			if bankRequest.BankStatus == "Approved" {
				return shim.Error("Already approved for given bankID")
			}
			bankRequest.BankStatus = status

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

// AddUserID adds a userID to an organization
func AddUserID(APIstub shim.ChaincodeStubInterface, userAsBytes []byte, userOrg Organization) sc.Response {
	newUser := user.User{}
	err := json.Unmarshal(userAsBytes, &newUser)
	if err != nil {
		return shim.Error(err.Error())
	}
	userOrg.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	userOrg.UserIDs = append(userOrg.UserIDs, newUser.ID)
	fmt.Println("UserOrg", userOrg)
	userOrgAsBytes, err := json.Marshal(userOrg)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("UserOrg after marshal", string(userOrgAsBytes[:]))
	err = APIstub.PutState(userOrg.ID, userOrgAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(userAsBytes)
}

// AddRecordID adds a recordID to an organization
func AddRecordID(APIstub shim.ChaincodeStubInterface, recordAsBytes []byte, userOrg Organization) sc.Response {
	record := kyc.Record{}
	err := json.Unmarshal(recordAsBytes, &record)
	if err != nil {
		return shim.Error(err.Error())
	}
	userOrg.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	userOrg.RecordIDs = append(userOrg.RecordIDs, record.ID)
	userOrgAsBytes, err := json.Marshal(userOrg)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = APIstub.PutState(userOrg.ID, userOrgAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(userOrgAsBytes)
}

// AddRole adds a new role to an organization
//
// args: [role]
func AddRole(APIstub shim.ChaincodeStubInterface, args []string, organizationID string) sc.Response {

	existingOrganizationAsBytes, _ := APIstub.GetState(organizationID)

	organization := Organization{}
	_ = json.Unmarshal(existingOrganizationAsBytes, &organization)

	if utils.StringInSlice(args[0], organization.Roles) {
		return shim.Error("Role already exists")
	}
	organization.UpdatedAt = utils.GetTimestampAsISO(APIstub)
	organization.Roles = append(organization.Roles, args[0])

	organizationAsBytes, _ := json.Marshal(organization)

	err := APIstub.PutState(organizationID, organizationAsBytes)
	return eh.SystemError(err, organizationAsBytes)

}
