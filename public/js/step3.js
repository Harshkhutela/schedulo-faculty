// Read subjects from hidden div
const allSubjects = JSON.parse(document.getElementById('subject-data').dataset.subjects);

function handleEditClick(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const short = btn.dataset.short;
  const selectedSubjectIds = JSON.parse(btn.dataset.subjects);
  const strength = btn.dataset.strength;
  openModal(id, name, short, selectedSubjectIds, strength);
}

function openModal(id, name, shortName, selectedSubjectIds, studentStrength) {
  document.getElementById('editCourseForm').action = `/step3/edit/${id}`;
  document.getElementById('editCourseName').value = name;
  document.getElementById('editCourseShortName').value = shortName;
  document.getElementById('editStudentStrength').value = studentStrength || 0;

  const subjectList = document.getElementById('editSubjectsList');
  subjectList.innerHTML = '';

  allSubjects.forEach(subject => {
    const isChecked = selectedSubjectIds.includes(subject._id);
    subjectList.innerHTML += `
      <label style="display:block;">
        <input type="checkbox" name="subjects" value="${subject._id}" ${isChecked ? 'checked' : ''} />
        ${subject.fullName} (${subject.shortName})
      </label>
    `;
  });

  document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

function toggleSubjectList() {
  const subjectList = document.getElementById('subjectOptions');
  subjectList.style.display = subjectList.style.display === 'none' ? 'block' : 'none';
}
