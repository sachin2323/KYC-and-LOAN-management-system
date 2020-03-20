import API from "../Lib/API";
import * as Routes from "../Config/Routes";

var getAllClaims = options => {
  let { onSuccess, onError } = options;
  var url = Routes.GET_ALL_CLAIMS;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var getOrgClaims = options => {
  let { onSuccess, onError } = options;
  var url = Routes.GET_ORG_CLAIMS;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var getInsurerClaims = options => {
  let { onSuccess, onError } = options;
  var url = Routes.GET_INSURER_CLAIMS;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var getUserClaims = options => {
  let { onSuccess, onError } = options;
  var url = Routes.GET_USER_CLAIMS;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var getClaimProof = options => {
  let { claim_id, onSuccess, onError } = options;
  var url = Routes.GET_CLAIM_PROOF;
  API.get(url, { claim_id })
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var getClaimDetails = options => {
  let { onSuccess, onError } = options;
  var url = Routes.GET_CLAIM_DETAILS;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var getStatusTimeline = options => {
  let { onSuccess, onError } = options;
  var url = Routes.GET_STATUS_TIMELINE;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var getTxnDetails = options => {
  let { onSuccess, onError } = options;
  var url = Routes.GET_TX_BY_MONTH;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var listIdentity = options => {
  let { onSuccess, onError } = options;
  var url = Routes.LIST_IDENTITY;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var searchOrganization = options => {
  let { onSuccess, onError } = options;
  var url = Routes.SEARCH_ORGANIZATION;
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var addClaim = options => {
  let { data, onSuccess, onError } = options;
  var url = Routes.ADD_CLAIM;
  API.post(url, data)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var updateClaimStatus = options => {
  let { data, onSuccess, onError } = options;
  var url = Routes.UPDATE_CLAIM_STATUS;
  API.post(url, data)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var addProof = options => {
  let { data, onSuccess, onError } = options;
  var url = Routes.ADD_PROOF;
  API.post(url, data)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

export {
  getAllClaims,
  getOrgClaims,
  getInsurerClaims,
  getUserClaims,
  getClaimProof,
  addClaim,
  getStatusTimeline,
  searchOrganization,
  updateClaimStatus,
  addProof,
  getClaimDetails,
  listIdentity,
  getTxnDetails
};

/**
 * /get-claim-details
 * /get-tx-details
 * /add-proof
 * /get-status-timeline
 */
