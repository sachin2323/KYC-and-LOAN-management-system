package errorhandler

import (
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// ArgumentError is used to handle errors of incorrect argument length
func ArgumentError(expectedLength int, args []string) sc.Response {
	if expectedLength > len(args) {
		return shim.Error("Incorrect number of arguments. Expecting " + strconv.Itoa(expectedLength))
	}
	return shim.Success(nil)
}

// SystemError is used to handle for any side errors from system functions
func SystemError(err error, itemAsBytes []byte) sc.Response {
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(itemAsBytes)
}

// ExistError queries the state and sends an error if the queried id exists
func ExistError(APIstub shim.ChaincodeStubInterface, id string) sc.Response {
	itemAsBytes, _ := APIstub.GetState(id)
	if itemAsBytes != nil {
		return shim.Error(id + " Already Exists")
	}
	return shim.Success(nil)
}

// AbsentError queries the state and sends an error if the queried id
// doesn't exist
func AbsentError(APIstub shim.ChaincodeStubInterface, id string) sc.Response {

	itemAsBytes, err := APIstub.GetState(id)
	if itemAsBytes == nil {
		return shim.Error(id + " Doesn't Exist")
	}
	return SystemError(err, itemAsBytes)
}
