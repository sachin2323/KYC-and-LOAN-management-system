package utils

import (
	"bytes"
	"encoding/json"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// Slice is a prototype for string array
type Slice struct {
	Data []string `json:"data"`
}

// StringInSlice checks if a string is present in an array
func StringInSlice(stringToCheck string, sliceToCheck []string) bool {
	for _, b := range sliceToCheck {
		if b == stringToCheck {
			return true
		}
	}
	return false
}

// JoinResponseBytes joins byte responses and sends as an array
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

// SliceFromString will return a slice from a stringified array
func SliceFromString(stringifiedSlice string) ([]string, error) {
	// example stringified array is
	// "{\"data\":[\"a\",\"b\",\"c\"]}"

	slice := Slice{}
	err := json.Unmarshal([]byte(stringifiedSlice), &slice)
	if err != nil {
		return slice.Data, err
	}
	return slice.Data, nil
}

// GetTimestampAsISO will return the current transactions timestamp
// as an ISO formatted string
func GetTimestampAsISO(APIstub shim.ChaincodeStubInterface) string {

	timestamp, _ := APIstub.GetTxTimestamp()
	timestampAsInt := timestamp.GetSeconds()
	return time.Unix(timestampAsInt, 0).Format(time.RFC3339)
}

// UniqueSlicer will unique the slicer
func UniqueSlicer(input []string) []string {
	u := make([]string, 0, len(input))
	m := make(map[string]bool)

	for _, val := range input {
		if _, ok := m[val]; !ok {
			m[val] = true
			u = append(u, val)
		}
	}
	return u
}
