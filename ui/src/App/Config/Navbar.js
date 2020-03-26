const CB_ADMIN_LINKS = [
  //{ name: "User Management", link: "/users" },
  { name: "Loan Applications", link: "/list-all-claims" },
  { name: "KYC Records", link: "/list-kycs" },
  { name: "KYC Requests", link: "/client-approved-requests" }
];

const BUYER_CLIENT_LINKS = [
  { name: "Loan Requests", link: "/list-client-claims" },
  { name: "KYC Record", link: "/client/kyc" },
  { name: "KYC Requests", link: "/kyc-requests" }
];

const SELLER_CLIENT_LINKS = [
  //{ name: "Loan Requests", link: "/list-client-claims" },
  { name: "KYC Record", link: "/client/kyc" },
  { name: "KYC Requests", link: "/kyc-requests" }
];


const GB_ADMIN_LINKS = [
  { name: "Loan Applications", link: "/list-org-claims" },
  { name: "KYC Records", link: "/kyc" }
];

const ADMIN_LINKS = [
  { name: "User Management", link: "/users" },
//  { name: "Loan Applications", link: "/list-all-claims" },
//  { name: "Loan Applications", link: "/list-org-claims" },
//  { name: "KYC Records", link: "/kyc" },
//  { name: "KYC Records", link: "/list-kycs" },
];

export { CB_ADMIN_LINKS, BUYER_CLIENT_LINKS, GB_ADMIN_LINKS, ADMIN_LINKS, SELLER_CLIENT_LINKS };
