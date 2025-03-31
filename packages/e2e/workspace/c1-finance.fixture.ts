export const brokerDataSchema = {
  type: "object",
  title: "Broker Data",
  properties: {
    assessor_responsible: {
      type: "string",
      title: "Assessor Responsible",
    },
    brokerage: {
      type: "string",
      title: "Brokerage",
    },
    broker_name: {
      type: "string",
      title: "Broker Name",
    },
    date_application_received: {
      title: "Broker Data",
      type: "string",
      format: "date",
    },
  },
};

export const residenceSchema = {
  type: "object",
  title: "Residence",
  properties: {
    address: {
      type: "string",
      title: "Address",
    },
    subrurb: {
      type: "string",
      title: "Suburb",
    },
    state: {
      type: "string",
      title: "State",
    },
    postcode: {
      type: "string",
      title: "Postcode",
    },
    months_at_address: {
      type: "number",
      title: "Months at Address",
    },
    status: {
      type: "string",
      title: "Status",
    },
  },
};

export const employmentSchema = {
  type: "object",
  title: "Employment",
  properties: {
    employer: {
      type: "string",
      title: "Employer",
    },
    role_or_occupation: {
      type: "string",
      title: "Role or Occupation",
    },
    status: {
      type: "string",
      title: "Employment Status",
    },
    months_at_employer: {
      type: "number",
      title: "Months at Employer",
    },
    employment_refrence_name_and_number: {
      type: "string",
      title: "Employment Refrence Name and Number",
    },
  },
};

export const primaryApplicantSchema = {
  type: "object",
  title: "Primary Applicant",
  properties: {
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
    date_of_birth: {
      type: "string",
      title: "Date of Birth",
      format: "date",
    },
    age: {
      type: "number",
      title: "Age",
    },
    email_address: {
      type: "string",
      title: "Email",
    },
    phone_number: {
      type: "string",
      title: "Phone Number",
    },
    relationship_status: {
      type: "string",
      title: "Relationship Status",
    },
    relationship_status_hpi: {
      type: "string",
      title: "Relationship Status HPI",
    },
    partner_working: {
      type: "boolean",
      title: "Partner Working",
    },
    dependants: {
      type: "number",
      title: "Dependants",
    },
    dependant_level_of_care_percent: {
      type: "string",
      title: "Dependant Level of Care Percent",
      enum: ["0%", "25%", "50%", "75%", "100%"],
    },
    citizen: {
      type: "string",
      title: "Citizen",
      enum: [
        "Citizen",
        "Permanent Resident",
        "Special Category Visa",
        "Temporary Visa",
      ],
    },
    visa_subclass: {
      type: "string",
      title: "Visa Subclass",
    },
    residence: residenceSchema,
    current_employment: employmentSchema,
    previous_employment: {
      type: "array",
      items: {
        type: "object",
        properties: employmentSchema,
      },
    },
  },
};
