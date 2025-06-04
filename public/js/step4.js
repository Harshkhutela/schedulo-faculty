  function generateClassroomInputs(type) {
    const count = parseInt(document.getElementById(`${type}RoomCount`).value);
    const container = document.getElementById(`${type}RoomInputs`);
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      container.innerHTML += `
        <h4>${type === 'large' ? 'Large' : 'Small'} Room ${i + 1}</h4>
        <input type="hidden" name="rooms[${i}][capacityType]" value="${type}" />
        <input type="text" name="rooms[${i}][classOrLab]" placeholder="Name (e.g. Class A)" required />
        <input type="text" name="rooms[${i}][roomNumber]" placeholder="Room Number" required />
        <input type="text" name="rooms[${i}][building]" placeholder="Building Name" required /><br/>
      `;
    }
  }

  function generateLabInputs() {
    const count = parseInt(document.getElementById("labCount").value);
    const container = document.getElementById("labInputs");
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      container.innerHTML += `
        <h4>Lab ${i + 1}</h4>
        <input type="text" name="labs[${i}][classOrLab]" placeholder="Lab Name" required />
        <input type="text" name="labs[${i}][labType]" placeholder="Lab Type (e.g. Computer)" required />
        <input type="text" name="labs[${i}][roomNumber]" placeholder="Room Number" required />
        <input type="text" name="labs[${i}][building]" placeholder="Building Name" required /><br/>
      `;
    }
  }

  function toggleList() {
    const list = document.getElementById('roomList');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
  }


  function showAddRoomForm() {
    document.getElementById('roomFormModal').style.display = 'block';
  }
  
  function hideAddRoomForm() {
    document.getElementById('roomFormModal').style.display = 'none';
  }
  
  function toggleLabTypeField(select) {
    const field = document.getElementById('labTypeField');
    field.style.display = select.value === 'lab' ? 'block' : 'none';
  }
  
  function showAddRoomForm() {
    document.getElementById('roomFormModal').style.display = 'block';
  }

  function hideAddRoomForm() {
    document.getElementById('roomFormModal').style.display = 'none';
  }

  function toggleRoomFields(select) {
    const labFields = document.getElementById('labFields');
    const classFields = document.getElementById('classroomFields');
    if (select.value === 'lab') {
      labFields.style.display = 'block';
      classFields.style.display = 'none';
    } else {
      labFields.style.display = 'none';
      classFields.style.display = 'block';
    }
  }

  function toggleRoomList() {
    const list = document.getElementById('roomList');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
  }

  function openEditRoom(id, type, roomNo, building, capacity, labType) {
    const form = document.getElementById('editRoomForm');
    form.action = '/step4/edit/' + id;
    document.getElementById('editType').value = type;
    document.getElementById('editRoomNumber').value = roomNo;
    document.getElementById('editBuilding').value = building;
    document.getElementById('editCapacity').value = capacity;
    document.getElementById('editLabType').value = labType;

    toggleEditFields(document.getElementById('editType'));

    document.getElementById('editModal').style.display = 'block';
  }

  function toggleEditFields(select) {
    const labFields = document.getElementById('editLabFields');
    const classFields = document.getElementById('editClassroomFields');
    if (select.value === 'lab') {
      labFields.style.display = 'block';
      classFields.style.display = 'none';
    } else {
      labFields.style.display = 'none';
      classFields.style.display = 'block';
    }
  }

  function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
  }


  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const room = btn.dataset.room;
        const building = btn.dataset.building;
        const capacity = btn.dataset.capacity;
        const labType = btn.dataset.labtype;
  
        document.getElementById('roomFormModal').style.display = 'block';
  
        const form = document.querySelector('#roomFormModal form');
        form.action = `/step4/edit/${id}`;
        form.classOrLab.value = type;
        form.roomNumber.value = room;
        form.building.value = building;
  
        if (type === 'class') {
          form.capacityRange.value = capacity;
          document.getElementById('labTypeField').style.display = 'none';
        } else {
          form.labType.value = labType;
          document.getElementById('labTypeField').style.display = 'block';
        }
      });
    });
  });
  
