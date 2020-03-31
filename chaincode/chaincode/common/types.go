package common

// BankRequest definition
type BankRequest struct {
	BankID        string   `json:"bankID"`
	Name          string   `json:"name"`
	UserStatus    string   `json:"user_status"`
	BankStatus    string   `json:"bank_status"`
	ExpireTime    string   `json:"expire_time"`
	ApprovedInfos []string `json:"approved_infos"`
	RequiredDocuments string `json:"required_documents"`
}

// BankApproval definition
type BankApproval struct {
	ID        string        `json:"id"`
	UserID    string        `json:"userId"`
	PPSID  string        `json:"PPSId"`
	PPSRaw string        `json:"PPSRaw"`
	Banks     []BankRequest `json:"banks"`
	CreatedAt string        `json:"createdAt"`
	UpdatedAt string        `json:"updatedAt"`
	Class     string        `json:"class"`
}

// CBRequestIDs definition
type CBRequestIDs struct {
	ID         string   `json:"id"`
	RequestIDS []string `json:"request_ids"`
}
