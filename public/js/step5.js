// Show modal for adding a new teacher
function showAddTeacherForm() {
    document.getElementById("teacherFormModal").style.display = "block";
  }
  
  // Hide modal for adding a new teacher
  function hideAddTeacherForm() {
    document.getElementById("teacherFormModal").style.display = "none";
  }
  
  // Toggle visibility of teacher list
  function toggleTeacherList() {
    const teacherList = document.getElementById("teacherList");
    teacherList.style.display = teacherList.style.display === "none" ? "block" : "none";
  }
  
  // Show edit teacher modal and populate fields
  function openEditTeacherModal(id, name, shortName, timeOff) {
    document.getElementById("editTeacherModal").style.display = "block";
    document.getElementById("editName").value = name;
    document.getElementById("editShortName").value = shortName;
    document.getElementById("editTimeOff").value = timeOff;
    document.getElementById("editTeacherForm").action = `/step5/edit/${id}`;
  }
  
  // Close the edit teacher modal
  function closeEditTeacherModal() {
    document.getElementById("editTeacherModal").style.display = "none";
  }
  
  // Close the edit teacher modal if clicked outside
  window.onclick = function(event) {
    if (event.target === document.getElementById("editTeacherModal")) {
      closeEditTeacherModal();
    }
  };
  



  // JavaScript for dynamically loading subjects based on selected course
document.querySelectorAll('select[name="course"]').forEach(select => {
  select.addEventListener('change', function() {
    const courseId = this.value;
    const teacherId = this.closest('form').getAttribute('action').split('/').pop();
    const subjectSelect = document.getElementById(`subject-select-${teacherId}`);

    fetch(`/step5/getSubjectsByCourse/${courseId}`)
      .then(response => response.json())
      .then(subjects => {
        subjectSelect.innerHTML = subjects.map(subject => 
          `<option value="${subject._id}">${subject.fullName} (${subject.shortName})</option>`
        ).join('');
      });
  });
});

// Add Time Off Field
function addTimeOff() {
  const timeOffSection = document.getElementById('timeOffSection');
  const newTimeOff = document.createElement('div');
  newTimeOff.innerHTML = `
    <label>Day:</label>
    <select name="timeOffDay[]" required>
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
    </select>
    <label>Time Range:</label>
    <input type="time" name="timeOffStart[]" required />
    <input type="time" name="timeOffEnd[]" required />
  `;
  timeOffSection.appendChild(newTimeOff);
}



function addTimeOffRow() {
  const container = document.getElementById('timeOffContainer');
  const row = document.createElement('div');
  row.className = 'timeOffRow';
  row.innerHTML = `
    <select name="timeOffDays[]">
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
      <option value="Saturday">Saturday</option>
    </select>
    <input type="time" name="timeOffStart[]" required />
    <input type="time" name="timeOffEnd[]" required />
  `;
  container.appendChild(row);
}

async function fetchSubjects(courseId, teacherId) {
  const res = await fetch(`/step5/subjects/${courseId}`);
  const subjects = await res.json();
  const select = document.getElementById(`subjectSelect-${teacherId}`);
  select.innerHTML = subjects.map(s => `<option value="${s._id}">${s.fullName} (${s.shortName})</option>`).join('');
}


function toggleDetails(teacherId) {
  const section = document.getElementById('teacher-details-' + teacherId);
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}