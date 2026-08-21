export const escapeHtml = (unsafe) => {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const parseSkills = (skills) => {
  if (typeof skills === 'string') {
    try {
      skills = JSON.parse(skills);
    } catch {
      skills = [];
    }
  }
  if (!Array.isArray(skills)) return [];
  return skills.map(s => (typeof s === 'string' ? s : s.name || s.skill || ''));
};
