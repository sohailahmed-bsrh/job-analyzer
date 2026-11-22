const analysis = {
  jobId: "cmsz21dbc0006ss1sxv11e3lw",
  companyName: null,
  roleTitle: "Senior Software Engineer",
  summary: "We are looking for a Senior Software Engineer with strong Python and React skills, and deep knowledge of SQL databases. 3+ years experience required.",
  responsibilities: [],
  requiredSkills: [
    "Python",
    "React",
    "SQL databases"
  ],
  preferredSkills: [],
  experienceRequirement: "3+ years experience required",
  educationRequirement: null,
  atsKeywords: [
    "Senior Software Engineer",
    "Python",
    "React",
    "SQL",
    "databases",
    "3+ years experience"
  ],
  confidence: 0.95
};

const createObj = {
  jobId: "cmsz21dbc0006ss1sxv11e3lw",
  ...analysis,
  responsibilities: JSON.stringify(analysis.responsibilities),
  requiredSkills: JSON.stringify(analysis.requiredSkills),
  preferredSkills: JSON.stringify(analysis.preferredSkills),
  atsKeywords: JSON.stringify(analysis.atsKeywords),
  rawModelJson: JSON.stringify(analysis)
};

console.log(createObj);
