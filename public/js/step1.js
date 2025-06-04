function addDepartment() {
    const container = document.getElementById('department-list');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'departments[]';
    input.required = true;
    container.appendChild(document.createElement('br'));
    container.appendChild(input);
  }
  
  let lectureCount = 1;
  function addLecture() {
    const container = document.getElementById('bell-time-list');
  
    const div = document.createElement('div');
    div.innerHTML = `
      <label>Lecture ${lectureCount}</label><br>
      Name: <input type="text" name="lectures[${lectureCount}][name]" required>
      Short Name: <input type="text" name="lectures[${lectureCount}][short]" required>
      Start Time: <input type="time" name="lectures[${lectureCount}][start]" required>
      End Time: <input type="time" name="lectures[${lectureCount}][end]" required>
      <br><br>
    `;
    container.appendChild(div);
    lectureCount++;
  }
  