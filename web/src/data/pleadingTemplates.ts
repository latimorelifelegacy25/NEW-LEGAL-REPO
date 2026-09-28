import { PleadingTemplate } from '../types';

export const PLEADING_TEMPLATES: PleadingTemplate[] = [
  {
    id: 'template-notice-to-defend',
    title: 'Notice to Defend (Pa.R.C.P. No. 1018.1)',
    subtitle: 'Mandatory Cover Notice for Pennsylvania Civil Complaints',
    courtVenue: 'Court of Common Pleas',
    category: 'Civil Procedure',
    description:
      'Required by Pa.R.C.P. No. 1018.1 to be affixed to the front of every civil complaint filed in the Court of Common Pleas.',
    fields: [
      {
        key: 'county',
        label: 'County Name',
        placeholder: 'e.g., Schuylkill, Philadelphia, Allegheny',
        type: 'text',
        defaultValue: 'Schuylkill',
        required: true
      },
      {
        key: 'plaintiff',
        label: 'Plaintiff Full Name(s)',
        placeholder: 'e.g., John Doe',
        type: 'text',
        required: true
      },
      {
        key: 'defendant',
        label: 'Defendant Full Name(s)',
        placeholder: 'e.g., Jane Smith',
        type: 'text',
        required: true
      },
      {
        key: 'docketNumber',
        label: 'Docket Number (if assigned)',
        placeholder: 'e.g., S-1234-2026',
        type: 'text',
        defaultValue: 'No. _________ of 2026'
      },
      {
        key: 'legalAidPhone',
        label: 'Local Lawyer Referral / Legal Aid Agency Phone',
        placeholder: 'e.g., (570) 628-1235 (Schuylkill County Bar Referral)',
        type: 'text',
        defaultValue: 'Schuylkill County Bar Association, 216 S. Centre St., Pottsville, PA 17901 - (570) 628-1235'
      }
    ],
    generateText: (data) => {
      const county = (data.county || 'Schuylkill').toUpperCase();
      const plaintiff = data.plaintiff || '[PLAINTIFF NAME]';
      const defendant = data.defendant || '[DEFENDANT NAME]';
      const docket = data.docketNumber || 'No. _________ of 2026';
      const legalAid =
        data.legalAidPhone ||
        'Local Bar Association Lawyer Referral Service / Legal Aid Network';

      return `IN THE COURT OF COMMON PLEAS OF ${county} COUNTY, PENNSYLVANIA
CIVIL DIVISION

${plaintiff},
        Plaintiff,
    v.                                      ${docket}
${defendant},
        Defendant.

================================================================================
                                NOTICE TO DEFEND
================================================================================

You have been sued in court. If you wish to defend against the claims set forth 
in the following pages, you must take action within twenty (20) days after this 
complaint and notice are served, by entering a written appearance personally or 
by attorney and filing in writing with the court your defenses or objections to 
the claims set forth against you. 

You are warned that if you fail to do so the case may proceed without you and 
a judgment may be entered against you by the court without further notice for any 
money claimed in the complaint or for any other claim or relief requested by the 
plaintiff. You may lose money or property or other rights important to you.

YOU SHOULD TAKE THIS PAPER TO YOUR LAWYER AT ONCE. IF YOU DO NOT HAVE A LAWYER, 
GO TO OR TELEPHONE THE OFFICE SET FORTH BELOW. THIS OFFICE CAN PROVIDE YOU WITH 
INFORMATION ABOUT HIRING A LAWYER.

IF YOU CANNOT AFFORD TO HIRE A LAWYER, THIS OFFICE MAY BE ABLE TO PROVIDE YOU 
WITH INFORMATION ABOUT AGENCIES THAT MAY OFFER LEGAL SERVICES TO ELIGIBLE 
PERSONS AT A REDUCED FEE OR NO FEE.

                LAWYER REFERRAL SERVICE / LEGAL AID OFFICE:
                ${legalAid}
                Pennsylvania Lawyer Referral Service: (800) 692-7375
                MidPenn Legal Services / Legal Aid Network: (800) 326-9177

================================================================================`;
    }
  },
  {
    id: 'template-custody-complaint',
    title: 'Complaint for Child Custody (Pa.R.C.P. No. 1915.15)',
    subtitle: 'Formal Pennsylvania Custody Complaint under 23 Pa.C.S. § 5328',
    courtVenue: 'Court of Common Pleas - Family Division',
    category: 'Child Custody',
    description:
      'Official Pennsylvania complaint format for requesting shared, primary, or partial legal and physical custody.',
    fields: [
      {
        key: 'county',
        label: 'County of Filing',
        placeholder: 'e.g. Schuylkill',
        type: 'text',
        defaultValue: 'Schuylkill',
        required: true
      },
      {
        key: 'plaintiff',
        label: 'Plaintiff Name, Address & Relation',
        placeholder: 'e.g. John Doe, 123 Pine St, Pottsville PA (Father)',
        type: 'text',
        required: true
      },
      {
        key: 'defendant',
        label: 'Defendant Name, Address & Relation',
        placeholder: 'e.g. Jane Smith, 456 Elm St, Tamaqua PA (Mother)',
        type: 'text',
        required: true
      },
      {
        key: 'childrenInfo',
        label: 'Child(ren) Name(s), Age(s), and Date(s) of Birth',
        placeholder: 'e.g., A.D., born 04/15/2017 (age 9)',
        type: 'textarea',
        required: true
      },
      {
        key: 'custodyRequested',
        label: 'Form of Custody Requested',
        placeholder: 'Select custody type',
        type: 'select',
        options: [
          'Shared Legal Custody and Shared Physical Custody',
          'Shared Legal Custody and Primary Physical Custody to Plaintiff',
          'Sole Legal and Primary Physical Custody to Plaintiff',
          'Partial Physical Custody / Structured Visitation Schedule'
        ],
        defaultValue: 'Shared Legal Custody and Primary Physical Custody to Plaintiff'
      },
      {
        key: 'fiveYearResidences',
        label: 'Residences of Children over the Past 5 Years',
        placeholder: 'List addresses and persons with whom the children resided for the past 5 years...',
        type: 'textarea',
        required: true
      },
      {
        key: 'bestInterestGrounds',
        label: 'Factual Grounds under 23 Pa.C.S. § 5328 Factors',
        placeholder: 'Describe parental care, school stability, safety factors, and cooperation...',
        type: 'textarea',
        required: true
      }
    ],
    generateText: (data) => {
      const county = (data.county || 'Schuylkill').toUpperCase();
      const plaintiff = data.plaintiff || '[PLAINTIFF]';
      const defendant = data.defendant || '[DEFENDANT]';
      const children = data.childrenInfo || '[CHILDREN DETAILS]';
      const custodyType =
        data.custodyRequested ||
        'Shared Legal Custody and Primary Physical Custody';
      const residences =
        data.fiveYearResidences ||
        'Child has resided with Plaintiff and Defendant in the Commonwealth of Pennsylvania.';
      const grounds =
        data.bestInterestGrounds ||
        'The requested custody schedule serves the best interests and safety of the child under 23 Pa.C.S. § 5328.';

      return `IN THE COURT OF COMMON PLEAS OF ${county} COUNTY, PENNSYLVANIA
CIVIL DIVISION - FAMILY

${plaintiff},
        Plaintiff,
    v.                                      No. _______________ of 2026
${defendant},
        Defendant.

                                COMPLAINT FOR CUSTODY
                     (Pursuant to 23 Pa.C.S. § 5328 & Pa.R.C.P. 1915.15)

1. Plaintiff is ${plaintiff}, an individual residing in the Commonwealth of Pennsylvania.

2. Defendant is ${defendant}, an individual residing in the Commonwealth of Pennsylvania.

3. Plaintiff and Defendant are the biological and legal parents of the following minor child(ren):
   ${children}

4. During the past five (5) years, the minor child(ren) has/have resided at the following locations with the following individuals:
   ${residences}

5. The minor child(ren) currently reside(s) in ${county} County, Pennsylvania, which is the home state of the child(ren) under the Uniform Child Custody Jurisdiction and Enforcement Act (UCCJEA), 23 Pa.C.S. § 5401 et seq.

6. Plaintiff has not participated as a party or witness in any other custody litigation concerning the child(ren) in this or any other court, and knows of no other custody proceeding pending.

7. Plaintiff knows of no other person not a party to this proceeding who has physical custody of the child(ren) or claims to have custody or visitation rights.

8. The best interest and permanent welfare of the child(ren) will be served by granting Plaintiff:
   ${custodyType}.

9. In support thereof, Plaintiff submits the following facts in accordance with the mandatory statutory factors under 23 Pa.C.S. § 5328(a):
   ${grounds}

10. Attached hereto and incorporated herein is the mandatory Criminal Record / Abuse History Verification pursuant to Pa.R.C.P. No. 1915.3-2.

WHEREFORE, Plaintiff respectfully requests this Honorable Court to enter an Order awarding ${custodyType}, and schedule a Custody Conciliation Conference forthwith.

                                            Respectfully submitted,

Date: ________________________              ____________________________________
                                            Plaintiff / Attorney for Plaintiff`;
    }
  },
  {
    id: 'template-ferpa-request',
    title: 'FERPA & 23 Pa.C.S. § 5336 Records Request',
    subtitle: 'Formal Demand for Complete Student Educational & Disciplinary Records',
    courtVenue: 'School District / Educational Agency',
    category: 'Education Law',
    description:
      'Formal legal demand letter sent to school principals, superintendents, or charter schools demanding parental access under 23 Pa.C.S. § 5336 and 34 CFR § 99.4.',
    fields: [
      {
        key: 'parentName',
        label: 'Parent Name',
        placeholder: 'e.g. John Doe',
        type: 'text',
        required: true
      },
      {
        key: 'schoolName',
        label: 'School District / School Entity Name',
        placeholder: 'e.g., Pottsville Area School District',
        type: 'text',
        required: true
      },
      {
        key: 'administratorName',
        label: 'Principal / Superintendent Name',
        placeholder: 'e.g., Superintendent of Schools / Records Custodian',
        type: 'text',
        required: true
      },
      {
        key: 'studentName',
        label: 'Student Name & Date of Birth / Grade',
        placeholder: 'e.g., Alex Doe, DOB: 05/12/2014, Grade 6',
        type: 'text',
        required: true
      },
      {
        key: 'specificRecords',
        label: 'Specific Records Demanded',
        placeholder: 'e.g., Academic transcripts, attendance logs, disciplinary records under 24 P.S. § 1305-A, IEP / 504 files, counselor notes...',
        type: 'textarea',
        defaultValue: 'All cumulative education records, report cards, standardized test results, attendance and truancy documentation, disciplinary records and notices under 24 P.S. § 1305-A, special education IEP or Section 504 plans, and teacher/counselor correspondence.'
      }
    ],
    generateText: (data) => {
      const parent = data.parentName || '[PARENT NAME]';
      const school = data.schoolName || '[SCHOOL ENTITY]';
      const admin = data.administratorName || 'Records Custodian / Superintendent';
      const student = data.studentName || '[STUDENT NAME & DOB]';
      const records = data.specificRecords || 'All cumulative educational records.';

      return `SENT VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED & EMAIL
DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${admin}
${school}

RE: FORMAL DEMAND FOR INSPECTION & CERTIFIED COPIES OF STUDENT EDUCATION RECORDS
    Student: ${student}
    Parent Requesting: ${parent}
    Legal Authorities: 23 Pa.C.S. § 5336; 24 P.S. § 13-1305-A; 34 CFR Part 99 (FERPA)

Dear ${admin}:

Please accept this correspondence as a formal demand by the undersigned parent, pursuant to the Family Educational Rights and Privacy Act (FERPA), 20 U.S.C. § 1232g and 34 CFR Part 99, as well as the Pennsylvania Domestic Relations Code, 23 Pa.C.S. § 5336 (Access to records and information by parents).

As the biological and legal parent of ${student}, I possess an unconditional statutory right under 23 Pa.C.S. § 5336 and 34 CFR § 99.4 to inspect, review, and receive certified duplicates of all educational records maintained by ${school}.

Under federal regulation 34 CFR § 99.4, an educational agency must give full access rights to both parents absent a certified court order expressly revoking parental educational rights. No such restrictive order exists.

I hereby request complete, unredacted certified copies of the following documents:
${records}

Pursuant to 34 CFR § 99.10, the school entity must comply with this inspection request within a reasonable period, not to exceed forty-five (45) calendar days from receipt. Furthermore, in accordance with PDE Transfer of Records Guidance, disciplinary files must be transferred without delay.

Please contact me promptly at the address or email below to arrange delivery or electronic transmission of the certified records.

Sincerely,

__________________________________________
${parent}, Parent
Address: _________________________________
Phone: ___________________________________
Email: ___________________________________`;
    }
  },
  {
    id: 'template-verification',
    title: 'Pleading Verification (Pa.R.C.P. No. 1024 & 18 Pa.C.S. § 4904)',
    subtitle: 'Sworn Statement for all Pennsylvania Pleadings',
    courtVenue: 'Any Pennsylvania Court',
    category: 'Civil Procedure',
    description:
      'Required by Pa.R.C.P. No. 1024 to be attached at the conclusion of every complaint, petition, answer, or motion containing factual allegations.',
    fields: [
      {
        key: 'affiantName',
        label: 'Affiant / Party Name',
        placeholder: 'e.g., John Doe',
        type: 'text',
        required: true
      },
      {
        key: 'pleadingTitle',
        label: 'Title of Pleading Being Verified',
        placeholder: 'e.g., Complaint for Custody / Petition for Modification',
        type: 'text',
        defaultValue: 'Complaint for Custody',
        required: true
      }
    ],
    generateText: (data) => {
      const affiant = data.affiantName || '[AFFIANT NAME]';
      const pleading = data.pleadingTitle || 'Pleading';

      return `================================================================================
                                  VERIFICATION
================================================================================

I, ${affiant}, hereby verify that the facts set forth in the foregoing 
${pleading} are true and correct to the best of my personal knowledge, 
information, and belief. 

I understand that false statements herein are made subject to the penalties of 
18 Pa.C.S. § 4904 (relating to unsworn falsification to authorities), which 
carries criminal penalties up to a misdemeanor of the second degree.

Date: ________________________              ____________________________________
                                            ${affiant}, Affiant`;
    }
  },
  {
    id: 'template-certificate-of-service',
    title: 'Certificate of Service (Pa.R.C.P. No. 440)',
    subtitle: 'Proof of Service on Opposing Counsel or Pro Se Litigant',
    courtVenue: 'Court of Common Pleas',
    category: 'Civil Procedure',
    description:
      'Mandatory certificate certifying legal service of legal pleadings, motions, and notices upon opposing parties.',
    fields: [
      {
        key: 'county',
        label: 'County of Filing',
        placeholder: 'e.g. Schuylkill',
        type: 'text',
        defaultValue: 'Schuylkill',
        required: true
      },
      {
        key: 'captionCase',
        label: 'Case Caption & Docket Number',
        placeholder: 'e.g., Doe v. Smith, No. S-1234-2026',
        type: 'text',
        required: true
      },
      {
        key: 'documentServed',
        label: 'Title of Document Served',
        placeholder: 'e.g., Petition for Modification of Custody Order',
        type: 'text',
        required: true
      },
      {
        key: 'serviceMethod',
        label: 'Method of Service',
        placeholder: 'Select service method',
        type: 'select',
        options: [
          'First Class United States Mail, postage prepaid',
          'Certified Mail, Return Receipt Requested',
          'Hand Delivery / In-Person Delivery',
          'Electronic Service via County PACFile / Authorized E-Service'
        ],
        defaultValue: 'First Class United States Mail, postage prepaid'
      },
      {
        key: 'servedPersonDetails',
        label: 'Name and Address of Person Served',
        placeholder: 'e.g., Jane Smith, Esq., Attorney for Defendant, 100 Main St, Pottsville PA',
        type: 'textarea',
        required: true
      }
    ],
    generateText: (data) => {
      const caption = data.captionCase || '[CASE CAPTION & DOCKET NO.]';
      const doc = data.documentServed || '[DOCUMENT TITLE]';
      const method = data.serviceMethod || 'First Class U.S. Mail';
      const person = data.servedPersonDetails || '[RECIPIENT NAME & ADDRESS]';

      return `IN THE COURT OF COMMON PLEAS OF ${data.county ? data.county.toUpperCase() : 'SCHUYLKILL'} COUNTY, PENNSYLVANIA
CIVIL DIVISION

${caption}

================================================================================
                             CERTIFICATE OF SERVICE
================================================================================

I hereby certify that on this _____ day of __________________, 2026, a true and 
correct copy of the foregoing ${doc} was served upon the following individual(s) 
in accordance with Pennsylvania Rule of Civil Procedure No. 440 by:

[X] ${method}

ADDRESSED TO:
${person}

                                            ____________________________________
                                            Signature of Filer / Counsel of Record
                                            Name: ______________________________
                                            Address: ___________________________
                                            Phone: _____________________________`;
    }
  }
];
