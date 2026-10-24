export const GRADES = ['All grades', 'Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
export const SUBJECTS = ['Mathematics', 'English', 'Afrikaans', 'Life Skills', 'Natural Sciences and Technology',
  'Social Sciences', 'Teacher admin', 'Other'];
export const rand = (c) => (c ? 'R' + (c / 100).toFixed(2).replace('.00', '') : 'Free');
