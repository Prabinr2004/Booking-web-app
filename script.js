const form = document.getElementById('bookingForm');
const list = document.getElementById('bookingList');

let bookings = [];
let editingId = null;

// --- NEW CODE: Load bookings from localStorage on page load ---
function loadBookings() {
  const storedBookings = localStorage.getItem('restaurantBookings');
  if (storedBookings) {
    bookings = JSON.parse(storedBookings);
    renderBookings(); // Render them immediately
  }
}

// --- NEW CODE: Save bookings to localStorage ---
function saveBookings() {
  localStorage.setItem('restaurantBookings', JSON.stringify(bookings));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const booking = {
    id: editingId || Date.now(),
    name: form.name.value,
    phone: form.phone.value,
    email: form.email.value,
    people: form.people.value,
    date: form.date.value, // This will be like '2025-07-09'
    time: form.time.value
  };

  // Check for duplicate booking (same date, time, and people count)
  const isDuplicate = bookings.some(b =>
    b.id !== editingId &&
    b.date === booking.date &&
    b.time === booking.time &&
    b.people === booking.people
  );

  if (isDuplicate) {
    alert("A booking with the same time and number of people already exists.");
    return;
  }

  if (editingId) {
    bookings = bookings.map(b => b.id === editingId ? booking : b);
    editingId = null;
    form.querySelector('button').textContent = "Add Booking";
  } else {
    bookings.push(booking);
  }

  form.reset();
  saveBookings();
  renderBookings();
});

function renderBookings() {
  list.innerHTML = '';
  if (bookings.length === 0) {
    const noBookingsMessage = document.createElement('p');
    noBookingsMessage.textContent = 'No bookings yet. Add one above!';
    noBookingsMessage.style.textAlign = 'center';
    noBookingsMessage.style.marginTop = '20px';
    list.appendChild(noBookingsMessage);
    return;
  }

  bookings.forEach(b => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${b.name}</strong> (${b.people} people)<br>
      ${formatDate(b.date)} at ${formatTime(b.time)}<br>
      ${b.phone} | ${b.email}<br>
      <button onclick="editBooking(${b.id})">Edit</button>
      <button onclick="deleteBooking(${b.id})">Delete</button>
    `;
    list.appendChild(li);
  });
}

function deleteBooking(id) {
  bookings = bookings.filter(b => b.id !== id);
  saveBookings();
  renderBookings();
}

function editBooking(id) {
  const b = bookings.find(b => b.id === id);
  form.name.value = b.name;
  form.phone.value = b.phone;
  form.email.value = b.email;
  form.people.value = b.people;
  form.date.value = b.date;
  form.time.value = b.time;

  editingId = id;
  form.querySelector('button').textContent = "Update Booking";
}

function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(':');
  let h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minute} ${ampm}`;
}

// --- NEW FUNCTION: Formats the date string ---
function formatDate(dateStr) {
  // dateStr will be in 'YYYY-MM-DD' format
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day); // Month is 0-indexed in Date constructor

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// --- NEW CODE: Call loadBookings when the script first runs ---
loadBookings();