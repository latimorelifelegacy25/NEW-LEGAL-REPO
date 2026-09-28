import { SolItem } from '../types';

export const PA_SOL_DATA: SolItem[] = [
  {
    id: 'sol-personal-injury',
    claimCategory: 'Torts & Personal Injury',
    causeOfAction: 'Negligence, Bodily Injury, Wrongful Death & Product Liability',
    statutoryBasis: '42 Pa.C.S. § 5524(2)',
    limitationPeriod: '2 Years',
    periodInYears: 2,
    accrualRule:
      'Runs from the date the injury occurred, or the date the plaintiff knew or reasonably should have known of the injury and its cause (Discovery Rule).',
    tollingRules: [
      'Minority tolling: Minors have until age 20 (2 years post-18th birthday) under 42 Pa.C.S. § 5533(b).',
      'Discovery Rule applies where plaintiff could not, despite exercise of reasonable diligence, know of the harm.',
      'Fraudulent concealment tolls the clock until the deception is discovered.'
    ],
    keyCases: 'Fine v. Checcio, 582 Pa. 253 (2005); Wilson v. El-Daief, 600 Pa. 161 (2009)'
  },
  {
    id: 'sol-intentional-torts',
    claimCategory: 'Torts & Personal Injury',
    causeOfAction: 'Assault, Battery, False Imprisonment, Abuse of Process',
    statutoryBasis: '42 Pa.C.S. § 5524(1)',
    limitationPeriod: '2 Years',
    periodInYears: 2,
    accrualRule: 'Accrues immediately upon the commission of the unlawful intentional act.',
    tollingRules: [
      'Minority tolling applies for minor victims.',
      'Discovery rule rarely applies to assault/battery since the physical trauma is known immediately.'
    ],
    keyCases: 'Evans v. Philadelphia Transp. Co., 418 Pa. 567'
  },
  {
    id: 'sol-defamation',
    claimCategory: 'Defamation & Privacy',
    causeOfAction: 'Libel, Slander, and Invasion of Privacy',
    statutoryBasis: '42 Pa.C.S. § 5523(1)',
    limitationPeriod: '1 Year',
    periodInYears: 1,
    accrualRule: 'Single Publication Rule: Accrues on the first date the defamatory matter is published to a third party.',
    tollingRules: [
      'Strict 1-year deadline; continuing publication on the internet generally does not reset the clock without substantive republication.'
    ],
    keyCases: 'Graham v. Today\'s Spirit, 503 Pa. 52, 468 A.2d 454 (1983)'
  },
  {
    id: 'sol-written-contract',
    claimCategory: 'Contracts & Commercial',
    causeOfAction: 'Breach of Written Contract, Promissory Notes, Commercial Agreements',
    statutoryBasis: '42 Pa.C.S. § 5525(a)(7)-(8)',
    limitationPeriod: '4 Years',
    periodInYears: 4,
    accrualRule: 'Accrues at the moment the breach of contract occurs, regardless of when damages become apparent.',
    tollingRules: [
      'Acknowledgment of debt or voluntary partial payment restarts the 4-year limitation period.',
      'Equitable tolling in cases of active fraudulent concealment of the breach.'
    ],
    keyCases: 'Packer Soc. v. Medical Professional Liab., 20 A.3d 1233'
  },
  {
    id: 'sol-oral-contract',
    claimCategory: 'Contracts & Commercial',
    causeOfAction: 'Oral Contracts, Implied-in-Fact Contracts, Quantum Meruit',
    statutoryBasis: '42 Pa.C.S. § 5525(a)(3)',
    limitationPeriod: '4 Years',
    periodInYears: 4,
    accrualRule: 'Accrues at the date the oral performance was due and refused.',
    tollingRules: [
      'Promissory estoppel or continuous course of dealings may defer accrual.'
    ],
    keyCases: 'Cole v. Lawrence, 701 A.2d 987 (Pa. Super. 1997)'
  },
  {
    id: 'sol-property-damage',
    claimCategory: 'Property & Real Estate',
    causeOfAction: 'Property Damage, Trespass to Land, Conversion of Chattels',
    statutoryBasis: '42 Pa.C.S. § 5524(3)-(4)',
    limitationPeriod: '2 Years',
    periodInYears: 2,
    accrualRule: 'Accrues on the date of damage, entry without permission, or wrongful conversion.',
    tollingRules: [
      'Continuing trespass doctrine allows recovery for damages incurred within 2 years preceding suit.'
    ],
    keyCases: 'Sustrik v. Jones & Laughlin Steel Corp., 413 Pa. 324'
  },
  {
    id: 'sol-child-custody',
    claimCategory: 'Family & Domestic Relations',
    causeOfAction: 'Child Custody Complaint, Modification, Enforcement, Contempt',
    statutoryBasis: '23 Pa.C.S. § 5338 / Pa.R.C.P. 1915.1',
    limitationPeriod: 'Indefinite (No Statute of Limitations)',
    periodInYears: 0,
    accrualRule:
      'Child custody is never barred by time; any party may petition for initial custody or modification at any time during the child\'s minority (up to age 18) based on the child\'s best interests.',
    tollingRules: [
      'Not subject to 42 Pa.C.S. limitation periods.',
      'Contempt petitions for violation of an existing order must be filed in a reasonable timeframe to prevent waiver.'
    ],
    keyCases: '23 Pa.C.S. § 5338; Jackson v. Beck, 858 A.2d 1250'
  },
  {
    id: 'sol-child-support',
    claimCategory: 'Family & Domestic Relations',
    causeOfAction: 'Collection of Child Support Arrears & Judgments',
    statutoryBasis: '23 Pa.C.S. § 4354 / 42 Pa.C.S. § 5527',
    limitationPeriod: 'Indefinite / Permanent Judgment',
    periodInYears: 0,
    accrualRule:
      'Past-due child support payments become automatic civil judgments by operation of law (23 Pa.C.S. § 4352(d)) and are exempt from standard limitation expiration.',
    tollingRules: [
      'Under 23 Pa.C.S. § 4354, child support liens and arrears remain fully collectible until satisfied in full, even after child reaches adulthood.'
    ],
    keyCases: 'Horner v. Horner, 719 A.2d 1101 (Pa. Super. 1998)'
  },
  {
    id: 'sol-educator-misconduct',
    claimCategory: 'Administrative & Education',
    causeOfAction: 'Mandatory Administrator Report of Teacher Misconduct to PDE',
    statutoryBasis: '24 P.S. § 2070.9(b)',
    limitationPeriod: '15 Calendar Days',
    periodInYears: 0.041,
    accrualRule:
      'Strict statutory deadline: Chief school administrator must file official report with PDE within 15 days of the occurrence, suspension, resignation, or criminal charge.',
    tollingRules: [
      'No statutory tolling; failure to report within 15 days constitutes direct grounds for administrator discipline.'
    ],
    keyCases: '24 P.S. § 2070.9; 22 Pa. Code § 233.101'
  },
  {
    id: 'sol-criminal-interference-custody',
    claimCategory: 'Criminal Prosecution',
    causeOfAction: 'Interference with Custody of Children (18 Pa.C.S. § 2904)',
    statutoryBasis: '42 Pa.C.S. § 5552(b)(1)',
    limitationPeriod: '5 Years',
    periodInYears: 5,
    accrualRule:
      'Prosecution must be commenced within 5 years after commission, or period tolls while defendant is continuously absent from the Commonwealth.',
    tollingRules: [
      'Absence from Commonwealth tolls limitation under 42 Pa.C.S. § 5554.',
      'Active concealment of the child from lawful custodian can extend the limitation period.'
    ],
    keyCases: 'Commonwealth v. Chubbs, 3 Pa. D. & C. 4th 596'
  }
];
