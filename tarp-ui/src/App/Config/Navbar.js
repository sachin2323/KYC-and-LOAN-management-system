const CB_ADMIN_LINKS = [
  { name: "User Management", link: "/users" },
  { name: "Claims", link: "/list-all-claims" },
  { name: "KYC Records", link: "/list-kycs" },
  { name: "KYC Requests", link: "/client-approved-requests" }
];

const CLIENT_LINKS = [
  { name: "Claim Requests", link: "/list-client-claims" },
  { name: "KYC Record", link: "/client/kyc" },
  { name: "KYC Requests", link: "/kyc-requests" }
];

const GB_ADMIN_LINKS = [
  { name: "Claims", link: "/list-org-claims" },
  { name: "KYC Records", link: "/kyc" }
];

export { CB_ADMIN_LINKS, CLIENT_LINKS, GB_ADMIN_LINKS };
