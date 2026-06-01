
export const SERVICE_DOCUMENTS: Record<string, string[]> = {
    'One Person Company (OPC) Registration': [
        "PAN Card (Director & Nominee)",
        "Aadhaar Card (Director & Nominee)",
        "Address Proof (Utility Bill/Rent Agreement)",
        "Photographs (Passport size)",
        "Bank Statement (Latest 3 months)",
        "Rent Agreement/NOC (For Registered Office)",
        "Utility Bills (Electricity/Water)"
    ],
    'Private Limited Company Registration': [
        "PAN Card (Directors & Shareholders)",
        "Aadhaar Card (Directors & Shareholders)",
        "Address Proof (Utility Bill/Rent Agreement)",
        "Photographs (Passport size)",
        "Rental Agreement/NOC (For Registered Office)",
        "Property Papers (If own property)",
        "Bank Statement (Latest 3 months)"
    ],
    // Fallback generic list if needed
    'default': [
        "PAN Card",
        "Aadhaar Card",
        "Address Proof",
        "Photographs"
    ]
};

export const getRequiredDocuments = (serviceType: string): string[] => {
    return SERVICE_DOCUMENTS[serviceType] || SERVICE_DOCUMENTS['default'];
};
