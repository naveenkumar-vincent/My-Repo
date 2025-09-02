(() => {
const DB_NAME = 'StudentEnrollmentDB';
const STORE_NAME = 'students';
let db;
let allStudents = [];
let chartInstance = null;
let filteredStudents = []; 
let currentPage = 1;
const rowsPerPage = 4;

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject('Failed to open DB');
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve();
        };
    });
};

const loadAllStudents = async () => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    filteredStudents = allStudents; 

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            allStudents = request.result.filter(s => s.ack);
            renderTable(allStudents);
            // renderChart(allStudents);
            resolve();
        };
        request.onerror = () => reject('Failed to fetch data');
    });
};

const getAllStudentCounts = async () => {
    await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const allData = request.result;

            // Count per department (or course, or year)
            const departmentCounts = {};
            allData.forEach(entry => {
                const dept = entry.department || 'Unknown';
                departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
            });

            resolve(departmentCounts);
        };
        request.onerror = () => reject(request.error);
    });
};

const renderPieChart = async () => {
    const counts = await getAllStudentCounts();

    const ctx = document.getElementById('studentPieChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }
    new Chart(ctx, {
        type: 'pie', //doughnut, bar, line, radar
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#607D8B'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Student Count by Department'
                }
            }
        }
        
    });
    document.getElementById('totalCount').textContent = `Total Students: ${Object.values(counts).reduce((a, b) => a + b, 0)}`
};


const editStudent = (ackId) => {
    // Store the ACK ID in session storage to be used on the form page
    sessionStorage.setItem('editStudentId', ackId);
    window.location.href = 'index.html';
};

const deleteStudent = async (ackId) => {
    if (confirm(`Are you sure you want to delete student with ACK ID: ${ackId}?`)) {
        try {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            await store.delete(ackId);
            await tx.complete;
            console.log(`Student with ACK ID ${ackId} deleted.`);
            await loadAllStudents(); // Reload the dashboard after deletion
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
};

const renderTable = (data) => {

    filteredStudents = data; 

    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No records found</td></tr>`;
        return;
    }

    paginatedData.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${student.photo || ''}" style="max-width:50px; border-radius:5px;"></td>
            <td>${student.Fullname || '-'}</td>
            <td>${student.email || '-'}</td>
            <td>${student.mobile || '-'}</td>
            <td>${student.department || '-'}</td>
            <td>${student.course || '-'}</td>
            <td>${student.ack || '-'}</td>
            <td>
                <button onclick="editStudent('${student.ack}')">Edit</button>
                <button onclick="deleteStudent('${student.ack}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderPaginationControls(data.length);
};

document.getElementById('searchBox').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allStudents.filter(student =>
        (student.Fullname && student.Fullname.toLowerCase().includes(searchTerm)) ||
        (student.email && student.email.toLowerCase().includes(searchTerm)) ||
        (student.mobile && student.mobile.includes(searchTerm))
    );
    currentPage = 1;
    renderTable(filtered);
});

document.getElementById('filterDept').addEventListener('change', (e) => {
    const dept = e.target.value;
    const filtered = dept === '' ? allStudents : allStudents.filter(student => student.department === dept);
    currentPage = 1;
    renderTable(filtered);
});


const renderPaginationControls = (totalRows) => {
    const paginationDiv = document.getElementById('paginationControls');
    if (!paginationDiv) return;

    const totalPages = Math.ceil(totalRows / rowsPerPage);
    paginationDiv.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} id="prevPage" class="pagination-btn">Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage === totalPages ? 'disabled' : ''} id="nextPage" class="pagination-btn">Next</button>
    `;

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(filteredStudents);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(filteredStudents);
        }
    });
};


// document.getElementById('exportToJSON').addEventListener('click', () => {
//     const jsonStr = JSON.stringify(allStudents, null, 2);
//     const blob = new Blob([jsonStr], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'student_data.json';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
// });

document.getElementById('exportToExcel').addEventListener('click', () => {
    let csv = "Fullname,Email,Mobile,Department,Course,fname,mname,caste,Ack ID\n";
    allStudents.forEach(student => {
        csv += `"${student.Fullname || ''}","${student.email || ''}","${student.mobile || ''}","${student.department || ''}","${student.course || ''}","${student.fname || ''}","${student.mname || ''}","${student.caste || ''}","${student.ack || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Initialize the dashboard
window.onload = async () => {
    try {
        await openDB();
        await loadAllStudents();
        await renderPieChart(); 
    } catch (e) {
        console.error("Dashboard initialization failed:", e);
    }
};


window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

})();