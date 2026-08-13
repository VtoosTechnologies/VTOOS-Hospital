/* =========================================================
   VTOOS SMART HOSPITAL
   DEMO APPLICATION
========================================================= */


/* =========================================================
   STORAGE HELPERS
========================================================= */

const STORAGE_KEYS = {

    patients: "vtoos_patients",
    tokens: "vtoos_tokens",
    followups: "vtoos_followups",
    documents: "vtoos_documents",
    prescriptions: "vtoos_prescriptions",
    notifications: "vtoos_notifications",
    doctorStatus: "vtoos_doctor_status"

};


function getData(key, fallback = []) {

    try {

        const value =
            localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : fallback;

    } catch (error) {

        return fallback;

    }

}


function setData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}


/* =========================================================
   INITIAL DATA
========================================================= */

function initializeDemoData() {

    if (!localStorage.getItem(STORAGE_KEYS.patients)) {

        const patients = [

            {
                id: "VTOOS-P-000001",
                name: "Kumar",
                mobile: "9876543210",
                age: 42,
                gender: "Male",
                address: "Chennai",
                createdAt: new Date().toISOString()
            },

            {
                id: "VTOOS-P-000002",
                name: "Priya",
                mobile: "9876543211",
                age: 32,
                gender: "Female",
                address: "Chennai",
                createdAt: new Date().toISOString()
            }

        ];

        setData(
            STORAGE_KEYS.patients,
            patients
        );

    }


    if (!localStorage.getItem(STORAGE_KEYS.tokens)) {

        setData(
            STORAGE_KEYS.tokens,
            []
        );

    }


    if (!localStorage.getItem(STORAGE_KEYS.followups)) {

        setData(
            STORAGE_KEYS.followups,
            [

                {
                    id: "FU-001",
                    patientId: "VTOOS-P-000001",
                    patientName: "Kumar",
                    date: getDateAfterDays(2),
                    status: "Pending",
                    requiredDocument: "Blood Test Report"
                }

            ]
        );

    }


    if (!localStorage.getItem(STORAGE_KEYS.documents)) {

        setData(
            STORAGE_KEYS.documents,
            []
        );

    }


    if (!localStorage.getItem(STORAGE_KEYS.prescriptions)) {

        setData(
            STORAGE_KEYS.prescriptions,
            [

                {
                    id: "RX-000001",
                    patientId: "VTOOS-P-000001",
                    patientName: "Kumar",
                    doctor: "Dr. Kumar",
                    date: todayString(),
                    medicines: [

                        {
                            name: "Paracetamol 500 mg",
                            dosage: "1 - 0 - 1",
                            instruction: "After food",
                            days: 3
                        },

                        {
                            name: "Cetirizine 10 mg",
                            dosage: "0 - 0 - 1",
                            instruction: "After food",
                            days: 5
                        }

                    ],

                    note: "Take adequate rest."

                }

            ]
        );

    }


    if (!localStorage.getItem(STORAGE_KEYS.notifications)) {

        setData(
            STORAGE_KEYS.notifications,
            []
        );

    }


    if (!localStorage.getItem(STORAGE_KEYS.doctorStatus)) {

        setData(
            STORAGE_KEYS.doctorStatus,
            {

                doctor1: true,
                doctor2: false

            }
        );

    }

}


/* =========================================================
   GLOBAL USER
========================================================= */

let currentRole = null;

let currentPatient = null;

let currentDoctor = "doctor1";

let currentConsultationToken = null;


/* =========================================================
   LOGIN
========================================================= */

function loginAs(role) {

    currentRole = role;

    if (role === "patient") {

        const patients =
            getData(
                STORAGE_KEYS.patients
            );

        currentPatient =
            patients[0];

    }

    document
        .getElementById("loginScreen")
        .classList.remove("active");

    document
        .getElementById("appScreen")
        .classList.add("active");


    const userName =
        document.getElementById(
            "currentUserName"
        );


    if (role === "patient") {

        userName.textContent =
            currentPatient.name;

        document
            .getElementById(
                "dashboardTitle"
            )
            .textContent =
            "Hello, " +
            currentPatient.name;

    }

    else if (role === "doctor") {

        userName.textContent =
            "Dr. Kumar";

        document
            .getElementById(
                "dashboardTitle"
            )
            .textContent =
            "Doctor Dashboard";

    }

    else {

        userName.textContent =
            "Reception";

        document
            .getElementById(
                "dashboardTitle"
            )
            .textContent =
            "Reception Dashboard";

    }


    setupRoleDashboard();

    refreshAll();

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentRole = null;

    currentPatient = null;

    currentConsultationToken = null;

    document
        .getElementById("appScreen")
        .classList.remove("active");

    document
        .getElementById("loginScreen")
        .classList.add("active");

}


/* =========================================================
   ROLE DASHBOARD
========================================================= */

function setupRoleDashboard() {

    document
        .getElementById("patientDashboard")
        .classList.add("hidden");

    document
        .getElementById("doctorDashboard")
        .classList.add("hidden");

    document
        .getElementById("staffDashboard")
        .classList.add("hidden");


    if (currentRole === "patient") {

        document
            .getElementById("patientDashboard")
            .classList.remove("hidden");

    }

    if (currentRole === "doctor") {

        document
            .getElementById("doctorDashboard")
            .classList.remove("hidden");

    }

    if (currentRole === "staff") {

        document
            .getElementById("staffDashboard")
            .classList.remove("hidden");

    }

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            p => p.classList.remove(
                "active-page"
            )
        );


    const target =
        document.getElementById(
            page + "Page"
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(
            btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.page === page
                );

            }
        );


    refreshAll();

}


/* =========================================================
   TOKEN HELPERS
========================================================= */

function todayString() {

    const now = new Date();

    return now
        .toISOString()
        .split("T")[0];

}


function getDateAfterDays(days) {

    const date =
        new Date();

    date.setDate(
        date.getDate() + days
    );

    return date
        .toISOString()
        .split("T")[0];

}


function getNextTokenNumber(doctorId) {

    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const todayTokens =
        tokens.filter(
            token =>
                token.date === todayString() &&
                token.doctorId === doctorId
        );


    if (!todayTokens.length) {

        return 1;

    }


    return Math.max(
        ...todayTokens.map(
            token =>
                Number(token.number)
        )
    ) + 1;

}


/* =========================================================
   REASON
========================================================= */

function selectReason(button, reason) {

    document
        .querySelectorAll(".reason-btn")
        .forEach(
            btn =>
                btn.classList.remove(
                    "selected"
                )
        );


    button.classList.add(
        "selected"
    );


    document
        .getElementById(
            "selectedReason"
        )
        .value = reason;

}


/* =========================================================
   PATIENT TOKEN
========================================================= */

function generatePatientToken() {

    if (!currentPatient) {

        showToast(
            "Patient profile not found."
        );

        return;

    }


    const reason =
        document
            .getElementById(
                "selectedReason"
            )
            .value;


    if (!reason) {

        showToast(
            "Please select reason."
        );

        return;

    }


    const doctorId =
        document
            .getElementById(
                "patientDoctor"
            )
            .value;


    const token =
        createToken(
            currentPatient,
            doctorId,
            reason,
            "Patient"
        );


    showToast(
        "Token " +
        formatToken(token.number) +
        " generated."
    );


    refreshAll();

}


/* =========================================================
   CREATE TOKEN
========================================================= */

function createToken(
    patient,
    doctorId,
    reason,
    source
) {

    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const number =
        getNextTokenNumber(
            doctorId
        );


    const token = {

        id:
            "TOKEN-" +
            Date.now(),

        number,

        patientId:
            patient.id,

        patientName:
            patient.name,

        patientMobile:
            patient.mobile,

        doctorId,

        doctorName:
            doctorId === "doctor1"
                ? "Dr. Kumar"
                : "Dr. Priya",

        reason,

        date:
            todayString(),

        status:
            "Waiting",

        priority:
            false,

        source,

        createdAt:
            new Date().toISOString(),

        completedAt:
            null

    };


    tokens.push(token);

    setData(
        STORAGE_KEYS.tokens,
        tokens
    );


    addNotification(

        patient.id,

        "Token Generated",

        "Your token is " +
        formatToken(number)

    );


    return token;

}


/* =========================================================
   STAFF PATIENT FIND
========================================================= */

function findStaffPatient() {

    const mobile =
        document
            .getElementById(
                "staffMobile"
            )
            .value.trim();


    const patients =
        getData(
            STORAGE_KEYS.patients
        );


    const patient =
        patients.find(
            p =>
                p.mobile === mobile
        );


    const found =
        document
            .getElementById(
                "staffPatientFound"
            );


    const newPatient =
        document
            .getElementById(
                "staffNewPatient"
            );


    if (patient) {

        found.classList.remove(
            "hidden"
        );

        newPatient.classList.add(
            "hidden"
        );


        document
            .getElementById(
                "staffFoundName"
            )
            .textContent =
            patient.name;


        document
            .getElementById(
                "staffFoundId"
            )
            .textContent =
            patient.id;

    }

    else {

        found.classList.add(
            "hidden"
        );

        newPatient.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   STAFF CREATE TOKEN
========================================================= */

function createStaffToken() {

    const mobile =
        document
            .getElementById(
                "staffMobile"
            )
            .value.trim();


    if (!mobile) {

        showToast(
            "Enter mobile number."
        );

        return;

    }


    let patients =
        getData(
            STORAGE_KEYS.patients
        );


    let patient =
        patients.find(
            p =>
                p.mobile === mobile
        );


    if (!patient) {

        const name =
            document
                .getElementById(
                    "staffPatientName"
                )
                .value.trim();


        const age =
            document
                .getElementById(
                    "staffPatientAge"
                )
                .value;


        const gender =
            document
                .getElementById(
                    "staffPatientGender"
                )
                .value;


        if (!name) {

            showToast(
                "Enter patient name."
            );

            return;

        }


        patient = {

            id:
                generatePatientId(
                    patients
                ),

            name,

            mobile,

            age,

            gender,

            address: "",

            createdAt:
                new Date().toISOString()

        };


        patients.push(
            patient
        );


        setData(
            STORAGE_KEYS.patients,
            patients
        );

    }


    const doctorId =
        document
            .getElementById(
                "staffDoctor"
            )
            .value;


    const reason =
        document
            .getElementById(
                "staffReason"
            )
            .value;


    const token =
        createToken(
            patient,
            doctorId,
            reason,
            "Staff"
        );


    showToast(
        "Token " +
        formatToken(token.number) +
        " created successfully."
    );


    document
        .getElementById(
            "staffMobile"
        )
        .value = "";


    refreshAll();

}


/* =========================================================
   PATIENT ID
========================================================= */

function generatePatientId(
    patients
) {

    const number =
        patients.length + 1;

    return (
        "VTOOS-P-" +
        String(number)
            .padStart(6, "0")
    );

}


/* =========================================================
   DOCTOR AVAILABILITY
========================================================= */

function toggleDoctorAvailability() {

    const status =
        getData(
            STORAGE_KEYS.doctorStatus,
            {}
        );


    status.doctor1 =
        !status.doctor1;


    setData(
        STORAGE_KEYS.doctorStatus,
        status
    );


    if (status.doctor1) {

        showToast(
            "You are now Available."
        );


        notifyWaitingPatients();

    }

    else {

        showToast(
            "Doctor marked unavailable."
        );

    }


    refreshAll();

}


/* =========================================================
   NOTIFY WAITING PATIENTS
========================================================= */

function notifyWaitingPatients() {

    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const waiting =
        tokens.filter(
            token =>
                token.doctorId === "doctor1" &&
                token.date === todayString() &&
                token.status === "Waiting"
        );


    waiting.forEach(
        token => {

            addNotification(

                token.patientId,

                "Doctor Available",

                "Dr. Kumar is now available."

            );

        }
    );

}


/* =========================================================
   DOCTOR QUEUE
========================================================= */

function getDoctorQueue() {

    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    return tokens
        .filter(
            token =>
                token.date === todayString() &&
                token.doctorId === currentDoctor &&
                (
                    token.status === "Waiting" ||
                    token.status === "Skipped"
                )
        )
        .sort(
            (a,b) => {

                if (
                    a.priority &&
                    !b.priority
                ) return -1;

                if (
                    !a.priority &&
                    b.priority
                ) return 1;

                return (
                    Number(a.number) -
                    Number(b.number)
                );

            }
        );

}


/* =========================================================
   SELECT PATIENT
========================================================= */

function selectPatientToken(
    tokenId
) {

    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const token =
        tokens.find(
            t =>
                t.id === tokenId
        );


    if (!token) {

        return;

    }


    currentConsultationToken =
        token.id;


    document
        .getElementById(
            "doctorPatientDetails"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "doctorCurrentToken"
        )
        .textContent =
        "Token " +
        formatToken(token.number);


    document
        .getElementById(
            "doctorCurrentPatient"
        )
        .textContent =
        token.patientName;


    document
        .getElementById(
            "consultPatientName"
        )
        .textContent =
        token.patientName;


    const patients =
        getData(
            STORAGE_KEYS.patients
        );


    const patient =
        patients.find(
            p =>
                p.id === token.patientId
        );


    if (patient) {

        document
            .getElementById(
                "consultPatientInfo"
            )
            .textContent =

            patient.age +
            " years • " +
            patient.gender +
            " • " +
            patient.mobile;

    }


    document
        .getElementById(
            "consultReason"
        )
        .textContent =
        token.reason;


    const docs =
        getData(
            STORAGE_KEYS.documents
        )
        .filter(
            d =>
                d.patientId ===
                token.patientId
        );


    const prescriptions =
        getData(
            STORAGE_KEYS.prescriptions
        )
        .filter(
            p =>
                p.patientId ===
                token.patientId
        );


    const visits =
        getData(
            STORAGE_KEYS.tokens
        )
        .filter(
            t =>
                t.patientId ===
                token.patientId &&
                t.status === "Completed"
        );


    document
        .getElementById(
            "consultDocuments"
        )
        .textContent =
        docs.length;


    document
        .getElementById(
            "consultPrescriptions"
        )
        .textContent =
        prescriptions.length;


    document
        .getElementById(
            "consultVisits"
        )
        .textContent =
        visits.length;

}


/* =========================================================
   COMPLETE CONSULTATION
========================================================= */

function completeConsultation() {

    if (!currentConsultationToken) {

        showToast(
            "Select a patient first."
        );

        return;

    }


    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const token =
        tokens.find(
            t =>
                t.id ===
                currentConsultationToken
        );


    if (!token) {

        return;

    }


    token.status =
        "Completed";


    token.completedAt =
        new Date().toISOString();


    setData(
        STORAGE_KEYS.tokens,
        tokens
    );


    addNotification(

        token.patientId,

        "Consultation Completed",

        "Your consultation with " +
        token.doctorName +
        " is completed."

    );


    showFollowupModal(
        token
    );


    currentConsultationToken =
        null;


    document
        .getElementById(
            "doctorPatientDetails"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "doctorCurrentToken"
        )
        .textContent =
        "Next Patient";


    document
        .getElementById(
            "doctorCurrentPatient"
        )
        .textContent =
        "Select next patient";


    refreshAll();

}


/* =========================================================
   FOLLOWUP MODAL
========================================================= */

function showFollowupModal(
    token
) {

    openModal(`

        <div class="eyebrow">
            CONSULTATION COMPLETED
        </div>

        <h2 style="margin:10px 0;">
            Follow-up
        </h2>

        <p class="muted">
            ${escapeHtml(token.patientName)}
        </p>

        <div style="margin-top:20px;">

            <div class="form-group">

                <label>
                    Follow-up
                </label>

                <select id="followupDays">

                    <option value="0">
                        No Follow-up
                    </option>

                    <option value="3">
                        3 Days
                    </option>

                    <option value="7">
                        7 Days
                    </option>

                    <option value="15">
                        15 Days
                    </option>

                    <option value="30">
                        30 Days
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Required Document
                </label>

                <select id="followupDocument">

                    <option value="">
                        None
                    </option>

                    <option>
                        Blood Test Report
                    </option>

                    <option>
                        Scan Report
                    </option>

                    <option>
                        Prescription Review
                    </option>

                </select>

            </div>


            <button
                class="primary-btn full"
                onclick="saveFollowup('${token.id}')">

                Save Follow-up

            </button>

        </div>

    `);

}


/* =========================================================
   SAVE FOLLOWUP
========================================================= */

function saveFollowup(
    tokenId
) {

    const days =
        Number(
            document
                .getElementById(
                    "followupDays"
                )
                .value
        );


    const documentRequired =
        document
            .getElementById(
                "followupDocument"
            )
            .value;


    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const token =
        tokens.find(
            t =>
                t.id === tokenId
        );


    if (!token) {

        closeModal();

        return;

    }


    if (days > 0) {

        const followups =
            getData(
                STORAGE_KEYS.followups
            );


        const followup = {

            id:
                "FU-" +
                Date.now(),

            patientId:
                token.patientId,

            patientName:
                token.patientName,

            doctorId:
                token.doctorId,

            doctorName:
                token.doctorName,

            date:
                getDateAfterDays(days),

            status:
                "Pending",

            requiredDocument:
                documentRequired

        };


        followups.push(
            followup
        );


        setData(
            STORAGE_KEYS.followups,
            followups
        );


        addNotification(

            token.patientId,

            "Follow-up Scheduled",

            "Your follow-up is scheduled for " +
            formatDate(followup.date)

        );

    }


    closeModal();

    showToast(
        "Consultation saved."
    );

    refreshAll();

}


/* =========================================================
   FOLLOWUP RENDER
========================================================= */

function renderFollowups() {

    const container =
        document
            .getElementById(
                "followupList"
            );


    const followups =
        getData(
            STORAGE_KEYS.followups
        );


    let filtered =
        followups;


    if (currentRole === "patient" &&
        currentPatient) {

        filtered =
            followups.filter(
                f =>
                    f.patientId ===
                    currentPatient.id
            );

    }


    if (!filtered.length) {

        container.innerHTML = `

            <div class="panel">

                <h3>
                    No follow-ups
                </h3>

                <p class="muted">
                    Nothing pending.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                followup => {

                    const due =
                        followup.date <=
                        todayString();


                    return `

                    <div class="
                        followup-card
                        ${
                            due
                            ? "due"
                            : "upcoming"
                        }
                    ">

                        <h3>
                            ${escapeHtml(
                                followup.patientName
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                followup.doctorName ||
                                "Doctor"
                            )}
                        </p>

                        <div class="followup-date">

                            ${formatDate(
                                followup.date
                            )}

                        </div>

                        ${
                            followup.requiredDocument
                            ?

                            `<p style="
                                margin-top:10px;
                                color:#28d7ff;
                            ">
                                📄 Required:
                                ${escapeHtml(
                                    followup.requiredDocument
                                )}
                            </p>`

                            : ""
                        }

                    </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   PATIENTS
========================================================= */

function renderPatients() {

    const container =
        document
            .getElementById(
                "patientsList"
            );


    const search =
        (
            document
                .getElementById(
                    "patientSearch"
                )
                ?.value || ""
        )
        .toLowerCase();


    const patients =
        getData(
            STORAGE_KEYS.patients
        );


    const filtered =
        patients.filter(
            patient =>

                patient.name
                    .toLowerCase()
                    .includes(search)

                ||

                patient.mobile
                    .includes(search)

        );


    container.innerHTML =
        filtered
            .map(
                patient => `

                <div class="patient-row">

                    <div>

                        <strong>
                            ${escapeHtml(
                                patient.name
                            )}
                        </strong>

                        <small>
                            ${patient.id}
                            •
                            ${patient.mobile}
                        </small>

                    </div>

                    <button
                        class="secondary-btn"
                        onclick="viewPatient(
                            '${patient.id}'
                        )">

                        View

                    </button>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   PATIENT VIEW
========================================================= */

function viewPatient(
    patientId
) {

    const patients =
        getData(
            STORAGE_KEYS.patients
        );


    const patient =
        patients.find(
            p =>
                p.id === patientId
        );


    if (!patient) {

        return;

    }


    const tokens =
        getData(
            STORAGE_KEYS.tokens
        )
        .filter(
            t =>
                t.patientId === patientId
        );


    const documents =
        getData(
            STORAGE_KEYS.documents
        )
        .filter(
            d =>
                d.patientId === patientId
        );


    const prescriptions =
        getData(
            STORAGE_KEYS.prescriptions
        )
        .filter(
            p =>
                p.patientId === patientId
        );


    openModal(`

        <div class="eyebrow">
            PATIENT PROFILE
        </div>

        <h2 style="margin-top:8px;">
            ${escapeHtml(
                patient.name
            )}
        </h2>

        <p class="muted">
            ${patient.id}
        </p>

        <div class="history-grid"
             style="margin-top:20px;">

            <div>
                <span>Age</span>
                <strong>
                    ${patient.age}
                </strong>
            </div>

            <div>
                <span>Visits</span>
                <strong>
                    ${tokens.length}
                </strong>
            </div>

            <div>
                <span>Documents</span>
                <strong>
                    ${documents.length}
                </strong>
            </div>

        </div>

        <h3 style="margin-top:20px;">
            Patient Information
        </h3>

        <p class="muted"
           style="margin-top:10px;">

            Mobile:
            ${patient.mobile}

            <br>

            Gender:
            ${patient.gender}

            <br>

            Address:
            ${patient.address || "Not provided"}

        </p>

        <button
            class="primary-btn full"
            style="margin-top:20px;"
            onclick="closeModal()">

            Close

        </button>

    `);

}


/* =========================================================
   DOCUMENT UPLOAD
========================================================= */

function handleDocumentUpload(
    event
) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    if (!currentPatient) {

        showToast(
            "Login as patient for demo upload."
        );

        event.target.value = "";

        return;

    }


    const maxSize =
        2 * 1024 * 1024;


    if (file.size > maxSize) {

        showToast(
            "Demo limit: 2 MB."
        );

        event.target.value = "";

        return;

    }


    const documents =
        getData(
            STORAGE_KEYS.documents
        );


    const documentRecord = {

        id:
            "DOC-" +
            Date.now(),

        patientId:
            currentPatient.id,

        patientName:
            currentPatient.name,

        fileName:
            file.name,

        fileType:
            file.type,

        size:
            file.size,

        date:
            todayString(),

        type:
            detectDocumentType(
                file.name
            )

    };


    documents.push(
        documentRecord
    );


    setData(
        STORAGE_KEYS.documents,
        documents
    );


    addNotification(

        currentPatient.id,

        "Document Uploaded",

        file.name +
        " added to your records."

    );


    event.target.value = "";


    showToast(
        "Document added."
    );


    refreshAll();

}


/* =========================================================
   DOCUMENT TYPE
========================================================= */

function detectDocumentType(
    fileName
) {

    const name =
        fileName.toLowerCase();


    if (
        name.includes("blood") ||
        name.includes("lab")
    ) {

        return "Lab Report";

    }


    if (
        name.includes("scan") ||
        name.includes("xray") ||
        name.includes("x-ray")
    ) {

        return "Scan Report";

    }


    if (
        name.includes("prescription")
    ) {

        return "Prescription";

    }


    return "Medical Document";

}


/* =========================================================
   RENDER DOCUMENTS
========================================================= */

function renderDocuments() {

    const container =
        document
            .getElementById(
                "documentsList"
            );


    let documents =
        getData(
            STORAGE_KEYS.documents
        );


    if (
        currentRole === "patient" &&
        currentPatient
    ) {

        documents =
            documents.filter(
                d =>
                    d.patientId ===
                    currentPatient.id
            );

    }


    if (!documents.length) {

        container.innerHTML = `

            <div class="panel">

                <h3>
                    No documents
                </h3>

                <p class="muted">
                    Documents will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        documents
            .map(
                document => `

                <div class="document-row">

                    <div class="document-info">

                        <div class="document-icon">
                            📄
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    document.fileName
                                )}
                            </strong>

                            <small class="muted">

                                ${
                                    escapeHtml(
                                        document.type
                                    )
                                }

                                •

                                ${
                                    formatDate(
                                        document.date
                                    )
                                }

                            </small>

                        </div>

                    </div>

                    <span class="status-pill">
                        Saved
                    </span>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   PRESCRIPTIONS
========================================================= */

function renderPrescriptions() {

    const container =
        document
            .getElementById(
                "prescriptionList"
            );


    let prescriptions =
        getData(
            STORAGE_KEYS.prescriptions
        );


    if (
        currentRole === "patient" &&
        currentPatient
    ) {

        prescriptions =
            prescriptions.filter(
                p =>
                    p.patientId ===
                    currentPatient.id
            );

    }


    if (!prescriptions.length) {

        container.innerHTML = `

            <div class="panel">

                <h3>
                    No prescriptions
                </h3>

            </div>

        `;

        return;

    }


    container.innerHTML =
        prescriptions
            .map(
                prescription => `

                <div class="prescription-card">

                    <div class="eyebrow">
                        PRESCRIPTION
                    </div>

                    <h3 style="margin-top:7px;">
                        ${escapeHtml(
                            prescription.doctor
                        )}
                    </h3>

                    <div class="date">
                        ${formatDate(
                            prescription.date
                        )}
                    </div>

                    <div style="margin-top:15px;">

                        ${
                            prescription.medicines
                                .map(
                                    medicine => `

                                    <div class="medicine">

                                        <strong>
                                            ${escapeHtml(
                                                medicine.name
                                            )}
                                        </strong>

                                        <span>
                                            ${escapeHtml(
                                                medicine.dosage
                                            )}

                                            •
                                            
                                            ${escapeHtml(
                                                medicine.instruction
                                            )}

                                            •
                                            
                                            ${medicine.days}
                                            Days
                                        </span>

                                    </div>

                                `
                                )
                                .join("")
                        }

                    </div>

                    <p class="muted"
                       style="margin-top:15px;">

                        ${
                            escapeHtml(
                                prescription.note || ""
                            )
                        }

                    </p>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   TOKEN RENDER
========================================================= */

function renderTokens() {

    const container =
        document
            .getElementById(
                "allTokensList"
            );


    let tokens =
        getData(
            STORAGE_KEYS.tokens
        )
        .filter(
            token =>
                token.date ===
                todayString()
        );


    if (
        currentRole === "patient" &&
        currentPatient
    ) {

        tokens =
            tokens.filter(
                token =>
                    token.patientId ===
                    currentPatient.id
            );

    }


    tokens.sort(
        (a,b) =>
            Number(a.number) -
            Number(b.number)
    );


    container.innerHTML =
        tokens
            .map(
                token => `

                <div class="token-table-row">

                    <div class="token-number">
                        ${formatToken(
                            token.number
                        )}
                    </div>

                    <div>
                        <strong>
                            ${escapeHtml(
                                token.patientName
                            )}
                        </strong>

                        <small class="muted">
                            ${escapeHtml(
                                token.doctorName
                            )}
                        </small>

                    </div>

                    <div>
                        ${escapeHtml(
                            token.reason
                        )}
                    </div>

                    <div>
                        ${token.status}
                    </div>

                    <div>

                        ${
                            currentRole === "doctor"

                            ?

                            `<button
                                class="secondary-btn"
                                onclick="selectPatientToken(
                                    '${token.id}'
                                )">

                                Open

                            </button>`

                            :

                            ""

                        }

                    </div>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   DOCTOR QUEUE RENDER
========================================================= */

function renderDoctorQueue() {

    const container =
        document
            .getElementById(
                "doctorQueue"
            );


    const queue =
        getDoctorQueue();


    document
        .getElementById(
            "doctorQueueCount"
        )
        .textContent =
        queue.length;


    if (!queue.length) {

        container.innerHTML = `

            <div style="
                padding:20px;
                text-align:center;
                color:#8da1b7;
            ">

                No waiting patients.

            </div>

        `;

        return;

    }


    container.innerHTML =
        queue
            .map(
                token => `

                <div class="queue-item">

                    <div class="queue-token">

                        ${formatToken(
                            token.number
                        )}

                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(
                                token.patientName
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                token.reason
                            )}

                            ${
                                token.priority
                                ? " • ⭐ Priority"
                                : ""
                            }

                        </small>

                    </div>

                    <button
                        class="secondary-btn"
                        onclick="selectPatientToken(
                            '${token.id}'
                        )">

                        Select

                    </button>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   PATIENT TOKEN STATUS
========================================================= */

function renderPatientToken() {

    if (!currentPatient) {

        return;

    }


    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const activeToken =
        tokens
            .filter(
                token =>
                    token.patientId ===
                    currentPatient.id &&

                    token.date ===
                    todayString() &&

                    (
                        token.status ===
                        "Waiting"

                        ||

                        token.status ===
                        "Skipped"

                        ||

                        token.status ===
                        "Completed"
                    )
            )
            .sort(
                (a,b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )[0];


    if (!activeToken) {

        document
            .getElementById(
                "patientTokenNumber"
            )
            .textContent =
            "--";

        document
            .getElementById(
                "patientTokenStatus"
            )
            .textContent =
            "No active token";

        return;

    }


    document
        .getElementById(
            "patientTokenNumber"
        )
        .textContent =
        formatToken(
            activeToken.number
        );


    document
        .getElementById(
            "patientTokenStatus"
        )
        .textContent =
        activeToken.status;


    const doctorTokens =
        tokens
            .filter(
                token =>
                    token.date ===
                    todayString() &&

                    token.doctorId ===
                    activeToken.doctorId
            );


    const current =
        getCurrentDoctorToken(
            activeToken.doctorId
        );


    const ahead =
        doctorTokens.filter(
            token =>
                token.status === "Waiting" &&

                Number(token.number) <
                Number(activeToken.number)
        ).length;


    document
        .getElementById(
            "patientCurrentToken"
        )
        .textContent =
        current
        ? formatToken(current.number)
        : "--";


    document
        .getElementById(
            "patientAhead"
        )
        .textContent =
        ahead;


    const average =
        8;


    document
        .getElementById(
            "patientWaitTime"
        )
        .textContent =
        "~ " +
        Math.max(
            0,
            ahead * average
        ) +
        " mins";


    if (
        ahead <= 2 &&
        activeToken.status === "Waiting"
    ) {

        addNotificationOnce(

            activeToken.patientId,

            "Token Approaching",

            "Your token is approaching. Please be ready."

        );

    }

}


/* =========================================================
   CURRENT DOCTOR TOKEN
========================================================= */

function getCurrentDoctorToken(
    doctorId
) {

    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const completed =
        tokens
            .filter(
                token =>
                    token.date ===
                    todayString() &&

                    token.doctorId ===
                    doctorId &&

                    token.status ===
                    "Completed"
            );


    const waiting =
        tokens
            .filter(
                token =>
                    token.date ===
                    todayString() &&

                    token.doctorId ===
                    doctorId &&

                    token.status ===
                    "Waiting"
            )
            .sort(
                (a,b) =>
                    Number(a.number) -
                    Number(b.number)
            );


    if (!waiting.length) {

        return null;

    }


    return waiting[0];

}


/* =========================================================
   DOCTOR STATUS
========================================================= */

function renderDoctorStatus() {

    const status =
        getData(
            STORAGE_KEYS.doctorStatus,
            {}
        );


    const dashboard =
        document
            .getElementById(
                "doctorStatusBox"
            );


    if (!dashboard) {

        return;

    }


    dashboard.innerHTML = `

        <span class="${
            status.doctor1
            ? "online"
            : "offline"
        }">

            ${
                status.doctor1
                ? "● Available"
                : "● Not Available"
            }

        </span>

    `;


    const button =
        document
            .getElementById(
                "doctorAvailableBtn"
            );


    if (button) {

        button.textContent =
            status.doctor1
            ? "🟢 Available"
            : "🔴 Mark Available";

    }


    const staff =
        document
            .getElementById(
                "staffDoctorStatus"
            );


    if (staff) {

        staff.innerHTML = `

            <div class="doctor-status-row">

                <div>

                    <strong>
                        Dr. Kumar
                    </strong>

                    <small>
                        General Medicine
                    </small>

                </div>

                <span class="${
                    status.doctor1
                    ? "online"
                    : "offline"
                }">

                    ${
                        status.doctor1
                        ? "● Available"
                        : "● Offline"
                    }

                </span>

            </div>


            <div class="doctor-status-row">

                <div>

                    <strong>
                        Dr. Priya
                    </strong>

                    <small>
                        Pediatrics
                    </small>

                </div>

                <span class="${
                    status.doctor2
                    ? "online"
                    : "offline"
                }">

                    ${
                        status.doctor2
                        ? "● Available"
                        : "● Offline"
                    }

                </span>

            </div>

        `;

    }

}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

    const patients =
        getData(
            STORAGE_KEYS.patients
        );


    const tokens =
        getData(
            STORAGE_KEYS.tokens
        )
        .filter(
            token =>
                token.date ===
                todayString()
        );


    const completed =
        tokens.filter(
            token =>
                token.status ===
                "Completed"
        );


    const followups =
        getData(
            STORAGE_KEYS.followups
        )
        .filter(
            f =>
                f.status ===
                "Pending"
        );


    document
        .getElementById(
            "statPatients"
        )
        .textContent =
        patients.length;


    document
        .getElementById(
            "statTokens"
        )
        .textContent =
        tokens.length;


    document
        .getElementById(
            "statCompleted"
        )
        .textContent =
        completed.length;


    document
        .getElementById(
            "statFollowups"
        )
        .textContent =
        followups.length;


    if (currentPatient) {

        const pFollowups =
            followups.filter(
                f =>
                    f.patientId ===
                    currentPatient.id
            );


        const pDocs =
            getData(
                STORAGE_KEYS.documents
            )
            .filter(
                d =>
                    d.patientId ===
                    currentPatient.id
            );


        document
            .getElementById(
                "patientFollowupCount"
            )
            .textContent =
            pFollowups.length +
            " pending";


        document
            .getElementById(
                "patientDocumentCount"
            )
            .textContent =
            pDocs.length +
            " documents";

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function addNotification(
    patientId,
    title,
    message
) {

    const notifications =
        getData(
            STORAGE_KEYS.notifications
        );


    notifications.push({

        id:
            "N-" +
            Date.now() +
            Math.random(),

        patientId,

        title,

        message,

        date:
            new Date().toISOString(),

        read:
            false

    });


    setData(
        STORAGE_KEYS.notifications,
        notifications
    );


    renderNotificationBadge();

}


function addNotificationOnce(
    patientId,
    title,
    message
) {

    const notifications =
        getData(
            STORAGE_KEYS.notifications
        );


    const exists =
        notifications.some(
            n =>
                n.patientId ===
                patientId &&

                n.title ===
                title &&

                n.date.startsWith(
                    todayString()
                )
        );


    if (!exists) {

        addNotification(
            patientId,
            title,
            message
        );

    }

}


/* =========================================================
   NOTIFICATION BADGE
========================================================= */

function renderNotificationBadge() {

    const notifications =
        getData(
            STORAGE_KEYS.notifications
        );


    let unread =
        notifications.filter(
            n =>
                !n.read
        );


    if (
        currentRole === "patient" &&
        currentPatient
    ) {

        unread =
            unread.filter(
                n =>
                    n.patientId ===
                    currentPatient.id
            );

    }


    document
        .getElementById(
            "notificationBadge"
        )
        .textContent =
        unread.length;

}


/* =========================================================
   SHOW NOTIFICATIONS
========================================================= */

function showNotifications() {

    let notifications =
        getData(
            STORAGE_KEYS.notifications
        );


    if (
        currentRole === "patient" &&
        currentPatient
    ) {

        notifications =
            notifications.filter(
                n =>
                    n.patientId ===
                    currentPatient.id
            );

    }


    notifications =
        notifications
            .sort(
                (a,b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0,20);


    openModal(`

        <div class="eyebrow">
            NOTIFICATIONS
        </div>

        <h2 style="margin:8px 0 20px;">
            Notifications
        </h2>

        ${
            notifications.length

            ?

            notifications
                .map(
                    n => `

                    <div style="
                        padding:14px 0;
                        border-bottom:
                        1px solid rgba(255,255,255,0.08);
                    ">

                        <strong>
                            ${escapeHtml(
                                n.title
                            )}
                        </strong>

                        <p class="muted"
                           style="margin-top:5px;">

                            ${escapeHtml(
                                n.message
                            )}

                        </p>

                    </div>

                `
                )
                .join("")

            :

            `<p class="muted">
                No notifications.
            </p>`

        }

    `);


    const all =
        getData(
            STORAGE_KEYS.notifications
        );


    all.forEach(
        n => {

            if (
                currentRole === "patient" &&
                currentPatient &&
                n.patientId ===
                currentPatient.id
            ) {

                n.read = true;

            }

        }
    );


    setData(
        STORAGE_KEYS.notifications,
        all
    );


    renderNotificationBadge();

}


/* =========================================================
   MODAL
========================================================= */

function openModal(content) {

    document
        .getElementById(
            "modalContent"
        )
        .innerHTML =
        content;


    document
        .getElementById(
            "modal"
        )
        .classList.add(
            "show"
        );

}


function closeModal() {

    document
        .getElementById(
            "modal"
        )
        .classList.remove(
            "show"
        );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message
) {

    const toast =
        document
            .getElementById(
                "toast"
            );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   UTILS
========================================================= */

function formatToken(
    number
) {

    return String(number)
        .padStart(3,"0");

}


function formatDate(
    dateString
) {

    if (!dateString) {

        return "--";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHtml(
    text
) {

    if (text === null ||
        text === undefined) {

        return "";

    }


    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CURRENT PATIENT DOCUMENTS
========================================================= */

function viewCurrentPatientDocuments() {

    if (!currentConsultationToken) {

        return;

    }


    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const token =
        tokens.find(
            t =>
                t.id ===
                currentConsultationToken
        );


    if (!token) {

        return;

    }


    const documents =
        getData(
            STORAGE_KEYS.documents
        )
        .filter(
            d =>
                d.patientId ===
                token.patientId
        );


    openModal(`

        <div class="eyebrow">
            PATIENT DOCUMENTS
        </div>

        <h2 style="margin-top:8px;">
            ${escapeHtml(
                token.patientName
            )}
        </h2>

        <div style="margin-top:20px;">

            ${
                documents.length

                ?

                documents.map(
                    doc => `

                    <div class="document-row">

                        <div class="document-info">

                            <div class="document-icon">
                                📄
                            </div>

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        doc.fileName
                                    )}
                                </strong>

                                <small class="muted">
                                    ${escapeHtml(
                                        doc.type
                                    )}
                                </small>

                            </div>

                        </div>

                    </div>

                `
                ).join("")

                :

                `<p class="muted">
                    No documents available.
                </p>`

            }

        </div>

    `);

}


/* =========================================================
   CURRENT PATIENT HISTORY
========================================================= */

function viewCurrentPatientHistory() {

    if (!currentConsultationToken) {

        return;

    }


    const tokens =
        getData(
            STORAGE_KEYS.tokens
        );


    const token =
        tokens.find(
            t =>
                t.id ===
                currentConsultationToken
        );


    if (!token) {

        return;

    }


    const history =
        tokens
            .filter(
                t =>
                    t.patientId ===
                    token.patientId
            )
            .sort(
                (a,b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );


    openModal(`

        <div class="eyebrow">
            PATIENT HISTORY
        </div>

        <h2 style="margin-top:8px;">
            ${escapeHtml(
                token.patientName
            )}
        </h2>

        <div style="margin-top:20px;">

            ${
                history.map(
                    item => `

                    <div style="
                        padding:15px 0;
                        border-bottom:
                        1px solid rgba(255,255,255,0.08);
                    ">

                        <strong>
                            Token ${formatToken(
                                item.number
                            )}
                        </strong>

                        <p class="muted"
                           style="margin-top:5px;">

                            ${formatDate(
                                item.date
                            )}

                            •

                            ${escapeHtml(
                                item.reason
                            )}

                            •

                            ${item.status}

                        </p>

                    </div>

                `
                ).join("")

            }

        </div>

    `);

}


/* =========================================================
   REFRESH ALL
========================================================= */

function refreshAll() {

    renderStats();

    renderDoctorStatus();

    renderDoctorQueue();

    renderPatientToken();

    renderTokens();

    renderPatients();

    renderFollowups();

    renderDocuments();

    renderPrescriptions();

    renderNotificationBadge();

}


/* =========================================================
   START
========================================================= */

initializeDemoData();

refreshAll();


/* =========================================================
   SERVICE WORKER
========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("sw.js")
                .catch(
                    error =>
                        console.log(
                            "SW error:",
                            error
                        )
                );

        }
    );

}
