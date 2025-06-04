// Show/hide lab type input based on 'Is Lab?' checkbox in ADD form
function toggleLabType(checkbox) {
    const labTypeContainer = document.getElementById('labTypeContainer');
    if (labTypeContainer) {
      labTypeContainer.style.display = checkbox.checked ? 'block' : 'none';
    }
  }
  
  // Show/hide lab type input in EDIT rows
  function toggleLabEditType(checkbox, id) {
    const input = document.getElementById(`labTypeInput-${id}`);
    if (input) {
      input.style.display = checkbox.checked ? 'inline' : 'none';
    }
  }
  
  // Toggle subject list display on "View List" button
  function toggleList() {
    const list = document.getElementById('subjectList');
    if (list) {
      list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }
  }
  

  function toggleLabType(checkbox) {
    document.getElementById('labTypeContainer').style.display = checkbox.checked ? 'block' : 'none';
  }

  function toggleLabEditType(checkbox, id) {
    const input = document.getElementById('labTypeInput-' + id);
    input.style.display = checkbox.checked ? 'inline' : 'none';
  }

  function toggleList() {
    const list = document.getElementById('subjectList');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
  }

  function toggleEditForm(id) {
    const row = document.getElementById('editRow-' + id);
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  }



  