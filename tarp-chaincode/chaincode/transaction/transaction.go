package transaction

import (
	"encoding/json"
	"fmt"

	"github.com/chaincode/utils"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Transaction definition
type Transaction struct {
	TxnID       string `json:"txnId"`
	Action      string `json:"action"`
	Timestamp   string `json:"timestamp"`
	Description string `json:"description"`
	ClaimID     string `json:"claimId"`
	Class       string `json:"class"`
}

// Add is used to add a transaction record to state.
//
// args : [txnId, action, timestamp, description, claimId]
func Add(APIstub shim.ChaincodeStubInterface, args []string) bool {

	fmt.Println("adding transaction")
	fmt.Println(args)
	txn := Transaction{args[0], args[1], args[2], args[3], args[4], "Transaction"}

	txnAsBytes, _ := json.Marshal(txn)
	fmt.Println(APIstub.PutState(args[0], txnAsBytes))
	fmt.Println("transaction added")

	return true

}

// GetTxnByMonth  is used to fetch all the transaction records for the current month
//
// args: [year(XXXX), month(XX)]
func GetTxnByMonth(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	regexString := args[0] + "-" + args[1] + "-*"
	queryString := "{\"selector\":{\"timestamp\":{\"$regex\":\"" + regexString + "\"}}}"
	resultAsBytes, _ := utils.GetQueryResultForQueryString(APIstub, queryString)
	return shim.Success(resultAsBytes)

}
