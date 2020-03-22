package claim

import (
	"encoding/json"
	"fmt"

	org "github.com/chaincode/organization"
	txn "github.com/chaincode/transaction"
	"github.com/chaincode/utils"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"

	"time"
)

// Claim definition
type Claim struct {
	ID             string   `json:"id"`
	Description    string   `json:"description"`
	Status         string   `json:"status"`
	SellerPPS      string   `json:"seller_PPS"`
	SellerName	   string   `json:"seller_name"`	
	InsureeID      string   `json:"insureeId"`
	UserIDs        []string `json:"userIds"`
	SellerID       string 	`json:"sellerID"`
	OrganizationID string   `json:"organizationId"`
	InsurerOrgID   string   `json:"insurerOrgId"`
	CreatedAt      string   `json:"createdAt"`
	Class          string   `json:"class"`
	Surname        string   `json:"surname"`
	FirstName      string   `json:"first_name"`
	Gender         string   `json:"gender"`
	Address        string   `json:"address"`
	Country        string   `json:"country"`
	EirCode        string   `json:"eir_code"`
	PhoneNumber    string   `json:"phone_number"`
	Email          string   `json:"email"`
	PPSNumber      string   `json:"pps_number"`
	DateOfBirth    string   `json:"date_of_birth"`
	MartialStatus  string   `json:"martial_status"`
	NoOfDependents string   `json:"no_of_dependents"`
	StatusOfLiving string   `json:"owner_rent_living"`
	OutstandingBalance string `json:"outstanding_balance"`
	CurrentValueOfProperty string `json:"current_value_property"`
	Occupation		string		`json:"occupation"`
	Position		string		`json:"position"`
	EmployerName	string		`json:"employer_name"`
	CompanyAddress	string 		`json:"company_address"`
	YearsOfEmployment string 	`json:"years_of_employment"`
	TypeOfEmployment string 	`json:"type_of_employment"`
	GrossBasicIncome string	    `json:"gross_basic_income"`
	NetMonthlyIncome string 	`json:"net_monthly_income"`
	Purpose			string		`json:"purpose"`
	PurchaseCost	string		`json:"purchase_cost"`
	RepairCost		string		`json:"repair_cost"`
	ValueOfProperty string		`json:"value_of_property"`
	ProfessionalFees string		`json:"professional_fees"`
	Funding			string 		`json:"funding"`
	AgreedPriceOfSale string 	`json:"agreed_price_of_sale"`
	AmountOfLoanRequired string `json:"amount_of_loan_required"`
	MortgageTerm	string		`json:"mortgage_term"`

}

// Proof definition
type Proof struct {
	ID            string `json:"id"`
	ClaimID       string `json:"claimId"`
	CertificateID string `json:"certificateId"`
	URL           string `json:"url"`
	Class         string `json:"class"`

	// more can be accomodated according to the use case
}

// GetDetails is used to fetch details of a claim.
//
// args[0] = ID -> the claim ID
func GetDetails(APIstub shim.ChaincodeStubInterface, args []string, txnID string) sc.Response {

	existingClaimAsBytes, _ := APIstub.GetState(args[0])

	fmt.Println(existingClaimAsBytes)

	return shim.Success(existingClaimAsBytes)

}

// Add is used to register a claim and store to the state - CouchDB
//
// args : [claimId, description, cost, organizationId]
func Add(APIstub shim.ChaincodeStubInterface, args []string, txnID string, userID string, currentOrgID string) sc.Response {

	timestamp, _ := APIstub.GetTxTimestamp()
	timestampAsInt := timestamp.GetSeconds()
	isotimestamp := time.Unix(timestampAsInt, 0).Format(time.RFC3339)
	txnDetails := []string{txnID, "LA - Loan Application Addition", isotimestamp, "", args[0]}
	type SearchResult struct {
		Key    string           `json:"key"`
		Record org.Organization `json:"record"`
	}
	searchResultsBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"name\":\""+args[3]+"\"},{\"class\": \"Organization\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	searchResults := []SearchResult{}
	json.Unmarshal([]byte(searchResultsBytes), &searchResults)
	if len(searchResults) < 1 {
		return shim.Error("No Bank found with given name")
	}
	fmt.Println("Organization-Insurer ID is", searchResults[0].Record)

	searchSellerBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"name\":\""+args[16]+"\"},{\"class\": \"User\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	searchSellers := []SearchResult{}
	json.Unmarshal([]byte(searchSellerBytes), &searchSellers)
	
	if len(searchSellers) < 1 {
		return shim.Error("No seller found with given name")
	}
	fmt.Println("Seller ID is", searchSellers[0].Record)


	searchPPSBytes, err := utils.GetQueryResultForQueryString(APIstub, "{\"selector\": {\"$and\": [{\"national_id\":\""+args[2]+"\"},{\"class\": \"User\"}]}}")
	if err != nil {
		return shim.Error(err.Error())
	}
	searchPPS := []SearchResult{}
	json.Unmarshal([]byte(searchPPSBytes), &searchPPS)

	if searchSellers[0].Record.ID != searchPPS[0].Record.ID {
		return shim.Error("Seller not matched with given PPS ID")
	}

	fmt.Println("PPS ID is", searchPPS[0].Record)

	claim := Claim{
		ID:             args[0],
		Description:    args[1],
		Status:         "Pending",
		SellerPPS:      args[2],
		InsureeID:      userID,
		SellerName:		args[16],
		SellerID:		searchSellers[0].Record.ID,
		InsurerOrgID:   searchResults[0].Record.ID,
		OrganizationID: currentOrgID,
		CreatedAt:      isotimestamp,
		Class:          "Claim",
		Surname:		args[4],
		FirstName:		args[5],
		Gender:			args[6],
		Address:		args[7],
		Country:		args[8],
		EirCode:		args[9],
		PhoneNumber:	args[10],
		Email:			args[11],
		PPSNumber:		args[12],
		DateOfBirth: 	args[13],
		MartialStatus:	args[14],
		NoOfDependents:	args[15],
		/*StatusOfLiving: args[16],
		OutstandingBalance: args[17],
		CurrentValueOfProperty: args[18], 
		Occupation : 	args[19],
		Position: 		args[20],
		EmployerName:	args[21],
		CompanyAddress:	args[22],
		YearsOfEmployment: args[23],
		TypeOfEmployment:args[24],
		GrossBasicIncome: args[25],	
		NetMonthlyIncome:args[26],
		Purpose:args[27],
		PurchaseCost:args[28],
		RepairCost:args[29],
		ValueOfProperty: args[30],
		ProfessionalFees: args[31],
		Funding:args[32],
		AgreedPriceOfSale: args[33],
		AmountOfLoanRequired: args[34],
		MortgageTerm:args[35],*/ 

	}
	claimAsBytes, _ := json.Marshal(claim)
	APIstub.PutState(args[0], claimAsBytes)
	txn.Add(APIstub, txnDetails)

	return shim.Success(claimAsBytes)
}

// AddUser is used to add a user to a claim, so they can have access based on
// the organization they belong to.
//
// args: [claimId]
func AddUser(APIstub shim.ChaincodeStubInterface, args []string, txnID string, userID string) sc.Response {

	existingClaimAsBytes, _ := APIstub.GetState(args[0])

	claim := Claim{}
	json.Unmarshal(existingClaimAsBytes, &claim)

	if utils.StringInSlice(userID, claim.UserIDs) {
		return shim.Error("User already in Claim")
	}

	claim.UserIDs = append(claim.UserIDs, userID)

	claimAsBytes, _ := json.Marshal(claim)

	APIstub.PutState(args[0], claimAsBytes)

	timestamp, _ := APIstub.GetTxTimestamp()
	timestampAsInt := timestamp.GetSeconds()
	isotimestamp := time.Unix(timestampAsInt, 0).Format(time.RFC3339)
	txnDetails := []string{txnID, "LEA - Loan Application User Addition", isotimestamp, "", claim.ID}
	txn.Add(APIstub, txnDetails)

	return shim.Success(claimAsBytes)

}

// AddProof is used to add a proof to a certain claim, by
// an external entity.
//
// args : [id, claimId, certificateId]
func AddProof(APIstub shim.ChaincodeStubInterface, args []string, txnID string) sc.Response {

	proof := Proof{
		ID:            args[0],
		ClaimID:       args[1],
		CertificateID: args[2],
		URL:           args[3],
		Class:         "Proof",
	}
	proofAsBytes, _ := json.Marshal(proof)

	APIstub.PutState(args[0], proofAsBytes)
	payloadAsResponse := UpdateStatus(APIstub, []string{args[1], "Processed"}, txnID)
	if payloadAsResponse.GetMessage() != "" {
		return payloadAsResponse
	}

	return shim.Success(proofAsBytes)

}

// UpdateStatus is used to update the status of a claim, access is limited to organization
//
// args : claimId, statusUpdate
func UpdateStatus(APIstub shim.ChaincodeStubInterface, args []string, txnID string) sc.Response {
	fmt.Println("UpdateStatus Initial")
	fmt.Println(args)
	existingClaimAsBytes, _ := APIstub.GetState(args[0])

	claim := Claim{}
	json.Unmarshal(existingClaimAsBytes, &claim)

	claim.Status = args[1]

	claimAsBytes, _ := json.Marshal(claim)
	APIstub.PutState(args[0], claimAsBytes)

	timestamp, _ := APIstub.GetTxTimestamp()
	timestampAsInt := timestamp.GetSeconds()
	isotimestamp := time.Unix(timestampAsInt, 0).Format(time.RFC3339)
	txnDetails := []string{txnID, "ASU - Application Status Update", isotimestamp, args[1], claim.ID}
	fmt.Println(txnDetails)
	fmt.Println(txn.Add(APIstub, txnDetails))
	txn.Add(APIstub, txnDetails)
	return shim.Success(claimAsBytes)

}
