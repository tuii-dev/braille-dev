// templates.ts

export interface User {
  id: string;
  name: string;
  // Other user fields as needed
}

export interface Tenant {
  id: string;
  name: string;
  // Other tenant fields as needed
}

export interface App {
  id: string;
  name: string;
  isPremium: boolean;
  // Other app fields as needed
}

export interface Model {
  id: string;
  name: string;
  schema: object;
}

export interface Setting {
  name: string;
  title: string;
  description: string;
  placeholder: string;
  type: any;
}

export interface Template {
  id: string;
  name: string;
  categories: string[]; // Modified to an array
  description?: string;
  createdBy: User;
  tenantId: string;
  model: Model;
  apps?: App[];
  settings?: Setting[];
  publicTemplate?: boolean;
  tenantPublisher?: boolean;
}

export const categories = [
  "All",
  "Business",
  "Education",
  "Personal",
  "Technology",
  "Finance",
  "Planning",
  "Sales",
];

export const currentTenantId = "tpR4mfkfpc-fnjdOVaVTe";

export const users: User[] = [
  { id: "4f115cd4-9d4e-4605-a0ba-37fc8c994678", name: "Sean" },
];

export const tenants: Tenant[] = [
  { id: "tpR4mfkfpc-fnjdOVaVTe", name: "Wilson Design and Build" },
  { id: "tenant0", name: "Braille-AI.com" },
];

export const apps: App[] = [
  { id: "app0", name: "Braille Extract", isPremium: false },
];

export const models: Model[] = [
  {
    id: "model0",
    name: "Finance Application Model",
    schema: {
      type: "object",
      properties: {
        assessment: {
          type: "object",
          title: "Assessment",
          properties: {
            incomme_from_broker_app: {
              type: "number",
              title: "Income from Broker App",
              description: "This is the income declared by the applicant",
            },
            outgoings_from_broker_app: {
              type: "number",
              title: "Total Outgoings",
              description:
                "The total expenses, outgoings or spending of the applicant",
            },
          },
          description: "",
        },
        primary_applicant: {
          type: "object",
          title: "Primary Applicant",
          properties: {
            age: { type: "number", title: "Age", description: "" },
            citizen: {
              enum: [
                "Citizen",
                "Permanent Resident",
                "Special Category Visa",
                "Temporary Visa",
              ],
              type: "string",
              title: "Citizen",
              description: "The citizenship status of the applicant.",
            },
            residence: {
              type: "object",
              title: "Residence",
              properties: {
                state: { type: "string", title: "State", description: "" },
                status: { type: "string", title: "Status", description: "" },
                suburb: { type: "string", title: "Suburb", description: "" },
                address: { type: "string", title: "Address", description: "" },
                postcode: {
                  type: "string",
                  title: "Postcode",
                  description: "",
                },
                months_at_address: {
                  type: "number",
                  title: "Months at Address",
                  description: "",
                },
              },
              description: "",
            },
            date_of_birth: {
              type: "string",
              title: "Date of Birth",
              format: "date",
              description: "Date of birth",
            },
          },
          description: "",
        },
      },
    },
  },
  {
    id: "model1",
    name: "Candidate Assessment Model",
    schema: {
      type: "object",
      properties: {
        candidate_suitability: {
          type: "number",
          title: "Candidate Suitability",
          description:
            "Rank the candidates in this resume using the data extracted. We are looking for an individual according to the 'job description' field setting. Pay attention to the education and experience of the candidate. Rank the candidate from 1-5 with 1 being low suitability and 5 being high suitability.",
        },
        email: {
          type: "string",
          title: "Email",
          description: "The applicant's email address",
        },
        interests: {
          type: "string",
          title: "Interests",
          description:
            "The personal hobbies or interests that the applicant has listed",
        },
        key_skills: {
          type: "string",
          title: "Key Skills",
          description:
            "The skills that the applicant has listed in their resume",
        },
        licenses_and_qualifications: {
          type: "string",
          title: "Licenses and Qualifications",
          description: "A list of the qualifications of the candidate",
        },
        name: {
          type: "string",
          title: "Name",
          description: "Name of the applicant",
        },
        number_of_references: {
          type: "number",
          title: "Number of References",
          description: "Count the number of references that were given",
          minimum: 0,
        },
        phone_number: {
          type: "string",
          title: "Phone Number",
          description: "The phone number of the applicant",
        },
        summary: {
          type: "string",
          title: "Summary",
          description: "The summary or aim of the applicant's resume or CV",
        },
        education: {
          type: "array",
          title: "Education",
          description:
            "The time periods and locations and subjects the applicant was educated in",
          items: {
            type: "object",
            title: "Education Details",
            properties: {
              education_level: {
                type: "string",
                enum: [
                  "Primary School",
                  "High School",
                  "Undergraduate Degree",
                  "Postgraduate Degree",
                  "PHD",
                  "Technical College",
                ],
                title: "Education Level",
                description: "The level of education",
              },
              field_of_study: {
                type: "string",
                title: "Field of Study",
                description:
                  "The field of study that the applicant was studying",
              },
              institution: {
                type: "string",
                title: "Institution",
                description: "The institution where the applicant was educated",
              },
              time_period: {
                type: "string",
                title: "Time Period",
                description: "The time period of the education",
              },
            },
          },
        },
        experience: {
          type: "array",
          title: "Experience",
          description:
            "The experience that the applicant has gathered before applying for this role",
          items: {
            type: "object",
            title: "Experience Details",
            properties: {
              achievements: {
                type: "string",
                title: "Achievements",
                description:
                  "The achievements or things that the applicant learned or did during their experience",
              },
              organisation: {
                type: "string",
                title: "Organisation",
                description:
                  "The organisation or company that the applicant was working with or for to gain this experience",
              },
              role: {
                type: "string",
                title: "Role",
                description:
                  "The role or job title for this portion of their professional experience",
              },
              time_period: {
                type: "string",
                title: "Time Period",
                description: "The time period of the experience",
              },
            },
          },
        },
        referees: {
          type: "array",
          title: "Referees",
          description:
            "These are the people that the applicant would like us to call or get in contact with to verify their experience and other aspects of their CV",
          items: {
            type: "object",
            title: "Referee Details",
            properties: {
              email: {
                type: "string",
                title: "Email",
                description: "The referee's email address",
              },
              name: {
                type: "string",
                title: "Name",
                description: "The name of the referee",
              },
              organisation: {
                type: "string",
                title: "Organisation",
                description:
                  "The name of the organisation that the referee was involved with",
              },
              phone_number: {
                type: "string",
                title: "Phone Number",
                description: "The phone number of the referee",
              },
              role: {
                type: "string",
                title: "Role",
                description: "The role of the referee",
              },
            },
          },
        },
      },
    },
  },
  {
    id: "model2",
    name: "Quiz Extraction Model",
    schema: {
      type: "object",
      description:
        "Schema for extracting quiz or exam data including student details and questions.",
      properties: {
        student: {
          type: "object",
          title: "Student Details",
          description: "Details of the student taking the quiz or exam.",
          properties: {
            name: {
              type: "string",
              title: "Student Name",
              description: "The name of the student taking the quiz or exam.",
            },
            exam_date: {
              type: "string",
              title: "Exam Date",
              format: "date",
              description:
                "The date of the exam. If not available, default to today's date.",
            },
          },
          required: ["name", "exam_date"],
        },
        questions: {
          type: "array",
          title: "Questions",
          description: "List of questions from the exam or quiz.",
          items: {
            type: "object",
            title: "Question Details",
            description:
              "Details about individual questions, including the question text, the student's answer, and feedback.",
            properties: {
              question_text: {
                type: "string",
                title: "Question Text",
                description: "The text of the question.",
              },
              student_answer: {
                type: "string",
                title: "Student Answer",
                description: "The answer provided by the student.",
              },
              grade: {
                type: "string",
                enum: ["correct", "incorrect", "partially correct"],
                title: "Grade",
                description:
                  "The grade for the answer based on its correctness.",
              },
              feedback: {
                type: "string",
                title: "Feedback",
                description:
                  "Feedback for the student explaining the grade and any errors.",
              },
            },
            required: ["question_text", "student_answer", "grade", "feedback"],
          },
        },
      },
      required: ["student", "questions"],
    },
  },
  {
    id: "model3",
    name: "Basic CRM Deals Model",
    schema: {
      type: "object",
      description:
        "Schema for managing multiple deals in a basic CRM system or spreadsheet.",
      properties: {
        deals: {
          type: "array",
          title: "Deals",
          description: "List of deals extracted from the uploaded document.",
          items: {
            type: "object",
            title: "Deal Details",
            description: "Details about an individual deal.",
            properties: {
              deal_name: {
                type: "string",
                title: "Deal Name",
                description: "The name of the deal.",
              },
              amount: {
                type: "number",
                title: "Deal Amount",
                description: "The monetary value of the deal.",
              },
              stage: {
                type: "string",
                title: "Stage",
                description:
                  "The current stage of the deal (e.g., Prospecting, Closed Won).",
              },
              closing_date: {
                type: "string",
                format: "date",
                title: "Closing Date",
                description: "The expected closing date for the deal.",
              },
              owner: {
                type: "string",
                title: "Owner",
                description: "The person responsible for the deal.",
              },
              account_name: {
                type: "string",
                title: "Account Name",
                description:
                  "The name of the account or company associated with the deal.",
              },
              contact_name: {
                type: "string",
                title: "Contact Name",
                description: "The name of the primary contact for the deal.",
              },
              phone: {
                type: "string",
                title: "Phone",
                description: "The phone number for the contact.",
              },
              email: {
                type: "string",
                format: "email",
                title: "Email",
                description: "The email address for the contact.",
              },
            },
            required: ["deal_name", "amount", "stage", "closing_date", "owner"],
          },
        },
      },
      required: ["deals"],
    },
  },
];

export const templates: Template[] = [
  {
    id: "template0",
    name: "Extract Applicant Information from Resume",
    categories: ["Business", "Human Resources"],
    description: "Extract key information from Resumes.",
    createdBy: users[0],
    tenantId: "tenant0",
    model: models[1],
    apps: [],
    settings: [
      {
        name: "job description",
        title: "Job Description",
        placeholder:
          "copy and paste the job description of the employee you are hiring here",
        description: "",
        type: "string",
      },
    ],
    publicTemplate: true,
    tenantPublisher: true,
  },
  {
    id: "template1",
    name: "Extract Information from a Finance Application",
    categories: ["Finance"],
    description:
      "Extract key information about the applicant on a finance application.",
    createdBy: users[0],
    tenantId: "tenant0",
    model: models[1],
    apps: [],
    publicTemplate: true,
    tenantPublisher: true,
  },
  {
    id: "template2",
    name: "Quiz Grading",
    categories: ["Education"],
    description:
      "Grade a student's quiz, grading each question and providing feedback to the student.",
    createdBy: users[0],
    tenantId: "tenant0",
    model: models[2],
    apps: [],
    publicTemplate: true,
    tenantPublisher: true,
  },
  {
    id: "template3",
    name: "CRM Deals Extraction",
    categories: ["Business", "Sales"],
    description:
      "Extract deals from a CRM system or spreadsheet, including deal name, amount, stage, and more.",
    createdBy: users[0],
    tenantId: "tenant0",
    model: models[3],
    apps: [],
    publicTemplate: true,
    tenantPublisher: true,
  },
];
