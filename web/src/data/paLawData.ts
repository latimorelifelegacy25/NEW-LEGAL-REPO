import { StatuteItem, CaseGuidance } from '../types';

export const PA_STATUTES: StatuteItem[] = [
  {
    id: 'pa-18-2904',
    titleNumber: 'Title 18',
    titleName: 'Crimes and Offenses (Crimes Code)',
    chapterNumber: 'Chapter 29',
    chapterName: 'Kidnapping and Related Offenses',
    sectionNumber: '§ 2904',
    heading: 'Interference with custody of children',
    citation: '18 Pa.C.S. § 2904',
    category: 'crimes',
    summary:
      'Criminalizes knowingly or recklessly taking or enticing any child under 18 from the custody of its parent, guardian or other lawful custodian, when the actor has no privilege to do so, or withholding custody after expiration of visitation.',
    fullText: `(a) Offense defined.--A person commits an offense if he knowingly or recklessly takes or entices any child under the age of 18 years from the custody of its parent, guardian or other lawful custodian, when he has no privilege to do so.

(b) Defenses.--It is a defense that:
  (1) the actor believed that his action was necessary to preserve the child from danger to its welfare; or
  (2) the child, being at the time not less than 14 years old, was taken away at its own instigation without enticement and without purpose to commit a criminal offense with or against the child; or
  (3) the actor is the child's parent or legal custodian, or is acting pursuant to the lawful direction of the child's parent or legal custodian, and the actor's sole purpose is to preserve the child from imminent risk of harm.

(c) Grading.--
  (1) Except as provided in paragraph (2), an offense under this section is a felony of the third degree.
  (2) An offense under this section is a misdemeanor of the second degree if the actor, not being a parent or person in equivalent relation to the child, acted without purpose of enticement and quickly returned the child unharmed.`,
    elements: [
      'Child must be under 18 years of age at the time of the taking or enticing.',
      'Defendant took or enticed the child from the custody of a parent, guardian, or lawful custodian.',
      'Defendant had no legal privilege or lawful right under an existing court order or law to take the child.',
      'Act was committed knowingly or recklessly.'
    ],
    defensesOrExceptions: [
      'Actor reasonably believed the action was necessary to preserve child from danger to welfare.',
      'Child was at least 14 years old and left at their own instigation without criminal purpose or enticement.',
      'Actor is a parent acting solely to preserve child from imminent risk of harm.'
    ],
    gradeOrSeverity: 'Felony of the 3rd Degree (F3); reduced to Misdemeanor of the 2nd Degree (M2) under specific non-parent mitigation.',
    statuteOfLimitations: '5 years (42 Pa.C.S. § 5552 - major offense against minors)',
    relatedAuthorities: [
      {
        title: 'Custody Rights & Parental Standing',
        citation: '23 Pa.C.S. § 5328',
        note: 'Custody awards and decree enforcement under the Domestic Relations Code.'
      },
      {
        title: 'Commonwealth v. Chubbs',
        citation: '3 Pa. D. & C. 4th 596',
        note: 'Violation of existing custody decree establishes absence of privilege.'
      }
    ],
    tags: ['custody', 'parental kidnapping', 'title 18', 'child custody', 'visitation violation']
  },
  {
    id: 'pa-23-5328',
    titleNumber: 'Title 23',
    titleName: 'Domestic Relations',
    chapterNumber: 'Chapter 53',
    chapterName: 'Child Custody',
    sectionNumber: '§ 5328',
    heading: 'Factors in awarding custody (The 16 Statutory Factors)',
    citation: '23 Pa.C.S. § 5328',
    category: 'domestic_relations',
    summary:
      'Mandatory sixteen-factor statutory analysis that Pennsylvania trial courts MUST consider and place on the record when determining the best interests of the child in any legal or physical custody proceeding.',
    fullText: `(a) Factors.--In ordering any form of custody, the court shall determine the best interests of the child by considering all relevant factors, giving weighted consideration to those factors which affect the safety of the child, including the following:
  (1) Which party is more likely to encourage and permit frequent and continuing contact between the child and another party.
  (2) The present and past abuse committed by a party or member of the party's household, whether there is a continued risk of harm to the child or an abused party and which party can better provide adequate physical safeguards and supervision of the child.
  (2.1) The information set forth in section 5329.1 (relating to consideration of child abuse and involvement with protective services).
  (3) The parental duties performed by each party on behalf of the child.
  (4) The need for stability and continuity in the child's education, family life and community life.
  (5) The availability of extended family.
  (6) The child's sibling relationships.
  (7) The well-reasoned preference of the child, based on the child's maturity and judgment.
  (8) The attempts of a parent to turn the child against the other parent, except in cases of domestic violence where reasonable safety measures are necessary.
  (9) Which party is more likely to maintain a loving, stable, consistent and nurturing relationship with the child adequate for the child's emotional needs.
  (10) Which party is more likely to attend to the daily physical, emotional, developmental, educational and special needs of the child.
  (11) The proximity of the residences of the parties.
  (12) Each party's availability to care for the child or ability to make appropriate child-care arrangements.
  (13) The level of conflict between the parties and the willingness and ability of the parties to cooperate with one another.
  (14) The history of drug or alcohol abuse of a party or member of a party's household.
  (15) The mental and physical condition of a party or member of a party's household.
  (16) Any other relevant factor.`,
    elements: [
      'Child safety and history of abuse receives primary, weighted consideration.',
      'Trial court must articulate reasoning and factual findings on all 16 factors on the record prior to or contemporaneously with final order.',
      'Sole governing standard in Pennsylvania is the "Best Interests of the Child".'
    ],
    defensesOrExceptions: [
      'Parental alienation efforts are penalized, unless protective measures are justified due to ongoing domestic violence.',
      'Presumption of paternity and statutory standing requirements apply.'
    ],
    gradeOrSeverity: 'Civil Judicial Standard of Adjudication (Binding on all Common Pleas Courts)',
    statuteOfLimitations: 'Custody orders remain modifiable at any time upon showing of changed circumstances (23 Pa.C.S. § 5338).',
    relatedAuthorities: [
      {
        title: 'J.R.M. v. J.E.A.',
        citation: '33 A.3d 647 (Pa. Super. 2011)',
        note: 'Trial court commits reversible error when it fails to explicitly address each of the 16 factors.'
      },
      {
        title: 'Pa.R.C.P. No. 1915.3',
        citation: 'Rules of Civil Procedure',
        note: 'Commencement of custody complaint, modification petitions, and parenting plan requirements.'
      }
    ],
    tags: ['custody', 'best interest of child', '16 factors', 'family law', 'parenting schedule', 'pennsylvania custody']
  },
  {
    id: 'pa-23-5336',
    titleNumber: 'Title 23',
    titleName: 'Domestic Relations',
    chapterNumber: 'Chapter 53',
    chapterName: 'Child Custody',
    sectionNumber: '§ 5336',
    heading: 'Access to records and information by parents',
    citation: '23 Pa.C.S. § 5336',
    category: 'domestic_relations',
    summary:
      'Guarantees that both parents have full, equal access to all medical, dental, religious, and school records of their child, regardless of physical custody, unless restricted by a specific court order.',
    fullText: `(a) General rule.--Except as provided in subsection (b) or (c), each parent shall have access to the medical, dental, religious and school records of the child.

(b) Court order.--The court may deny access to records and information if it determines that access is not in the best interest of the child or would pose a risk of harm to the child or a parent.

(c) Nondisclosure of confidential information.--The court shall not order disclosure of the following:
  (1) The address of a victim of domestic violence or a domestic violence program.
  (2) The address of a parent or child if the court determines that disclosure would endanger the parent or child.

(d) Failure to comply.--Any person or entity who willfully fails or refuses to comply with an order granting parental access under this section may be subject to contempt of court.`,
    elements: [
      'Applies to both parents regardless of whether physical custody is shared, primary, or partial.',
      'Encompasses all educational, medical, dental, psychological, and religious records.',
      'Schools and medical providers may not refuse access based solely on lack of primary physical custody without a court order prohibiting access.'
    ],
    defensesOrExceptions: [
      'Express court order denying access in child best interests.',
      'Protection of confidential shelter address under domestic violence protection laws.'
    ],
    gradeOrSeverity: 'Civil statutory entitlement; enforceable via Contempt of Court sanctions.',
    relatedAuthorities: [
      {
        title: 'FERPA Parental Rights',
        citation: '34 CFR § 99.4',
        note: 'Federal regulation guaranteeing access to educational records for both biological/legal parents.'
      },
      {
        title: 'PDE Guidance on Student Records',
        citation: 'Pennsylvania Department of Education',
        note: 'Clarifies that public and charter school districts must furnish records to non-custodial parents.'
      }
    ],
    tags: ['records access', 'school records', 'medical records', 'custody rights', 'ferpa']
  },
  {
    id: 'pa-23-6311',
    titleNumber: 'Title 23',
    titleName: 'Domestic Relations',
    chapterNumber: 'Chapter 63',
    chapterName: 'Child Protective Services',
    sectionNumber: '§ 6311',
    heading: 'Persons required to report suspected child abuse (Mandated Reporters)',
    citation: '23 Pa.C.S. § 6311',
    category: 'juvenile_matters',
    summary:
      'Establishes the broad statutory category of mandated reporters in Pennsylvania including teachers, school employees, administrators, healthcare providers, therapists, and clergy obligated to report reasonable cause to suspect abuse.',
    fullText: `(a) Mandated reporters.--The following adults are required to report suspected child abuse if they have reasonable cause to suspect that a child is an abused child:
  (1) A person licensed or certified to practice in any health-related field.
  (2) A medical examiner, coroner or funeral director.
  (3) An employee of a health care facility.
  (4) A school employee, including an administrator, teacher, nurse, counselor, and aide.
  (5) An employee or volunteer of a child-care service, youth organization, or camp.
  (6) A clergyman, priest, rabbi, minister, or Christian Science practitioner.
  (7) An employee of a social services agency.
  (8) A peace officer or law enforcement official.
  (9) An emergency medical services provider.
  (10) An employee of a public library.
  (11) An individual paid or unpaid who on the basis of the individual's role is responsible for the child's care, supervision, guidance or training.

(b) Basis to report.--A mandated reporter shall make a report of suspected child abuse if the reporter has reasonable cause to suspect that a child is an abused child under any of the following circumstances:
  (1) The mandated reporter comes into contact with the child in the course of employment, occupation and practice of a profession.
  (2) The mandated reporter is directly responsible for the care, supervision, guidance or training of the child.
  (3) A child makes a direct disclosure to the mandated reporter.

(c) Immediate report.--Mandated reporters must immediately make an oral report to ChildLine (1-800-932-0313) or electronic report via the Child Welfare Information Solution (CWIS) self-service portal, followed by written confirmation within 48 hours.`,
    elements: [
      'Person is an adult meeting one of the statutory mandated reporter categories.',
      'Comes into contact with child or receives direct disclosure in professional or volunteer role.',
      'Possesses reasonable cause to suspect child abuse under statutory definition.',
      'Must report immediately to ChildLine without delegating or waiting for internal employer approval.'
    ],
    gradeOrSeverity: 'Civil & Criminal liability: Failure to report ranges from Misdemeanor of the 2nd Degree to Felony of the 2nd Degree for repeat/willful omissions.',
    statuteOfLimitations: 'Enhanced limitations under 42 Pa.C.S. § 5552(c.1).',
    relatedAuthorities: [
      {
        title: 'Penalties for Failure to Report',
        citation: '23 Pa.C.S. § 6319',
        note: 'Establishes criminal penalties for willful failure to report suspected child abuse.'
      },
      {
        title: 'Educator Discipline Act',
        citation: '24 P.S. § 2070.9',
        note: 'Failure to report results in mandatory professional certificate suspension/revocation.'
      }
    ],
    tags: ['child abuse', 'mandated reporter', 'childline', 'educator duty', 'cwis', 'chapter 63']
  },
  {
    id: 'pa-23-4321',
    titleNumber: 'Title 23',
    titleName: 'Domestic Relations',
    chapterNumber: 'Chapter 43',
    chapterName: 'Support Matters Generally',
    sectionNumber: '§ 4321',
    heading: 'Liability for support (Child & Spousal Support)',
    citation: '23 Pa.C.S. § 4321',
    category: 'domestic_relations',
    summary:
      'Governs the statutory duty of parents to support their children up to age 18 or high school graduation, and the duty of spouses to support each other based on financial capacity and guidelines.',
    fullText: `The following persons are legally liable for the support of others:
  (1) Parents are liable for the support of their children who are unemancipated and 18 years of age or younger.
  (2) A spouse is liable for the support of the other spouse who is in need.
  (3) Parents may be liable for the support of their children who are 18 years of age or older if the children are unable to maintain themselves due to physical or mental disability.`,
    elements: [
      'Biological or legal adoptive parent relationship established.',
      'Child is under 18 or completing secondary high school education.',
      'Calculated in accordance with statewide Support Guidelines formula (Pa.R.C.P. No. 1910.16-1 et seq.).'
    ],
    defensesOrExceptions: [
      'Emancipation of child before age 18.',
      'Spousal entitlement defenses (e.g. voluntary abandonment, adultery without reconciliation).'
    ],
    gradeOrSeverity: 'Civil Statutory Obligation; enforceable via wage attachment, license suspension, and civil contempt.',
    relatedAuthorities: [
      {
        title: 'Pennsylvania Support Guidelines',
        citation: 'Pa.R.C.P. No. 1910.16-1',
        note: 'Income shares model calculating base child support and apportioning health insurance/childcare.'
      }
    ],
    tags: ['child support', 'spousal support', 'chapter 43', 'domestic relations', 'wage attachment']
  },
  {
    id: 'pa-24-1327',
    titleNumber: 'Title 24',
    titleName: 'Public School Code of 1949',
    chapterNumber: 'Article XIII',
    chapterName: 'Pupils and Attendance',
    sectionNumber: '§ 13-1327',
    heading: 'Compulsory school attendance, truant definitions, and enforcement',
    citation: '24 P.S. § 13-1327',
    category: 'education',
    summary:
      'Specifies mandatory schooling ages in Pennsylvania (now age 6 through 18), defines truancy (3+ unexcused absences) and habitual truancy (6+ unexcused absences), and regulates home school compliance and school district obligations.',
    fullText: `(a) General rule.--Except as hereinafter provided, every child of compulsory school age having a legal residence in this Commonwealth, as provided in this article, and every child between the age of six (6) and eighteen (18) years is required to attend a day school in which the subjects and activities prescribed by the standards of the State Board of Education are taught.

(b) Truancy definitions.--
  (1) "Truant" shall mean having incurred three (3) or more days of unexcused absences during the current school year by a child subject to compulsory school attendance.
  (2) "Habitually truant" shall mean having incurred six (6) or more days of unexcused absences during the current school year.

(c) School attendance improvement conference.--When a child is habitually truant, the school shall hold a School Attendance Improvement Conference (SAIC) prior to initiating formal citations before a Magisterial District Judge.`,
    elements: [
      'Child is between ages 6 and 18 residing in PA.',
      'Must attend approved public, charter, nonpublic school or compliant home education program.',
      'Unexcused absences trigger mandatory progressive intervention framework prior to court citation.'
    ],
    gradeOrSeverity: 'Summary Offense for parents; fines up to $300 (first), $500 (second), $750 (third+), plus court costs or community service.',
    relatedAuthorities: [
      {
        title: 'PDE Basic Education Circular: Compulsory Attendance',
        citation: '24 P.S. § 13-1326 - 1333',
        note: 'Comprehensive guidance on school attendance improvement conferences, truant citations, and county CYS referrals.'
      }
    ],
    tags: ['compulsory attendance', 'truancy', 'title 24', 'pennsylvania schools', 'pde guidance']
  },
  {
    id: 'pa-24-2070',
    titleNumber: 'Title 24',
    titleName: 'Public School Code (Educator Discipline Act)',
    chapterNumber: 'Act of Dec. 12, 1973, P.L. 397',
    chapterName: 'Professional Educator Discipline',
    sectionNumber: '24 P.S. § 2070.1 et seq.',
    heading: 'Professional Educator Discipline Act (Mandatory Reporting & Grounds for Decertification)',
    citation: '24 P.S. § 2070.9',
    category: 'education',
    summary:
      'Imposes strict statutory duties on school administrators to report educator misconduct to the Department of Education within 15 days, covering sexual misconduct, moral turpitude, cruelty, negligence, and license suspension grounds.',
    fullText: `Section 9. Mandatory Reporting of Misconduct.--
(a) The chief school administrator of any school entity shall report to the department any educator who has:
  (1) Been indicted or convicted of any crime of violence, drug offense, or crime involving moral turpitude.
  (2) Engaged in sexual misconduct or inappropriate physical or electronic communication with a student.
  (3) Been suspended, dismissed, or resigned in lieu of discipline or dismissal for educator misconduct.
  (4) Willfully failed to comply with child abuse reporting mandates.

(b) Timeframe.--The report must be transmitted in writing to the Department within fifteen (15) days of the occurrence or discovery of the triggering event. Failure of a superintendent or executive director to file this report constitutes an independent act of professional misconduct.`,
    elements: [
      'Applies to certified teachers, administrators, specialists, and educational staff in PA.',
      'Mandatory reporting to PDE within 15 calendar days of resignation, termination, or charge.',
      'Confidential investigations conducted by Professional Standards and Practices Commission (PSPC).'
    ],
    gradeOrSeverity: 'Statewide Certificate Revocation, Immediate Surrender, or Public Reprimand',
    relatedAuthorities: [
      {
        title: 'Code of Professional Practice & Conduct',
        citation: '22 Pa. Code § 235',
        note: 'Codified professional standards for educators across all public schools in the Commonwealth.'
      }
    ],
    tags: ['educator discipline', 'teacher misconduct', 'mandatory reporting', 'pspc', 'pde']
  },
  {
    id: 'pa-code-22-235',
    titleNumber: '22 Pa. Code',
    titleName: 'Pennsylvania Code - State Board of Education',
    chapterNumber: 'Chapter 235',
    chapterName: 'Code of Professional Practice and Conduct for Educators',
    sectionNumber: '§ 235.5',
    heading: 'Code of Professional Practice and Conduct for Educators (Professional Practices)',
    citation: '22 Pa. Code § 235.5',
    category: 'education',
    summary:
      'Establishes binding professional conduct rules for educators: forbids sexual harassment, discrimination, falsification of student records, unauthorized disclosure of confidential student data, and unapproved corporal punishment.',
    fullText: `§ 235.5. Professional practices.
(a) Professional educators may not:
  (1) Discriminate against any student or staff member based on protected characteristics.
  (2) Sexually harass a student, employee, or member of the public.
  (3) Exploit professional relationships with students for personal or sexual gain.
  (4) Knowingly make false statements or conceal material facts regarding educator credentials or student records.
  (5) Disclose confidential student information without parental consent or statutory authorization under FERPA.

(b) Student welfare.--Professional educators shall maintain high professional ideals in caring for the physical and emotional welfare of students and shall promptly report suspected abuse or neglect as required by law.`,
    elements: [
      'Prohibits any sexualized contact, communications, or boundary violations with pupils.',
      'Prohibits falsifying grades, attendance, or student records.',
      'Requires protection of student privacy and adherence to mandated reporting.'
    ],
    gradeOrSeverity: 'Administrative Disciplinary Sanctions by State Board & PSPC',
    relatedAuthorities: [
      {
        title: 'FERPA Regulations',
        citation: '34 CFR § 99.31',
        note: 'Prior consent requirements for disclosing student education records.'
      }
    ],
    tags: ['code of conduct', 'teacher ethics', '22 pa code', 'student privacy', 'educator standards']
  },
  {
    id: 'pa-42-5524',
    titleNumber: 'Title 42',
    titleName: 'Judicial Code',
    chapterNumber: 'Chapter 55',
    chapterName: 'Limitation of Time',
    sectionNumber: '§ 5524',
    heading: 'Two year limitation (Statute of Limitations for Torts, Negligence, Fraud, and Injury)',
    citation: '42 Pa.C.S. § 5524',
    category: 'civil_procedure',
    summary:
      'The foundational Pennsylvania statute of limitations imposing a strict 2-year window to file lawsuits for personal injuries, negligence, wrongful death, medical malpractice, battery, fraud, and interference with property.',
    fullText: `The following actions and proceedings must be commenced within two years:
  (1) An action for assault, battery, false imprisonment, false arrest, malicious prosecution or malicious abuse of process.
  (2) An action to recover damages for injuries to the person or for the death of an individual caused by the wrongful act or neglect or unlawful violence or negligence of another.
  (3) An action for taking, detaining or injuring personal property, including actions for specific recovery thereof.
  (4) An action for waste or trespass of real property.
  (5) An action upon a statute for a civil penalty or forfeiture.
  (7) Any other action or proceeding to recover damages for injury to person or property which is founded on negligent, intentional, or otherwise tortious conduct or any other action or proceeding sounding in trespass.`,
    elements: [
      'Clock begins running on the date the injury occurred or was discovered under the Discovery Rule.',
      'Bar to action: Filing after the 2-year anniversary results in immediate dismissal via Preliminary Objections or New Matter.',
      'Minority tolling (42 Pa.C.S. § 5533(b)): Minors generally have until their 20th birthday to file personal injury actions.'
    ],
    defensesOrExceptions: [
      'The Discovery Rule tolls the statute until plaintiff knows or reasonably should have known of injury and its cause.',
      'Fraudulent concealment by defendant tolls the limitation period.',
      'Minority tolling until age 20.'
    ],
    gradeOrSeverity: 'Mandatory Procedural Bar to Civil Litigation',
    statuteOfLimitations: '2 Years strictly measured from date of accrual or discovery',
    relatedAuthorities: [
      {
        title: 'Fine v. Checcio',
        citation: '582 Pa. 253, 870 A.2d 850 (2005)',
        note: 'Supreme Court standard for applying the Discovery Rule and fraudulent concealment tolling doctrine.'
      },
      {
        title: 'Statute of Repose',
        citation: '42 Pa.C.S. § 5536',
        note: 'Construction project 12-year statute of repose.'
      }
    ],
    tags: ['statute of limitations', 'two year limit', 'negligence', 'personal injury', 'discovery rule', 'title 42']
  },
  {
    id: 'pa-const-art1-sec1',
    titleNumber: 'Pa. Constitution',
    titleName: 'Constitution of the Commonwealth of Pennsylvania',
    chapterNumber: 'Article I',
    chapterName: 'Declaration of Rights',
    sectionNumber: 'Article I, § 1',
    heading: 'Inherent Rights of Mankind (Parental Rights & Privacy Rights)',
    citation: 'Pa. Const. Art. I, § 1',
    category: 'constitutional',
    summary:
      'Guarantees all citizens inherent and indefeasible rights, including enjoyment of life, liberty, acquiring and possessing property, reputation, and foundational parental rights in raising children.',
    fullText: `All men are born equally free and independent, and have certain inherent and indefeasible rights, among which are those of enjoying and defending life and liberty, of acquiring, possessing and protecting property and reputation, and of pursuing their own happiness.`,
    elements: [
      'Pennsylvania constitutional protections are often broader than corresponding Federal Fourteenth Amendment protections.',
      'Fundamental liberty interest of parents in the care, custody, companionship, and control of their children.',
      'Right to reputation is an explicit constitutional property right under PA jurisprudence.'
    ],
    gradeOrSeverity: 'Supreme Organic Law of the Commonwealth',
    relatedAuthorities: [
      {
        title: 'In re H.S.W.C.-B.',
        citation: '575 Pa. 473, 836 A.2d 908 (2003)',
        note: 'Strict scrutiny applied to state interference with fundamental constitutional rights of parents.'
      },
      {
        title: 'Reputational Rights Protections',
        citation: 'Hatchard v. Westinghouse',
        note: 'Article I, § 1 elevates reputation to an inherent constitutional right alongside liberty and property.'
      }
    ],
    tags: ['constitution', 'parental rights', 'declaration of rights', 'fundamental liberties', 'due process']
  },
  {
    id: 'pa-rcp-1915-3',
    titleNumber: 'Pa.R.C.P.',
    titleName: 'Pennsylvania Rules of Civil Procedure',
    chapterNumber: 'Domestic Relations Actions',
    chapterName: 'Actions for Custody',
    sectionNumber: 'Rule 1915.3',
    heading: 'Commencement of Action. Complaint. Order. Criminal Record Verification',
    citation: 'Pa.R.C.P. No. 1915.3',
    category: 'civil_procedure',
    summary:
      'Prescribes mandatory procedural form for commencing child custody actions, filing petitions for modification, verifying criminal background/child abuse history under § 5329, and serving initial process.',
    fullText: `(a) An action shall be commenced by filing a verified complaint substantially in the form provided by Rule 1915.15.
(b) An order directing the parties to appear for a custody conference or conciliation shall be attached to the front of the complaint.
(c) The plaintiff shall file with the complaint, and each party shall file with any subsequent pleading, a Criminal Record / Abuse History Verification in the form prescribed by Rule 1915.3-2.
(d) Service of original process in custody actions must strictly conform to Pa.R.C.P. No. 1930.4 (personal service or certified mail with return receipt).`,
    elements: [
      'Complaint must include verified statement of all addresses where child has resided for past 5 years.',
      'Mandatory criminal and child abuse verification must accompany complaint.',
      'Court must issue scheduling order for conciliation/conference attached as first page.'
    ],
    gradeOrSeverity: 'Mandatory Statewide Civil Rule of Court',
    relatedAuthorities: [
      {
        title: 'Pa.R.C.P. No. 1915.15',
        citation: 'Official Form of Complaint for Custody',
        note: 'Standardized Pennsylvania complaint format.'
      }
    ],
    tags: ['custody complaint', 'civil procedure', 'service of process', 'family court', 'criminal verification']
  },
  {
    id: 'schuylkill-local-1915',
    titleNumber: 'Local Rules',
    titleName: 'Schuylkill County Court of Common Pleas (21st Judicial District)',
    chapterNumber: 'Family Division',
    chapterName: 'Custody Procedures',
    sectionNumber: 'Rule 1915.3',
    heading: 'Custody Conciliation Conferences & Local Conciliator Proceedings',
    citation: 'Schuylkill County L.R.C.P. 1915.3',
    category: 'local_rules',
    summary:
      'Establishes Schuylkill County court procedure: all custody disputes must first attend an informal Custody Conciliation Conference before a designated court Conciliator before any trial judge hearing.',
    fullText: `(a) All complaints for custody, partial custody, or modification filed in the Court of Common Pleas of Schuylkill County shall be referred immediately to the Custody Conciliator.

(b) The Conciliator shall conduct an informal conference with the parties and their legal counsel. The Conciliator may interview the child in chambers if deemed appropriate.

(c) If an agreement is reached, the Conciliator shall prepare a recommended agreed order to be signed by the parties and submitted to the Judge of the Family Division.

(d) If no agreement is reached, the Conciliator shall file a summary report and recommendation, and either party may file exceptions or request a pre-trial conference within twenty (20) days.`,
    elements: [
      'Mandatory pre-trial conciliation conference in Pottsville Courthouse.',
      'Strict 20-day window to file written exceptions to Conciliator recommendations.',
      'Failure of a party to appear may result in entry of recommended order as a binding decree.'
    ],
    gradeOrSeverity: 'Schuylkill County Local Rule of Court (21st Judicial District)',
    relatedAuthorities: [
      {
        title: 'Pa.R.C.P. 1915.4-3',
        citation: 'Statewide Office Conference Rules',
        note: 'Authorizes local judicial districts to utilize custody masters/conciliators.'
      }
    ],
    tags: ['schuylkill county', 'local rules', 'custody conciliation', '21st judicial district', 'pottsville court']
  },
  {
    id: 'ferpa-34-cfr-99',
    titleNumber: 'Federal Law',
    titleName: 'Code of Federal Regulations (Education Department)',
    chapterNumber: 'Title 34',
    chapterName: 'Subpart B - Inspection and Review of Education Records',
    sectionNumber: '34 CFR § 99.4 & § 99.31',
    heading: 'Family Educational Rights and Privacy Act (FERPA - Parental Access & Privacy)',
    citation: '20 U.S.C. § 1232g; 34 CFR Part 99',
    category: 'ferpa',
    summary:
      'Federal law granting parents (custodial and non-custodial alike) the affirmative right to inspect and review student education records within 45 days, and prohibiting disclosure of PII without prior written consent.',
    fullText: `34 CFR § 99.4: An educational agency or institution shall give full rights under the Act to either parent, unless the agency or institution has been provided with evidence that there is a court order, State statute, or legally binding document relating to such matters as divorce, separation, or custody that specifically revokes these rights.

34 CFR § 99.10: An educational agency or institution shall comply with a request for access to records within a reasonable period of time, but not more than 45 days after it has received the request.

34 CFR § 99.31: Prior consent is not required for disclosure to school officials with legitimate educational interests, or pursuant to a lawful judicial order or lawfully issued subpoena upon advance notice to parents.`,
    elements: [
      'Presumption of equal parental access for biological and legal parents.',
      'Maximum 45-day statutory window for school compliance.',
      'School cannot withhold access from non-custodial parent without a certified court order specifically revoking FERPA rights.'
    ],
    defensesOrExceptions: [
      'Binding judicial decree explicitly revoking educational rights.',
      'Directory information exception (unless parent opt-out filed).'
    ],
    gradeOrSeverity: 'Federal Statutory Mandate; enforced by U.S. Department of Education Student Privacy Policy Office (SPPO).',
    relatedAuthorities: [
      {
        title: 'Parental Access to Records',
        citation: '23 Pa.C.S. § 5336',
        note: 'Pennsylvania counterpart statute guaranteeing full record access.'
      }
    ],
    tags: ['ferpa', 'student privacy', 'education records', 'parental access', 'federal law']
  }
];

export const PA_CASE_GUIDANCE: CaseGuidance[] = [
  {
    id: 'althaus-v-cohen',
    caseOrDocumentName: 'Althaus ex rel. Althaus v. Cohen',
    officialCitation: '562 Pa. 547, 756 A.2d 1166 (2000)',
    issuingAuthority: 'Supreme Court of Pennsylvania',
    dateOrYear: '2000',
    topic: 'Mental Health Professionals, Duty of Care to Third-Party Parents, Child Sexual Abuse Allegations',
    holdingOrPrinciple:
      'A therapist treating a child patient does NOT owe a civil common-law duty of care to the child\'s non-patient parents who are accused of abuse during therapy; however, the dissenting opinion emphasized the devastating harm of negligent therapeutic confirmation without objective validation.',
    fullSummary:
      'The parents of a minor child sued a psychiatrist and psychiatric clinic after their daughter made false allegations of sexual abuse during therapy, leading to criminal charges that were later dismissed. The PA Supreme Court analyzed the five factors governing judicial creation of a common-law duty: (1) relationship between parties; (2) social utility of conduct; (3) foreseeability and nature of risk; (4) consequences of imposing duty; and (5) overall public interest. The majority held that imposing a duty to the parents would create an irreconcilable conflict of interest with the primary patient (the child), impairing the therapist-patient relationship.',
    keyTakeaways: [
      'Therapists owe primary loyalty and confidential duty to their child patient, not accused parents.',
      'Dissenting opinion (Justice Castille & Newman) underscored that therapists who negligently plant or reinforce false memories inflict catastrophic, foreseeable harm on innocent parents.',
      'Mandatory reporting immunity under 23 Pa.C.S. § 6318 protects good-faith reports, but does not insulate gross negligence outside the reporting act.'
    ],
    practicalApplication:
      'In custody, abuse, and school proceedings, practitioners must verify whether therapists complied with professional standards (22 Pa. Code § 235) and obtain independent forensic evaluations rather than relying solely on treating therapists.',
    category: 'juvenile_matters'
  },
  {
    id: 'pde-compulsory-attendance-bec',
    caseOrDocumentName: 'PDE Basic Education Circular: Compulsory School Attendance & Truancy Elimination',
    officialCitation: '24 P.S. § 13-1326 – 13-1333 (PDE BEC)',
    issuingAuthority: 'Pennsylvania Department of Education (PDE)',
    dateOrYear: 'Updated 2020/2024',
    topic: 'Compulsory School Age, School Attendance Improvement Plans (SAIP), Court Referrals',
    holdingOrPrinciple:
      'Compulsory school age in Pennsylvania begins at age 6 and continues until age 18. School districts must follow a progressive truancy intervention plan (SAIC conference) before filing criminal summary citations or CYS referrals.',
    fullSummary:
      'This guidance sets forth the mandatory duties of school districts, charter schools, and intermediate units when managing absences. Truancy occurs at 3 unexcused absences; habitual truancy occurs at 6. The guidance bars districts from expelling students solely for truancy and requires a School Attendance Improvement Conference (SAIC) resulting in a written agreement. For children under 15, districts must refer to a community-based attendance program or County Children and Youth Services (CYS). For children 15 and older, districts may refer to CYS or file a citation before a Magisterial District Judge.',
    keyTakeaways: [
      'School districts cannot jump straight to court citations without first convening a SAIC conference.',
      'Custody schedules and visitation disputes between parents do not excuse failure to attend school unless excused in writing by the school entity.',
      'Penalties on parents include fines up to $300-$750 and driver license suspensions for truant youth.'
    ],
    practicalApplication:
      'Essential defense and compliance tool for families navigating custody-related school absence disputes or homeschooling notifications under 24 P.S. § 13-1327.1.',
    category: 'education'
  },
  {
    id: 'pde-student-records-transfer',
    caseOrDocumentName: 'PDE Guidance: Student Enrollment and Transfer of Disciplinary Records',
    officialCitation: '24 P.S. § 13-1304-A / 24 P.S. § 13-1305-A',
    issuingAuthority: 'Pennsylvania Department of Education',
    dateOrYear: 'PDE Official Guidance',
    topic: 'Transfer of Student Educational & Disciplinary Records between PA School Entities',
    holdingOrPrinciple:
      'When a student transfers between public, private, or charter school districts in Pennsylvania, the sending school MUST transmit certified copies of educational and disciplinary records within 10 days of request, and parents must be notified.',
    fullSummary:
      'Under Pennsylvania School Code § 1305-A, whenever a pupil transfers to another school entity, a certified copy of the student\'s disciplinary record must be transmitted within 10 days of the request. The receiving school entity must review the record before final placement. Furthermore, non-custodial parents maintain the absolute legal right under 23 Pa.C.S. § 5336 and FERPA to receive duplicates of all progress reports, attendance summaries, IEPs, and disciplinary notices.',
    keyTakeaways: [
      'Mandatory 10-day transmission window for student disciplinary records.',
      'Neither tuition disputes nor administrative holds may block record transmission needed for student enrollment.',
      'Schools must maintain an accurate log of all record requests under FERPA 34 CFR § 99.32.'
    ],
    practicalApplication:
      'Used by parents and attorneys to compel sluggish school districts to release records for custody litigation or immediate re-enrollment in a new school district.',
    category: 'education'
  }
];
