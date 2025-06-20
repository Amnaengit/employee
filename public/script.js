console.log("📦 script.js loaded");

const apiURL = "http://localhost:3000/api/employees";
let editingId = null;

// ✅ تحميل الموظفين
async function loadEmployees() {
  try {
    const res = await fetch(apiURL);
    const data = await res.json();

    const tbody = document.querySelector("#empTable tbody");
    tbody.innerHTML = data
      .map(
        (e) => `
        <tr data-id="${e.emp_no}">
          <td>${e.emp_no}</td>
          <td>${e.first_name} ${e.last_name}</td>
          <td>${e.gender === "M" ? "ذكر" : "أنثى"}</td>
          <td>${new Date(e.hire_date).toLocaleDateString("ar-EG")}</td>
          <td>
            <button class="editBtn">✏️</button>
            <button class="deleteBtn">🗑️</button>
          </td>
        </tr>
      `
      )
      .join("");

    // بعد إنشاء الصفوف، اربط الأحداث
    bindButtons();
  } catch (err) {
    console.error("❌", err);
  }
}

// ✅ ربط أحداث التعديل والحذف بدون onclick
function bindButtons() {
  document.querySelectorAll("#empTable tbody tr").forEach((row) => {
    const id = row.dataset.id;

    const editBtn = row.querySelector(".editBtn");
    const deleteBtn = row.querySelector(".deleteBtn");

    if (editBtn)
      editBtn.addEventListener("click", () => editEmp(id));
    if (deleteBtn)
      deleteBtn.addEventListener("click", () => delEmp(id));
  });
}

// ✅ إرسال نموذج الإضافة / التعديل
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = Object.fromEntries(new FormData(form));

  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `${apiURL}/${editingId}` : apiURL;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "حدث خطأ!");
      return;
    }

    form.reset();
    editingId = null;
    document.getElementById("formTitle").textContent = "إضافة موظف";
    form.querySelector("button").textContent = "إضافة";
    loadEmployees();
  } catch (err) {
    console.error("❌", err);
  }
});

// ✅ تعبئة النموذج للتعديل
async function editEmp(id) {
  try {
    const res = await fetch(`${apiURL}/${id}`);
    const emp = await res.json();

    const form = document.getElementById("addForm");
    form.emp_no.value = emp.emp_no;
    form.first_name.value = emp.first_name;
    form.last_name.value = emp.last_name;
    form.gender.value = emp.gender;
    form.birth_date.value = emp.birth_date.split("T")[0];
    form.hire_date.value = emp.hire_date.split("T")[0];

    editingId = id;
    document.getElementById("formTitle").textContent = "تعديل موظف";
    form.querySelector("button").textContent = "تحديث";
  } catch (err) {
    console.error("❌", err);
  }
}

// ✅ حذف موظف مع تأكيد
async function delEmp(id) {
  if (!confirm("هل أنت متأكد أنك تريد حذف هذا الموظف؟")) return;

  try {
    const res = await fetch(`${apiURL}/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "فشل في الحذف");
      return;
    }

    loadEmployees();
  } catch (err) {
    console.error("❌", err);
  }
}

// ✅ تشغيل أولي
loadEmployees();
