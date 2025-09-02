const DB_NAME = 'StudentEnrollmentDB';
const STORE_NAME = 'students';
let db;
let studentData = {};

const departmentCourses = {
    Science: ["Biology", "Physics", "Chemistry"],
    Commerce: ["Accounting", "Economics", "Business"],
    Arts: ["History", "Psychology", "Sociology"],
    Engineering: ["Civil", "CSE", "EEE", "ECE", "Mechanical"]
};

const coursesFee = {
    Science: { Duration: "3 years", Fee: "₹ 75,000", YearFee: "₹ 25,000" },
    Commerce: { Duration: "2 years", Fee: "₹ 50,000", YearFee: "₹ 25,000" },
    Arts: { Duration: "3 years", Fee: "₹ 90,000", YearFee: "₹ 30,000" },
    Engineering: { Duration: "4 years", Fee: "₹ 1,60,000", YearFee: "₹ 40,000" }
};

const openDB = async () => {
    if (!('indexedDB' in window)) {
        showPopup("Your browser doesn't support IndexedDB. Please use a modern browser.", "error");
        throw new Error("IndexedDB not supported");
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'ack' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            showPopup("Failed to open the database.");
            reject(event.target.error);
        };
    });
};


const saveStudentData = async () => {
    if (!db) {
        try {
            db = await openDB();
        } catch (error) {
            console.error("DB connection failed in saveStudentData:", error);
            return;
        }
    }

    try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(studentData);

        tx.oncomplete = () => {
            showPopup("Student data saved successfully!", "success");
            sessionStorage.removeItem('editStudentId');
            // Optionally redirect: window.location.href = 'dashboard.html';
        };

        tx.onerror = (event) => {
            console.error("Transaction failed:", event.target.error);
            showPopup("Error saving student data.","error");
        };
    } catch (error) {
        console.error("Unexpected error saving to IndexedDB:", error);
        showPopup("Unexpected error while saving.");
    }
};

const loadStudentForEdit = async (ackId) => {
    if (!db) {
        db = await openDB();
    }
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(ackId);

    request.onsuccess = () => {
        const student = request.result;
        if (student) {
            studentData = student; // Load the fetched student data into the global object
            populateFormFromData(student);
            // Hide all other forms and show the first one for editing
            document.querySelectorAll('.container').forEach(form => form.classList.add('hidden'));
            document.getElementById('form1').classList.remove('hidden');
        } else {
            console.error("Student with ACK ID not found:", ackId);
            // Redirect to a new form if student not found
            window.location.href = 'index.html'; 
        }
    };
    request.onerror = () => {
        console.error('Failed to load student data for edit:', request.error);
    };
};

const populateFormFromData = (data) => {
    document.getElementById('ackId').value = data.ack || '';
    document.getElementById('Fullname').value = data.Fullname || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('mobile').value = data.mobile || '';
    document.getElementById('department').value = data.department || '';

    if (data.department) {
        updateCourseDropdown(data.department);
    }
    document.getElementById('course').value = data.course || '';

    if (data.photo) {
        const img = document.getElementById('preview');
        img.src = data.photo;
        img.style.display = 'block';
    }
    document.getElementById('dob').value = data.dob || '';

    if (data.gender) {
    const genderInput = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
    if (genderInput) genderInput.checked = true;
    }

    document.getElementById('fname').value = data.fname || '';
    document.getElementById('mname').value = data.mname || '';
    document.getElementById('caste').value = data.caste || '';
    document.getElementById('parentEmail').value = data.parentEmail || '';
    document.getElementById('pNumber').value = data.pNumber || '';

    const addressParts = (data.address || '').split(', ');
    document.getElementById('address1').value = addressParts[0] || '';
    document.getElementById('address2').value = addressParts[1] || '';
    document.getElementById('address3').value = addressParts[2] || '';
    
    document.getElementById('nationality').value = data.nationality || '';
    document.getElementById('religion').value = data.religion || '';
    document.getElementById('govtid').value = data.govtid || '';
    document.getElementById('idnum').value = data.idnum || '';
    document.getElementById('Mark').value = data.Mark || '';
    document.getElementById('marksheet').value = data.marksheet || '';

    document.getElementById('Hname').value = data.Hname || '';
    document.getElementById('Bname').value = data.Bname || '';
    document.getElementById('ifsc').value = data.ifsc || '';
    document.getElementById('pre-book').value = data.PreBook || '';
};
//Another method (mapping array)
// const populateFormFromData = (data) => {
//     const fieldMappings = [
//         { id: 'ackId', key: 'ack' },
//         { id: 'Fullname', key: 'Fullname' },
//         { id: 'email', key: 'email' },
//         { id: 'mobile', key: 'mobile' },
//         { id: 'department', key: 'department' },
//         { id: 'course', key: 'course' },
//         { id: 'dob', key: 'dob' },
//         { id: 'fname', key: 'fname' },
//         { id: 'mname', key: 'mname' },
//         { id: 'caste', key: 'caste' },
//         { id: 'parentEmail', key: 'parentEmail' },
//         { id: 'pNumber', key: 'pNumber' },
//         { id: 'nationality', key: 'nationality' },
//         { id: 'religion', key: 'religion' },
//         { id: 'govtid', key: 'govtid' },
//         { id: 'idnum', key: 'idnum' },
//         { id: 'Mark', key: 'Mark' },
//         { id: 'marksheet', key: 'marksheet' },
//         { id: 'Hname', key: 'Hname' },
//         { id: 'Bname', key: 'Bname' },
//         { id: 'ifsc', key: 'ifsc' },
//         { id: 'pre-book', key: 'PreBook' },
//     ];

//     // Populate all simple input fields
//     fieldMappings.forEach(({ id, key }) => {
//         const element = document.getElementById(id);
//         if (element) {
//             element.value = data[key] || '';
//         }
//     });

//     // Handle gender (radio input)
//     if (data.gender) {
//         const genderInput = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
//         if (genderInput) genderInput.checked = true;
//     }

//     // Handle address (split into 3 fields)
//     const addressParts = (data.address || '').split(', ');
//     document.getElementById('address1').value = addressParts[0] || '';
//     document.getElementById('address2').value = addressParts[1] || '';
//     document.getElementById('address3').value = addressParts[2] || '';

//     // Handle photo preview
//     if (data.photo) {
//         const img = document.getElementById('preview');
//         img.src = data.photo;
//         img.style.display = 'block';
//     }

//     // Populate course dropdown if department exists
//     if (data.department) {
//         updateCourseDropdown(data.department);
//     }
// };


document.getElementById('photo').addEventListener('change', function () {
    const file = this.files[0];
    const errorDiv = document.getElementById('photo-error');
    errorDiv.textContent = '';
    if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            errorDiv.textContent = "Only image files (JPG, PNG, WebP) are allowed.";
            this.value = '';
            document.getElementById('preview').style.display = 'none';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            studentData.photo = reader.result;
            const img = document.getElementById('preview');
            img.src = reader.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

const updateCourseDropdown = (selectedDept) => {
    const courseSelect = document.getElementById('course');
    courseSelect.innerHTML = '<option value="">--Select--</option>';
    if (departmentCourses[selectedDept]) {
        departmentCourses[selectedDept].forEach(course => {
            const opt = document.createElement('option');
            opt.value = course;
            opt.textContent = course;
            courseSelect.appendChild(opt);
        });
    }
};

document.getElementById('department').addEventListener('change', function () {
    updateCourseDropdown(this.value);
});

const validateForm = (fields) => {
    let isValid = true;
    fields.forEach(field => {
        const element = document.getElementById(field);
        const errorDiv = document.getElementById(`${field}-error`);
        if (element && errorDiv) {
            errorDiv.textContent = '';
            if (element.value.trim() === '') {
                errorDiv.textContent = 'This field is required.';
                isValid = false;
            }
        }
    });
    return isValid;
};

async function goToForm2() {
    const requiredFields = ['Fullname', 'email', 'mobile'];
    if (!validateForm(requiredFields)) return;

    if (!studentData.photo) {
        showPopup("Please upload a photo.");
        return;
    }
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobilePattern = /^\d{10}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('email-error').textContent = "Enter a valid email address.";
        return;
    }
    if (!mobilePattern.test(mobile)) {
        document.getElementById('mobile-error').textContent = "Enter a valid 10-digit mobile number.";
        return;
    }
    
    studentData.Fullname = document.getElementById('Fullname').value.trim();
    studentData.email = email;
    studentData.mobile = mobile;
    studentData.department = document.getElementById('department').value;
    studentData.course = document.getElementById('course').value;
    
    document.getElementById('form1').classList.add('hidden');
    document.getElementById('form2').classList.remove('hidden');
}

async function goToForm3() {
    const requiredFields = ['fname', 'mname', 'caste', 'address1'];
    if (!validateForm(requiredFields)) return;

    const dob = document.getElementById('dob').value;
    const gender = document.querySelector('input[name="gender"]:checked');

    if (!dob) {
        showPopup("Please enter D.O.B", "error");
        return;
    }
    if (!gender) {
        showPopup("Please select gender", "error");
        return;
    }

    studentData.dob = dob;
    studentData.gender = gender.value;

    studentData.fname = document.getElementById('fname').value.trim();
    studentData.mname = document.getElementById('mname').value.trim();
    studentData.caste = document.getElementById('caste').value;
    studentData.parentEmail = document.getElementById('parentEmail').value.trim();
    studentData.pNumber = document.getElementById('pNumber').value.trim();
    studentData.address = [
        document.getElementById('address1').value,
        document.getElementById('address2').value,
        document.getElementById('address3').value
    ].filter(Boolean).join(', ');

    document.getElementById('form2').classList.add('hidden');
    document.getElementById('form3').classList.remove('hidden');
}

async function goToForm4() {
    const requiredFields = ['nationality', 'religion', 'govtid', 'idnum'];
    if (!validateForm(requiredFields)) return;
    studentData.nationality = document.getElementById('nationality').value.trim();
    studentData.religion = document.getElementById('religion').value;
    studentData.govtid = document.getElementById('govtid').value;
    studentData.idnum = document.getElementById('idnum').value.trim();
    studentData.Mark = document.getElementById('Mark').value;
    studentData.marksheet = document.getElementById('marksheet').value.trim();

    const dept = studentData.department;
    if (coursesFee[dept]) {
        const courseFee = coursesFee[dept];
        document.getElementById('Cselected').innerHTML = `
            <p><strong>Course:</strong> ${studentData.course}</p>
            <p><strong>Duration:</strong> ${courseFee.Duration}</p>
            <p><strong>Total Fee:</strong> ${courseFee.Fee}</p>
            <p><strong>Yearly Fee:</strong> ${courseFee.YearFee}</p>
        `;
    } else {
        document.getElementById('Cselected').innerHTML = `<p>No fee details found.</p>`;
    }
    document.getElementById('form3').classList.add('hidden');
    document.getElementById('form4').classList.remove('hidden');
}

function clearForm() {
    studentData = {}; 
    document.getElementById('form1').reset();
    document.getElementById('form2').reset();
    document.getElementById('form3').reset();
    document.getElementById('form4').reset();
    document.getElementById('preview').src = '';
    document.getElementById('preview').style.display = 'none';
}

async function showResult() {
    const requiredFields = ['Hname', 'Bname', 'ifsc', 'pre-book'];
    if (!validateForm(requiredFields)) return;

    if (!studentData.ack) {
        studentData.ack = 'ACK-' + Date.now(); //January 1, 1970, 00:00:00 UTC (the Unix Epoch).
    }
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    studentData.submissionDate = currentDateTime;
    studentData.Hname = document.getElementById('Hname').value.trim();
    studentData.Bname = document.getElementById('Bname').value;
    studentData.ifsc = document.getElementById('ifsc').value.trim();
    studentData.PreBook = document.getElementById('pre-book').value;

    await saveStudentData();

document.getElementById('finalData').innerHTML = `
    <br>
    <img src="${studentData.photo}" style="max-width:80px;border-radius:6px;" />
    <p><strong>Student Name:</strong> ${studentData.Fullname}</p>
    <p><strong>D.O.B:</strong> ${studentData.dob}</p>
    <p><strong>Gender:</strong> ${studentData.gender}</p>
    <p><strong>Email:</strong> ${studentData.email}</p>
    <p><strong>Mobile:</strong> ${studentData.mobile}</p>
    <p><strong>Department:</strong> ${studentData.department}</p>
    <p><strong>Course:</strong> ${studentData.course}</p>
    <p><strong>Nationality:</strong> ${studentData.nationality}</p>
    <p><strong>Govt. ID:</strong> ${studentData.govtid} (${studentData.idnum})</p>
    <p><strong>Account Holder:</strong> ${studentData.Hname}</p>
    <p><strong>Bank:</strong> ${studentData.Bname} — IFSC: ${studentData.ifsc}</p>
    <p><strong>Pre-Booking Fee:</strong> ${studentData.PreBook}</p>
    <p><strong>Acknowledgment ID:</strong> <span style="color:green;">${studentData.ack}</span></p>
    <p><strong>Submission Date:</strong> ${studentData.submissionDate}</p>
    <br>
`;
    document.getElementById('form4').classList.add('hidden');
    document.getElementById('final').classList.remove('hidden');

    clearForm(); 
    // Optional: Clear form data now or later after redirect
}

function closeFinal() {
    window.location.href = 'dashboard.html';
}


function backToForm1() {
    document.getElementById('form2').classList.add('hidden');
    document.getElementById('form1').classList.remove('hidden');
}
function backToForm2() {
    document.getElementById('form3').classList.add('hidden');
    document.getElementById('form2').classList.remove('hidden');
}
function backToForm3() {
    document.getElementById('form4').classList.add('hidden');
    document.getElementById('form3').classList.remove('hidden');
}

window.onload = async () => {
    try {
        db = await openDB();
        const editId = sessionStorage.getItem('editStudentId');
        if (editId) {
            await loadStudentForEdit(editId);
        } else {
            document.getElementById('form1').classList.remove('hidden');
            clearForm(); // Ensure the form is empty for a new entry
        }
    } catch (e) {
    console.error("Database initialization failed:", e?.message || e);
    showPopup("There was an issue initializing the database. Please check browser support or permissions.", "error");
}
};