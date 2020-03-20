#  Insurance Client
A Fabric Client for the `Insurance` chaincode.

###  Initial scripts (Run in the root of the project)
1.  `npm install` - To install the required packages

2.  `node enrollAdmin.js` - To enroll the admin of the peer

3.  `node server.js` - Start the server

## POST  /api/add-organization (Unauthenticated)
To create an organization. This will also create the first user (Admin). The user's card will be stored in the root of the folder.

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
#### *Body*

    {
        "name" : <STRING>,
        "organization_type" : <STRING>,
        "email" : <STRING>
    }

**Example**

    {
        "name" : "Apollo",
        "organization_type" : "Hospital",
        "email" : "sathish@skcript.com"
    }

### Response

    {
        "response": {
            "id": "f2923728f8cf6c4ef207c94734a4aae0",
            "enrollmentId": "User-2f203a820d658be725fc09e6b8257da1891ad497",
            "userId": "User-2f203a820d658be725fc09e6b8257da1",
            "status": "Allow",
            "createdAt": "2018-05-15T05:46:09Z",
            "revokedAt": "",
            "class": "IdentityRecord"
        }
    }

Also, find the admin's (The first user) card in the root of the project. Ex - `User-2f203a820d658be725fc09e6b8257da1891ad497.card`


##  POST /api/login (Unauthenticated)

Upload the `card` to login. Ex - `user-005815b250c2ebe354fbbf980595869d4df0cdac.card`



###  Request

####  *Header*

Key 		   | Value
---------------|-----------------
Content-Type   | application/json

####  *Body*

Key            | Value
---------------|-----------------
card 		   | Card (file) Ex :`user-005815b250c2ebe354fbbf980595869d4df0cdac.card`



###  Response
    {
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDA1ODE1YjI1MGMyZWJlMzU0ZmJiZjk4MDU5NTg2OWQ0ZGYwY2RhYyIsImlhdCI6MTUyNTg0MTk0NywiZXhwIjoxNTI1OTI4MzQ3fQ.QKYbSW5M9UtJ5szXdWHUAJs9xMF5PqJ4X3iPn0bpyYE"
    }
A `JSON Web Token` to consume authenticated APIs.

## POST  /api/add-user (Authenticated)
To create a new user

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string
#### *Body*

    {
        "name" : <STRING>,
        "role" : <STRING>,
        "email" : <STRING>,
    }

**Example**

    {
        "name" : "Dikson",
        "role" : "Doctor",
        "email" : "sathish@skcript.com",
    }

### Response

    {
        "response": {
            "id": "7c4486caefbe32d4b94777cafc191d48",
            "enrollmentId": "User-05b4b55c502585414a74ba64fe5cc17b9f60cb5d",
            "userId": "User-05b4b55c502585414a74ba64fe5cc17b",
            "status": "Allow",
            "createdAt": "2018-05-15T11:17:14Z",
            "revokedAt": "",
            "class": "IdentityRecord"
        }
    }

The new user's card will be stored in the root of the project. Ex - `User-05b4b55c502585414a74ba64fe5cc17b9f60cb5d.card`

## POST  /api/add-claim (Authenticated)
To add a new claim to the state by `InsureeClient`

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string (`InsureeClient`)
#### *Body*

    {
        "description" : <STRING>,
        "status" : <STRING>,
        "cost" : <NUMBER>,
        "organization_id" : <STRING>
    }

**Example**

    {
        "description" : "Health",
        "status" : "Initiated",
        "cost" : 1000,
        "organization_id" : "5ffd4f41c7cc583090f331bbeb047ec9"
    }

### Response

    {
        "response": {
            "id": "1bfeddda28b0e80c084b38957fe387fc",
            "description": "Health",
            "status": "Initiated",
            "cost": "1000",
            "insureeId": "User-b03a1b0d78b045f09d65d62392ceac7d",
            "userIds": null,
            "OrganizationID": "5ffd4f41c7cc583090f331bbeb047ec9",
            "class": "Claim"
        }
    }

A new claim is created for a particular hospital.

## POST  /api/update-claim-status (Authenticated)
Update the status of the claim by `InsurerCompany`

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string (`InsurerCompany`)
#### *Body*

    {
        "claim_id" : <STRING>,
        "status_update" : <STRING>
    }

**Example**

    {
        "claim_id" : "65b0131cb2cc6d1f8f384de3a1c7a427",
        "status_update" : "Requires Proof"
    }

### Response

      {
        "response": {
            "id": "65b0131cb2cc6d1f8f384de3a1c7a427",
            "description": "Health",
            "status": "Requires Proof",
            "cost": "1000",
            "insureeId": "User-655c52b306535ea747b80c84fc32a697",
            "userIds": null,
            "OrganizationID": "bde7635241a5051e305506778450d976",
            "class": "Claim"
        }
    }

The status of the claim is updated.

## POST  /api/add-user-to-claim (Authenticated)
Add a user to the claim by `InsurerCompany`

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string (`InsurerCompany`)
#### *Body*

    {
        "claim_id" : <STRING>,
        "user_id" : <STRING>
    }

**Example**

    {
        "claim_id" : "53b9c2547bf983a70253c1f3bb23d9b5",
        "user_id" : "User-655c52b306535ea747b80c84fc32a697"
    }

### Response

    {
        "response": {
            "id": "53b9c2547bf983a70253c1f3bb23d9b5",
            "description": "Health",
            "status": "Initiated",
            "cost": "1000",
            "insureeId": "User-655c52b306535ea747b80c84fc32a697",
            "userIds": [
                "User-fd854856f7d6470b8d6657ee2dbc7de0"
            ],
            "OrganizationID": "bde7635241a5051e305506778450d976",
            "class": "Claim"
        }
    }

A user will be added to the claim

## POST  /api/add-proof (Authenticated)
Add a proof to the claim by `Hospital`

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string (`Hospital`)
#### *Body*

    {
        "claim_id" :<STRING>,
        "certificate_id" : <STRING>
    }

**Example**



    {
        "claim_id" : "53b9c2547bf983a70253c1f3bb23d9b5",
        "certificate_id" : "61bc7e9cfe8977ef21e2bfca6aff0"
    }

### Response

    {
        "response": {
            "id": "3cce70732ecf7b5ffdb9192874c038c0",
            "claimId": "53b9c2547bf983a70253c1f3bb23d9b5",
            "certificateId": "61bc7e9cfe8977ef21e2bfca6aff0",
            "class": "Proof"
        }
    }

A proof will be added to a particular claim.

## GET  /api/get-user-details (Authenticated)

Get the details about a particular user. Send the request parameter as query string in the URL with key as `user_id` Ex - `/api/get-user-details?user_id=User-655c52b306535ea747b80c84fc32a697`

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
 token 		   | JWT token string

### Response

      {
        "response": {
            "class": "User",
            "id": "User-655c52b306535ea747b80c84fc32a697",
            "name": "AdminUser",
            "organizationId": "655c52b306535ea747b80c84fc32a697",
            "role": "Admin",
            "status": "Allow"
        }
    }

The response of the user that has the user_id `User-655c52b306535ea747b80c84fc32a697` (mentioned in the query string) .

## POST  /api/issue-identity (Authenticated)
Issue an identity to user. A user can have multiple identities.

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string
#### *Body*

    {
       "user_id" : <STRING>
    }

**Example**

    {
       "user_id" : "User-655c52b306535ea747b80c84fc32a697"
    }

### Response

    {
        "response": {
            "id": "8071485c59722250e65ff79969131db0",
            "enrollmentId": "User-655c52b306535ea747b80c84fc32a6970f29ccbd",
            "userId": "User-655c52b306535ea747b80c84fc32a697",
            "status": "Allow",
            "createdAt": "2018-05-16T05:16:19Z",
            "revokedAt": "",
            "class": "IdentityRecord"
        }
    }

An identity is issued to the user.

## POST  /api/revoke-identity-record (Authenticated)
Revoke an identity of a particular user

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string
#### *Body*

    {
       "user_id" : <STRING>,
       "enrollment_id" : <STRING>
    }

**Example**

    {
       "user_id" : "User-655c52b306535ea747b80c84fc32a697",
       "enrollment_id" : "User-655c52b306535ea747b80c84fc32a6970f29ccbd"
    }

### Response

    {
        "response": {
            "id": "8071485c59722250e65ff79969131db0",
            "enrollmentId": "User-655c52b306535ea747b80c84fc32a6970f29ccbd",
            "userId": "User-655c52b306535ea747b80c84fc32a697",
            "status": "Block",
            "createdAt": "2018-05-16T05:16:19Z",
            "revokedAt": "2018-05-16T05:20:31Z",
            "class": "IdentityRecord"
        }
    }

The identity of a particlar user is revoked and the status is changed to `Block`.

## GET  /api/get-claim-details (Authenticated)

Get the details about a particular claim. Send the request parameter as query string in the URL with key as `claim_id` Ex - `/api/get-claim-details?claim_id=65b0131cb2cc6d1f8f384de3a1c7a427`

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
 token 		   | JWT token string

### Response

    {
        "response": {
            "OrganizationID": "bde7635241a5051e305506778450d976",
            "class": "Claim",
            "cost": "1000",
            "description": "Health",
            "id": "65b0131cb2cc6d1f8f384de3a1c7a427",
            "insureeId": "User-655c52b306535ea747b80c84fc32a697",
            "status": "Requires Proof",
            "userIds": [
                "User-fd854856f7d6470b8d6657ee2dbc7de0"
            ]
        }
    }

The response with the claim details that has the claim_id `65b0131cb2cc6d1f8f384de3a1c7a427` (mentioned in the query string) .

## GET  /api/get-tx-details (Authenticated)

Get the transactiong for a particular year and month. Send the request parameter as query string in the URL with key as `year & month` Ex - `/api/get-tx-details?year=2018&month=05`

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
 token 		   | JWT token string

### Response

    {
        "response": [
            {
                "key": "0187d1e4360dcf4afa1801ed2a512ebb94790aaf38848b2e105d553f551e95f4",
                "record": {
                    "action": "CEA - Claim User Addition",
                    "claimId": "65b0131cb2cc6d1f8f384de3a1c7a427",
                    "timestamp": "2018-05-16T04:55:58Z",
                    "transaction": "Transaction",
                    "txnId": "0187d1e4360dcf4afa1801ed2a512ebb94790aaf38848b2e105d553f551e95f4"
                }
            },
            {
                "key": "059dccfb029e7c0a3c5f336361f2d267b4f0260a14b1115c7d16f8099f820cb3",
                "record": {
                    "action": "CA - Claim Addition",
                    "claimId": "65b0131cb2cc6d1f8f384de3a1c7a427",
                    "timestamp": "2018-05-16T04:35:23Z",
                    "transaction": "Transaction",
                    "txnId": "059dccfb029e7c0a3c5f336361f2d267b4f0260a14b1115c7d16f8099f820cb3"
                }
            },
            {
                "key": "894a89e57a16a53138b9940629743ce840baccfd42c617b09e9c863541f31b4f",
                "record": {
                    "action": "CA - Claim Addition",
                    "claimId": "53b9c2547bf983a70253c1f3bb23d9b5",
                    "timestamp": "2018-05-16T04:57:38Z",
                    "transaction": "Transaction",
                    "txnId": "894a89e57a16a53138b9940629743ce840baccfd42c617b09e9c863541f31b4f"
                }
            },
            {
                "key": "97b03c6801fafef734d65cd8fc43699c8e0ef6e106fdfa3e66d1076167614c29",
                "record": {
                    "action": "CSU - Claim Status Update",
                    "claimId": "65b0131cb2cc6d1f8f384de3a1c7a427",
                    "timestamp": "2018-05-16T04:37:30Z",
                    "transaction": "Transaction",
                    "txnId": "97b03c6801fafef734d65cd8fc43699c8e0ef6e106fdfa3e66d1076167614c29"
                }
            },
            {
                "key": "a40539e066fa33fb075ff4d3509e9a0c977b4c1dbde980a36f6abe1161f3db71",
                "record": {
                    "action": "PA- Proof Addition",
                    "claimId": "3cce70732ecf7b5ffdb9192874c038c0",
                    "timestamp": "2018-05-16T05:05:24Z",
                    "transaction": "Transaction",
                    "txnId": "a40539e066fa33fb075ff4d3509e9a0c977b4c1dbde980a36f6abe1161f3db71"
                }
            },
            {
                "key": "b38c63e0d7a3dc15f7d4ccf6be17b3eb2992ed7cb8e07e4f652004968ddb9a6d",
                "record": {
                    "action": "CEA - Claim User Addition",
                    "claimId": "53b9c2547bf983a70253c1f3bb23d9b5",
                    "timestamp": "2018-05-16T04:57:53Z",
                    "transaction": "Transaction",
                    "txnId": "b38c63e0d7a3dc15f7d4ccf6be17b3eb2992ed7cb8e07e4f652004968ddb9a6d"
                }
            }
        ]
    }

The list of all transaction that took place in a particular time period.

## POST  /api/add-role-to-org (Authenticated)
Add a new role to an exisiting organization
### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string
#### *Body*



     {
       "organization_id" : <STRING>,
       "role" : <STRING>
    }

**Example**

    {
       "organization_id" : "bde7635241a5051e305506778450d976",
       "role" : "Some role"
    }

### Response

    {
        "response": {
            "id": "bde7635241a5051e305506778450d976",
            "name": "Apollo",
            "roles": [
                "Admin",
                "Doctor",
                "Reporter",
                "Some role"
            ],
            "type": "Hospital",
            "mspid": "Org1MSP",
            "class": "Organization"
        }
    }

A new role named `Some role` is added to the organization.

## POST  /api/revoke-user (Authenticated)
Revoke an user completely

### Request
#### *Header*
 Key           | Value
---------------|-----------------
 Content-Type  | application/json
  token        | JWT token string
#### *Body*

    {
       "user_id" : <STRING>
    }

**Example**

    {
       "user_id" : "User-655c52b306535ea747b80c84fc32a697"
    }

### Response

    {
        "response": {
            "id": "User-655c52b306535ea747b80c84fc32a697",
            "name": "AdminUser",
            "role": "Admin",
            "organizationId": "655c52b306535ea747b80c84fc32a697",
            "status": "Block",
            "class": "User"
        }
    }

A user is revoked completely.


