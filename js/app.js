/* =========================================================
   VTOOS SMART HOSPITAL
   FIREBASE PRODUCTION FOUNDATION
   Patient Authentication + Token Booking + Doctor Queue
========================================================= */

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { app } from "../firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

const auth = getAuth(app);
const db = getFirestore(app);


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentRole = null;
let currentPatient = null;
let currentDoctor = "doctor1";
let currentConsultationToken = null;
let unsubscribeTokens = null;


/* =========================================================
   DOCTORS
========================================================= */

const DOCTORS = {
    doctor1: {
        id: "doctor1",
        name: "Dr. Kumar",
        department: "General Medicine"
    },

    doctor2: {
        id: "doctor2",
        name: "Dr. Priya",
        department: "Pediatrics"
    }
};


/* =========================================================
   DATE HELPERS
========================================================= */

function todayString() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getDateAfterDays(days) {

    const date = new Date();

    date.setDate(
        date.getDate() + days
    );

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "--";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
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


function formatDateTime(value) {

    if (!value) {
        return "--";
    }

    try {

        const date =
            new Date(value);

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch {

        return "--";

    }
}


/* =========================================================
   TOKEN FORMAT
========================================================= */

function formatToken(number) {

    return String(number)
        .padStart(3, "0");

}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHtml(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

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
   AUTH UI
========================================================= */

function createAuthModal() {

    if (
        document.getElementById(
            "firebaseAuthModal"
        )
    ) {
        return;
    }


    const modal =
        document.createElement("div");

    modal.id =
        "firebaseAuthModal";

    modal.className =
        "modal show";


    modal.innerHTML = `

        <div class="modal-box">

            <button
                class="modal-close"
                id="authCloseBtn">
                ×
            </button>

            <div class="eyebrow">
                VTOOS HOSPITAL
            </div>

            <h2 id="authTitle"
                style="margin-top:8px;">
                Patient Login
            </h2>

            <p class="muted"
               id="authSubtitle">
                Login to manage your hospital visits.
            </p>


            <div class="form-group"
                 style="margin-top:20px;">

                <label>
                    Email
                </label>

                <input
                    id="authEmail"
                    type="email"
                    placeholder="Enter email address">

            </div>


            <div class="form-group">

                <label>
                    Password
                </label>

                <input
                    id="authPassword"
                    type="password"
                    placeholder="Enter password">

            </div>


            <div id="signupFields"
                 class="hidden">

                <div class="form-group">

                    <label>
                        Full Name
                    </label>

                    <input
                        id="authName"
                        type="text"
                        placeholder="Enter full name">

                </div>


                <div class="form-row">

                    <div class="form-group">

                        <label>
                            Age
                        </label>

                        <input
                            id="authAge"
                            type="number"
                            min="1"
                            max="120"
                            placeholder="Age">

                    </div>


                    <div class="form-group">

                        <label>
                            Gender
                        </label>

                        <select id="authGender">

                            <option value="Male">
                                Male
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Mobile Number
                    </label>

                    <input
                        id="authMobile"
                        type="tel"
                        maxlength="10"
                        placeholder="10 digit mobile">

                </div>


                <div class="form-group">

                    <label>
                        Address
                    </label>

                    <input
                        id="authAddress"
                        type="text"
                        placeholder="Address">

                </div>

            </div>


            <button
                id="authSubmitBtn"
                class="primary-btn full"
                style="margin-top:10px;">

                Login

            </button>


            <button
                id="authSwitchBtn"
                class="secondary-btn full"
                style="margin-top:10px;">

                New patient? Create account

            </button>


            <p
                id="authMessage"
                class="muted"
                style="margin-top:14px;text-align:center;">

            </p>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "authCloseBtn"
        )
        .onclick = () => {

            modal.remove();

        };


    document
        .getElementById(
            "authSwitchBtn"
        )
        .onclick =
        toggleAuthMode;


    document
        .getElementById(
            "authSubmitBtn"
        )
        .onclick =
        submitAuth;

}


let authMode = "login";


function toggleAuthMode() {

    authMode =
        authMode === "login"
            ? "signup"
            : "login";


    const title =
        document.getElementById(
            "authTitle"
        );

    const subtitle =
        document.getElementById(
            "authSubtitle"
        );

    const submit =
        document.getElementById(
            "authSubmitBtn"
        );

    const switchBtn =
        document.getElementById(
            "authSwitchBtn"
        );

    const fields =
        document.getElementById(
            "signupFields"
        );


    if (
        authMode === "signup"
    ) {

        title.textContent =
            "Create Patient Account";

        subtitle.textContent =
            "Enter your details once. Future visits will use your saved profile.";

        submit.textContent =
            "Create Account";

        switchBtn.textContent =
            "Already registered? Login";

        fields.classList.remove(
            "hidden"
        );

    } else {

        title.textContent =
            "Patient Login";

        subtitle.textContent =
            "Login to manage your hospital visits.";

        submit.textContent =
            "Login";

        switchBtn.textContent =
            "New patient? Create account";

        fields.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   PATIENT AUTH
========================================================= */

async function submitAuth() {

    const email =
        document
            .getElementById(
                "authEmail"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "authPassword"
            )
            .value;


    const message =
        document.getElementById(
            "authMessage"
        );


    if (!email) {

        message.textContent =
            "Enter your email.";

        return;

    }


    if (
        password.length < 6
    ) {

        message.textContent =
            "Password must contain at least 6 characters.";

        return;

    }


    try {

        message.textContent =
            "Please wait...";


        if (
            authMode === "signup"
        ) {

            const name =
                document
                    .getElementById(
                        "authName"
                    )
                    .value
                    .trim();

            const age =
                document
                    .getElementById(
                        "authAge"
                    )
                    .value;

            const gender =
                document
                    .getElementById(
                        "authGender"
                    )
                    .value;

            const mobile =
                document
                    .getElementById(
                        "authMobile"
                    )
                    .value
                    .trim();

            const address =
                document
                    .getElementById(
                        "authAddress"
                    )
                    .value
                    .trim();


            if (!name) {

                message.textContent =
                    "Enter your name.";

                return;

            }


            if (!age) {

                message.textContent =
                    "Enter your age.";

                return;

            }


            if (
                !/^[0-9]{10}$/.test(
                    mobile
                )
            ) {

                message.textContent =
                    "Enter a valid 10 digit mobile number.";

                return;

            }


            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const uid =
                credential.user.uid;


            const patientId =
                await generatePatientId();


            const patient = {

                uid,

                patientId,

                name,

                email,

                mobile,

                age: Number(age),

                gender,

                address,

                role: "patient",

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()

            };


            await setDoc(
                doc(
                    db,
                    "patients",
                    uid
                ),
                patient
            );


            message.textContent =
                "Account created successfully.";


            showToast(
                "Patient account created."
            );


            closeAuthModal();


            await loadPatientProfile(
                credential.user
            );


            openPatientApp();


        } else {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            closeAuthModal();


            await loadPatientProfile(
                credential.user
            );


            openPatientApp();

        }


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );


        let text =
            "Unable to complete login.";


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            text =
                "This email is already registered.";

        }

        else if (
            error.code ===
            "auth/invalid-credential"
        ) {

            text =
                "Invalid email or password.";

        }

        else if (
            error.code ===
            "auth/weak-password"
        ) {

            text =
                "Password must contain at least 6 characters.";

        }

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            text =
                "Invalid email address.";

        }


        message.textContent =
            text;

    }

}


/* =========================================================
   CLOSE AUTH MODAL
========================================================= */

function closeAuthModal() {

    const modal =
        document.getElementById(
            "firebaseAuthModal"
        );

    if (modal) {
        modal.remove();
    }

}


/* =========================================================
   PATIENT ID
========================================================= */

async function generatePatientId() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "patients"
            )
        );


    const number =
        snapshot.size + 1;


    return (
        "VTOOS-P-" +
        String(number)
            .padStart(6, "0")
    );

}


/* =========================================================
   LOAD PATIENT PROFILE
========================================================= */

async function loadPatientProfile(
    user
) {

    if (!user) {
        return;
    }


    const patientRef =
        doc(
            db,
            "patients",
            user.uid
        );


    const snapshot =
        await getDoc(
            patientRef
        );


    if (
        snapshot.exists()
    ) {

        currentPatient =
            snapshot.data();

    } else {

        currentPatient = {

            uid:
                user.uid,

            patientId:
                user.uid,

            name:
                user.email
                    .split("@")[0],

            email:
                user.email,

            role:
                "patient"

        };

    }

}


/* =========================================================
   PATIENT APP OPEN
========================================================= */

function openPatientApp() {

    currentRole =
        "patient";


    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const appScreen =
        document.getElementById(
            "appScreen"
        );


    if (loginScreen) {

        loginScreen
            .classList
            .remove("active");

    }


    if (appScreen) {

        appScreen
            .classList
            .add("active");

    }


    const userName =
        document.getElementById(
            "currentUserName"
        );


    const title =
        document.getElementById(
            "dashboardTitle"
        );


    if (userName) {

        userName.textContent =
            currentPatient?.name ||
            "Patient";

    }


    if (title) {

        title.textContent =
            "Hello, " +
            (
                currentPatient?.name ||
                "Patient"
            );

    }


    setupRoleDashboard();

    setupVisitDate();

    refreshAll();

}


/* =========================================================
   LOGIN BUTTON
========================================================= */

function loginAs(role) {

    if (
        role === "patient"
    ) {

        createAuthModal();

        return;

    }


    /*
       Doctor and Reception authentication
       will be connected to staff accounts
       in the next security phase.
    */

    currentRole =
        role;


    document
        .getElementById(
            "loginScreen"
        )
        .classList
        .remove("active");


    document
        .getElementById(
            "appScreen"
        )
        .classList
        .add("active");


    const userName =
        document.getElementById(
            "currentUserName"
        );


    const title =
        document.getElementById(
            "dashboardTitle"
        );


    if (
        role === "doctor"
    ) {

        userName.textContent =
            "Dr. Kumar";

        title.textContent =
            "Doctor Dashboard";

    }

    else {

        userName.textContent =
            "Reception";

        title.textContent =
            "Reception Dashboard";

    }


    setupRoleDashboard();

    refreshAll();

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    try {

        await signOut(
            auth
        );

    } catch (error) {

        console.error(
            error
        );

    }


    currentRole =
        null;

    currentPatient =
        null;

    currentConsultationToken =
        null;


    if (
        unsubscribeTokens
    ) {

        unsubscribeTokens();

        unsubscribeTokens =
            null;

    }


    document
        .getElementById(
            "appScreen"
        )
        .classList
        .remove("active");


    document
        .getElementById(
            "loginScreen"
        )
        .classList
        .add("active");

}


/* =========================================================
   ROLE DASHBOARD
========================================================= */

function setupRoleDashboard() {

    const patient =
        document.getElementById(
            "patientDashboard"
        );

    const doctor =
        document.getElementById(
            "doctorDashboard"
        );

    const staff =
        document.getElementById(
            "staffDashboard"
        );


    if (patient) {

        patient
            .classList
            .add("hidden");

    }


    if (doctor) {

        doctor
            .classList
            .add("hidden");

    }


    if (staff) {

        staff
            .classList
            .add("hidden");

    }


    if (
        currentRole ===
        "patient"
    ) {

        patient?.classList
            .remove("hidden");

    }


    if (
        currentRole ===
        "doctor"
    ) {

        doctor?.classList
            .remove("hidden");

    }


    if (
        currentRole ===
        "staff"
    ) {

        staff?.classList
            .remove("hidden");

    }

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(page) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            p =>
                p.classList.remove(
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
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.page ===
                    page
                );

            }
        );


    refreshAll();

}


/* =========================================================
   VISIT DATE SETUP
========================================================= */

function setupVisitDate() {

    const input =
        document.getElementById(
            "patientVisitDate"
        );


    if (!input) {
        return;
    }


    const today =
        todayString();


    input.min =
        today;


    if (!input.value) {

        input.value =
            today;

    }

}


/* =========================================================
   REASON
========================================================= */

function selectReason(
    button,
    reason
) {

    document
        .querySelectorAll(
            ".reason-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "selected"
                )
        );


    button.classList.add(
        "selected"
    );


    const field =
        document.getElementById(
            "selectedReason"
        );


    if (field) {

        field.value =
            reason;

    }

}


/* =========================================================
   DOCTOR AVAILABILITY
========================================================= */

async function getDoctorAvailability(
    doctorId
) {

    try {

        const ref =
            doc(
                db,
                "doctorStatus",
                doctorId
            );


        const snapshot =
            await getDoc(
                ref
            );


        if (
            snapshot.exists()
        ) {

            return (
                snapshot.data()
                    .available === true
            );

        }

    } catch (error) {

        console.error(
            "Availability error:",
            error
        );

    }


    return true;

}


/* =========================================================
   TOKEN NUMBER
========================================================= */

async function getNextTokenNumber(
    doctorId,
    visitDate
) {

    const tokenQuery =
        query(
            collection(
                db,
                "tokens"
            ),
            where(
                "doctorId",
                "==",
                doctorId
            ),
            where(
                "visitDate",
                "==",
                visitDate
            )
        );


    const snapshot =
        await getDocs(
            tokenQuery
        );


    if (
        snapshot.empty
    ) {

        return 1;

    }


    let max =
        0;


    snapshot.forEach(
        item => {

            const data =
                item.data();


            const number =
                Number(
                    data.number
                );


            if (
                number > max
            ) {

                max =
                    number;

            }

        }
    );


    return max + 1;

}


/* =========================================================
   PATIENT TOKEN
========================================================= */

async function generatePatientToken() {

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
            ?.value;


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
            ?.value;


    const visitDate =
        document
            .getElementById(
                "patientVisitDate"
            )
            ?.value;


    if (!visitDate) {

        showToast(
            "Please select visit date."
        );

        return;

    }


    if (
        visitDate <
        todayString()
    ) {

        showToast(
            "Visit date cannot be in the past."
        );

        return;

    }


    const available =
        await getDoctorAvailability(
            doctorId
        );


    if (!available) {

        showToast(
            "Doctor is not available for booking."
        );

        return;

    }


    try {

        const token =
            await createToken(
                currentPatient,
                doctorId,
                reason,
                "Patient",
                visitDate
            );


        showToast(
            "Token " +
            formatToken(
                token.number
            ) +
            " booked for " +
            formatDate(
                visitDate
            )
        );


        refreshAll();


    } catch (error) {

        console.error(
            "Token error:",
            error
        );

        showToast(
            "Unable to generate token."
        );

    }

}


/* =========================================================
   CREATE TOKEN
========================================================= */

async function createToken(
    patient,
    doctorId,
    reason,
    source,
    visitDate
) {

    const number =
        await getNextTokenNumber(
            doctorId,
            visitDate
        );


    const doctor =
        DOCTORS[
            doctorId
        ];


    const token = {

        number,

        patientId:
            patient.patientId,

        patientUid:
            patient.uid,

        patientName:
            patient.name,

        patientMobile:
            patient.mobile || "",

        doctorId,

        doctorName:
            doctor?.name ||
            "Doctor",

        department:
            doctor?.department ||
            "",

        reason,

        visitDate,

        status:
            "Waiting",

        priority:
            false,

        source,

        bookedAt:
            new Date()
                .toISOString(),

        completedAt:
            null

    };


    const ref =
        await addDoc(
            collection(
                db,
                "tokens"
            ),
            token
        );


    token.id =
        ref.id;


    await createNotification(
        patient.patientId,
        "Token Generated",
        "Your token is " +
        formatToken(number) +
        " for " +
        formatDate(visitDate) +
        "."
    );


    return token;

}


/* =========================================================
   DOCTOR QUEUE
========================================================= */

async function getDoctorQueue(
    doctorId,
    visitDate
) {

    const tokenQuery =
        query(
            collection(
                db,
                "tokens"
            ),
            where(
                "doctorId",
                "==",
                doctorId
            ),
            where(
                "visitDate",
                "==",
                visitDate
            )
        );


    const snapshot =
        await getDocs(
            tokenQuery
        );


    const queue = [];


    snapshot.forEach(
        item => {

            const data =
                item.data();


            if (
                data.status ===
                "Waiting"
                ||
                data.status ===
                "Skipped"
            ) {

                queue.push({
                    id:
                        item.id,
                    ...data
                });

            }

        }
    );


    queue.sort(
        (a, b) => {

            if (
                a.priority &&
                !b.priority
            ) {
                return -1;
            }


            if (
                !a.priority &&
                b.priority
            ) {
                return 1;
            }


            return (
                Number(a.number) -
                Number(b.number)
            );

        }
    );


    return queue;

}


/* =========================================================
   SELECT PATIENT TOKEN
========================================================= */

async function selectPatientToken(
    tokenId
) {

    try {

        const tokenRef =
            doc(
                db,
                "tokens",
                tokenId
            );


        const snapshot =
            await getDoc(
                tokenRef
            );


        if (
            !snapshot.exists()
        ) {

            showToast(
                "Token not found."
            );

            return;

        }


        const token = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        currentConsultationToken =
            token.id;


        document
            .getElementById(
                "doctorPatientDetails"
            )
            ?.classList
            .remove("hidden");


        const tokenElement =
            document.getElementById(
                "doctorCurrentToken"
            );


        const patientElement =
            document.getElementById(
                "doctorCurrentPatient"
            );


        const nameElement =
            document.getElementById(
                "consultPatientName"
            );


        const infoElement =
            document.getElementById(
                "consultPatientInfo"
            );


        const reasonElement =
            document.getElementById(
                "consultReason"
            );


        if (tokenElement) {

            tokenElement.textContent =
                "Token " +
                formatToken(
                    token.number
                );

        }


        if (patientElement) {

            patientElement.textContent =
                token.patientName;

        }


        if (nameElement) {

            nameElement.textContent =
                token.patientName;

        }


        if (infoElement) {

            infoElement.textContent =
                (
                    token.patientAge ||
                    "--"
                ) +
                " years • " +
                (
                    token.patientGender ||
                    "--"
                ) +
                " • " +
                (
                    token.patientMobile ||
                    "--"
                );

        }


        if (reasonElement) {

            reasonElement.textContent =
                token.reason;

        }


        await renderConsultationCounts(
            token.patientUid
        );


    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Unable to open patient."
        );

    }

}


/* =========================================================
   CONSULTATION COUNTS
========================================================= */

async function renderConsultationCounts(
    patientUid
) {

    if (!patientUid) {
        return;
    }


    try {

        const tokenQuery =
            query(
                collection(
                    db,
                    "tokens"
                ),
                where(
                    "patientUid",
                    "==",
                    patientUid
                )
            );


        const snapshot =
            await getDocs(
                tokenQuery
            );


        let visits =
            0;


        snapshot.forEach(
            item => {

                if (
                    item.data()
                        .status ===
                    "Completed"
                ) {

                    visits++;

                }

            }
        );


        const visitsElement =
            document.getElementById(
                "consultVisits"
            );


        if (visitsElement) {

            visitsElement.textContent =
                visits;

        }


        const documentsElement =
            document.getElementById(
                "consultDocuments"
            );


        if (documentsElement) {

            documentsElement.textContent =
                "0";

        }


        const prescriptionsElement =
            document.getElementById(
                "consultPrescriptions"
            );


        if (
            prescriptionsElement
        ) {

            prescriptionsElement
                .textContent =
                "0";

        }

    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   COMPLETE CONSULTATION
========================================================= */

async function completeConsultation() {

    if (
        !currentConsultationToken
    ) {

        showToast(
            "Select a patient first."
        );

        return;

    }


    try {

        const tokenRef =
            doc(
                db,
                "tokens",
                currentConsultationToken
            );


        const snapshot =
            await getDoc(
                tokenRef
            );


        if (
            !snapshot.exists()
        ) {

            showToast(
                "Token not found."
            );

            return;

        }


        const token =
            snapshot.data();


        await updateDoc(
            tokenRef,
            {

                status:
                    "Completed",

                completedAt:
                    new Date()
                        .toISOString()

            }
        );


        await createNotification(
            token.patientId,
            "Consultation Completed",
            "Your consultation with " +
            token.doctorName +
            " is completed."
        );


        showToast(
            "Consultation completed."
        );


        currentConsultationToken =
            null;


        document
            .getElementById(
                "doctorPatientDetails"
            )
            ?.classList
            .add("hidden");


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

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Unable to complete consultation."
        );

    }

}


/* =========================================================
   PATIENT TOKEN STATUS
========================================================= */

async function renderPatientToken() {

    if (!currentPatient) {
        return;
    }


    try {

        const tokenQuery =
            query(
                collection(
                    db,
                    "tokens"
                ),
                where(
                    "patientUid",
                    "==",
                    currentPatient.uid
                )
            );


        const snapshot =
            await getDocs(
                tokenQuery
            );


        const tokens = [];


        snapshot.forEach(
            item => {

                tokens.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        tokens.sort(
            (a, b) => {

                return (
                    new Date(
                        b.bookedAt
                    ) -
                    new Date(
                        a.bookedAt
                    )
                );

            }
        );


        const activeToken =
            tokens[0];


        const numberElement =
            document.getElementById(
                "patientTokenNumber"
            );


        const statusElement =
            document.getElementById(
                "patientTokenStatus"
            );


        if (!activeToken) {

            if (numberElement) {

                numberElement.textContent =
                    "--";

            }

            if (statusElement) {

                statusElement.textContent =
                    "No token booked";

            }

            return;

        }


        if (numberElement) {

            numberElement.textContent =
                formatToken(
                    activeToken.number
                );

        }


        if (statusElement) {

            statusElement.textContent =
                activeToken.status +
                " • " +
                formatDate(
                    activeToken.visitDate
                );

        }


        await calculatePatientQueue(
            activeToken
        );


    } catch (error) {

        console.error(
            "Patient token:",
            error
        );

    }

}


/* =========================================================
   PATIENT QUEUE / WAIT TIME
========================================================= */

async function calculatePatientQueue(
    activeToken
) {

    try {

        const queue =
            await getDoctorQueue(
                activeToken.doctorId,
                activeToken.visitDate
            );


        const ahead =
            queue.filter(
                item => {

                    return (
                        Number(
                            item.number
                        ) <
                        Number(
                            activeToken.number
                        )
                    );

                }
            );


        const current =
            queue.length
                ? queue[0]
                : null;


        const currentElement =
            document.getElementById(
                "patientCurrentToken"
            );


        const aheadElement =
            document.getElementById(
                "patientAhead"
            );


        const waitElement =
            document.getElementById(
                "patientWaitTime"
            );


        if (currentElement) {

            currentElement.textContent =
                current
                    ? formatToken(
                        current.number
                    )
                    : "--";

        }


        if (aheadElement) {

            aheadElement.textContent =
                ahead.length;

        }


        /*
           Initial demo average:
           8 minutes per patient.

           Later this will be calculated
           from actual completed consultations.
        */

        const averageMinutes =
            8;


        if (waitElement) {

            waitElement.textContent =
                "~ " +
                (
                    ahead.length *
                    averageMinutes
                ) +
                " mins";

        }


        if (
            ahead.length <= 2 &&
            activeToken.status ===
            "Waiting"
        ) {

            await createNotification(
                activeToken.patientId,
                "Token Approaching",
                "Your token is approaching. Please be ready."
            );

        }


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   DOCTOR QUEUE RENDER
========================================================= */

async function renderDoctorQueue() {

    const container =
        document.getElementById(
            "doctorQueue"
        );


    if (!container) {
        return;
    }


    const queue =
        await getDoctorQueue(
            currentDoctor,
            todayString()
        );


    const count =
        document.getElementById(
            "doctorQueueCount"
        );


    if (count) {

        count.textContent =
            queue.length;

    }


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
                        onclick="selectPatientToken('${token.id}')">

                        Select

                    </button>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   TOKEN LIST
========================================================= */

async function renderTokens() {

    const container =
        document.getElementById(
            "allTokensList"
        );


    if (!container) {
        return;
    }


    let tokens = [];


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "tokens"
                )
            );


        snapshot.forEach(
            item => {

                tokens.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


    } catch (error) {

        console.error(
            error
        );

        return;

    }


    tokens =
        tokens.filter(
            token =>
                token.visitDate ===
                todayString()
        );


    if (
        currentRole ===
        "patient" &&
        currentPatient
    ) {

        tokens =
            tokens.filter(
                token =>
                    token.patientUid ===
                    currentPatient.uid
            );

    }


    tokens.sort(
        (a, b) =>
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

                        ${escapeHtml(
                            token.status
                        )}

                    </div>


                    <div>

                        ${
                            currentRole ===
                            "doctor"

                            ?

                            `<button
                                class="secondary-btn"
                                onclick="selectPatientToken('${token.id}')">

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
   DOCTOR STATUS
========================================================= */

async function toggleDoctorAvailability() {

    try {

        const ref =
            doc(
                db,
                "doctorStatus",
                currentDoctor
            );


        const snapshot =
            await getDoc(
                ref
            );


        const current =
            snapshot.exists()
                ? snapshot.data()
                    .available === true
                : false;


        await setDoc(
            ref,
            {

                doctorId:
                    currentDoctor,

                available:
                    !current,

                updatedAt:
                    new Date()
                        .toISOString()

            },
            {
                merge:
                    true
            }
        );


        showToast(
            !current
                ? "You are now available."
                : "Doctor marked unavailable."
        );


        renderDoctorStatus();


    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Unable to update doctor status."
        );

    }

}


/* =========================================================
   RENDER DOCTOR STATUS
========================================================= */

async function renderDoctorStatus() {

    const dashboard =
        document.getElementById(
            "doctorStatusBox"
        );


    if (!dashboard) {
        return;
    }


    const available =
        await getDoctorAvailability(
            currentDoctor
        );


    dashboard.innerHTML = `

        <span class="${
            available
                ? "online"
                : "offline"
        }">

            ${
                available
                    ? "● Available"
                    : "● Not Available"
            }

        </span>

    `;


    const button =
        document.getElementById(
            "doctorAvailableBtn"
        );


    if (button) {

        button.textContent =
            available
                ? "🟢 Available"
                : "🔴 Mark Available";

    }


    const staff =
        document.getElementById(
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
                    available
                        ? "online"
                        : "offline"
                }">

                    ${
                        available
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

                <span class="offline">

                    ● Offline

                </span>

            </div>

        `;

    }

}


/* =========================================================
   STATS
========================================================= */

async function renderStats() {

    try {

        const patientSnapshot =
            await getDocs(
                collection(
                    db,
                    "patients"
                )
            );


        const tokenSnapshot =
            await getDocs(
                collection(
                    db,
                    "tokens"
                )
            );


        let todayTokens =
            [];


        tokenSnapshot.forEach(
            item => {

                const token =
                    item.data();


                if (
                    token.visitDate ===
                    todayString()
                ) {

                    todayTokens.push(
                        token
                    );

                }

            }
        );


        const completed =
            todayTokens.filter(
                token =>
                    token.status ===
                    "Completed"
            );


        const patientElement =
            document.getElementById(
                "statPatients"
            );


        const tokenElement =
            document.getElementById(
                "statTokens"
            );


        const completedElement =
            document.getElementById(
                "statCompleted"
            );


        if (patientElement) {

            patientElement.textContent =
                patientSnapshot.size;

        }


        if (tokenElement) {

            tokenElement.textContent =
                todayTokens.length;

        }


        if (completedElement) {

            completedElement.textContent =
                completed.length;

        }


    } catch (error) {

        console.error(
            "Stats error:",
            error
        );

    }

}


/* =========================================================
   PATIENTS
========================================================= */

async function renderPatients() {

    const container =
        document.getElementById(
            "patientsList"
        );


    if (!container) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "patients"
                )
            );


        let patients = [];


        snapshot.forEach(
            item => {

                patients.push(
                    item.data()
                );

            }
        );


        const search =
            (
                document
                    .getElementById(
                        "patientSearch"
                    )
                    ?.value ||
                ""
            )
            .toLowerCase();


        patients =
            patients.filter(
                patient => {

                    return (
                        (
                            patient.name ||
                            ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        (
                            patient.mobile ||
                            ""
                        )
                        .includes(search)

                    );

                }
            );


        container.innerHTML =
            patients
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

                                ${
                                    patient.patientId ||
                                    "--"
                                }

                                •

                                ${
                                    patient.mobile ||
                                    "--"
                                }

                            </small>

                        </div>


                        <button
                            class="secondary-btn"
                            onclick="viewPatient('${patient.uid}')">

                            View

                        </button>

                    </div>

                `
                )
                .join("");


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   PATIENT VIEW
========================================================= */

async function viewPatient(
    uid
) {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "patients",
                    uid
                )
            );


        if (
            !snapshot.exists()
        ) {

            return;

        }


        const patient =
            snapshot.data();


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

                ${
                    patient.patientId ||
                    "--"
                }

            </p>


            <div class="history-grid"
                 style="margin-top:20px;">

                <div>

                    <span>
                        Age
                    </span>

                    <strong>
                        ${
                            patient.age ||
                            "--"
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Gender
                    </span>

                    <strong>
                        ${
                            patient.gender ||
                            "--"
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Mobile
                    </span>

                    <strong>
                        ${
                            patient.mobile ||
                            "--"
                        }
                    </strong>

                </div>

            </div>


            <h3 style="margin-top:20px;">

                Patient Information

            </h3>


            <p class="muted"
               style="margin-top:10px;">

                Email:
                ${
                    escapeHtml(
                        patient.email ||
                        "--"
                    )
                }

                <br>

                Address:
                ${
                    escapeHtml(
                        patient.address ||
                        "Not provided"
                    )
                }

            </p>


            <button
                class="primary-btn full"
                style="margin-top:20px;"
                onclick="closeModal()">

                Close

            </button>

        `);


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   MODAL
========================================================= */

function openModal(
    content
) {

    const modal =
        document.getElementById(
            "modal"
        );


    const contentBox =
        document.getElementById(
            "modalContent"
        );


    if (
        !modal ||
        !contentBox
    ) {

        return;

    }


    contentBox.innerHTML =
        content;


    modal.classList.add(
        "show"
    );

}


function closeModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function createNotification(
    patientId,
    title,
    message
) {

    if (!patientId) {
        return;
    }


    try {

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {

                patientId,

                title,

                message,

                createdAt:
                    new Date()
                        .toISOString(),

                read:
                    false

            }
        );

    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

    }

}


async function showNotifications() {

    if (
        !currentPatient
    ) {

        return;

    }


    try {

        const notificationQuery =
            query(
                collection(
                    db,
                    "notifications"
                ),
                where(
                    "patientId",
                    "==",
                    currentPatient.patientId
                )
            );


        const snapshot =
            await getDocs(
                notificationQuery
            );


        const notifications = [];


        snapshot.forEach(
            item => {

                notifications.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        notifications.sort(
            (a, b) =>
                new Date(
                    b.createdAt
                ) -
                new Date(
                    a.createdAt
                )
        );


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
                    .slice(0, 20)
                    .map(
                        notification => `

                        <div style="
                            padding:14px 0;
                            border-bottom:
                            1px solid
                            rgba(255,255,255,0.08);
                        ">

                            <strong>

                                ${escapeHtml(
                                    notification.title
                                )}

                            </strong>


                            <p class="muted"
                               style="margin-top:5px;">

                                ${escapeHtml(
                                    notification.message
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


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   FOLLOWUPS
========================================================= */

async function renderFollowups() {

    const container =
        document.getElementById(
            "followupList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="panel">

            <h3>
                Follow-up Module
            </h3>

            <p class="muted">
                Firebase follow-up integration will be connected after the core token workflow is verified.
            </p>

        </div>

    `;

}


/* =========================================================
   DOCUMENTS
========================================================= */

async function renderDocuments() {

    const container =
        document.getElementById(
            "documentsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="panel">

            <h3>
                Digital Documents
            </h3>

            <p class="muted">
                Firebase Storage integration will be connected after the core patient and token workflow is verified.
            </p>

        </div>

    `;

}


/* =========================================================
   PRESCRIPTIONS
========================================================= */

async function renderPrescriptions() {

    const container =
        document.getElementById(
            "prescriptionList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="panel">

            <h3>
                Prescriptions
            </h3>

            <p class="muted">
                Prescription module will be connected to Firestore after the consultation workflow is verified.
            </p>

        </div>

    `;

}


/* =========================================================
   DOCUMENT UPLOAD
========================================================= */

function handleDocumentUpload(
    event
) {

    if (
        !currentPatient
    ) {

        showToast(
            "Please login as patient."
        );

        return;

    }


    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    showToast(
        "Document upload will be connected to Firebase Storage next."
    );


    event.target.value =
        "";

}


/* =========================================================
   DOCTOR DOCUMENTS
========================================================= */

function viewCurrentPatientDocuments() {

    openModal(`

        <div class="eyebrow">
            PATIENT DOCUMENTS
        </div>

        <h2 style="margin-top:8px;">
            Documents
        </h2>

        <p class="muted"
           style="margin-top:15px;">

            Firebase Storage integration
            will be connected in the next module.

        </p>

    `);

}


/* =========================================================
   DOCTOR HISTORY
========================================================= */

async function viewCurrentPatientHistory() {

    if (
        !currentConsultationToken
    ) {

        return;

    }


    try {

        const tokenSnapshot =
            await getDoc(
                doc(
                    db,
                    "tokens",
                    currentConsultationToken
                )
            );


        if (
            !tokenSnapshot.exists()
        ) {

            return;

        }


        const token =
            tokenSnapshot.data();


        const tokenQuery =
            query(
                collection(
                    db,
                    "tokens"
                ),
                where(
                    "patientUid",
                    "==",
                    token.patientUid
                )
            );


        const snapshot =
            await getDocs(
                tokenQuery
            );


        const history = [];


        snapshot.forEach(
            item => {

                history.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        history.sort(
            (a, b) =>
                new Date(
                    b.bookedAt
                ) -
                new Date(
                    a.bookedAt
                )
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
                    history.length

                    ?

                    history.map(
                        item => `

                        <div style="
                            padding:15px 0;
                            border-bottom:
                            1px solid
                            rgba(255,255,255,0.08);
                        ">

                            <strong>

                                Token
                                ${formatToken(
                                    item.number
                                )}

                            </strong>


                            <p class="muted"
                               style="margin-top:5px;">

                                Visit:
                                ${
                                    formatDate(
                                        item.visitDate
                                    )
                                }

                                •
                                ${
                                    escapeHtml(
                                        item.reason
                                    )
                                }

                                •
                                ${
                                    escapeHtml(
                                        item.status
                                    )
                                }

                            </p>

                        </div>

                    `
                    ).join("")

                    :

                    `<p class="muted">
                        No previous visits.
                    </p>`

                }

            </div>

        `);


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   STAFF FIND PATIENT
========================================================= */

async function findStaffPatient() {

    const mobile =
        document
            .getElementById(
                "staffMobile"
            )
            ?.value
            .trim();


    if (!mobile) {
        return;
    }


    try {

        const patientQuery =
            query(
                collection(
                    db,
                    "patients"
                ),
                where(
                    "mobile",
                    "==",
                    mobile
                )
            );


        const snapshot =
            await getDocs(
                patientQuery
            );


        const found =
            document.getElementById(
                "staffPatientFound"
            );


        const newPatient =
            document.getElementById(
                "staffNewPatient"
            );


        if (
            !snapshot.empty
        ) {

            const patient =
                snapshot
                    .docs[0]
                    .data();


            found
                ?.classList
                .remove("hidden");


            newPatient
                ?.classList
                .add("hidden");


            const name =
                document.getElementById(
                    "staffFoundName"
                );


            const id =
                document.getElementById(
                    "staffFoundId"
                );


            if (name) {

                name.textContent =
                    patient.name;

            }


            if (id) {

                id.textContent =
                    patient.patientId;

            }

        } else {

            found
                ?.classList
                .add("hidden");


            newPatient
                ?.classList
                .remove("hidden");

        }

    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   STAFF TOKEN
========================================================= */

async function createStaffToken() {

    const mobile =
        document
            .getElementById(
                "staffMobile"
            )
            ?.value
            .trim();


    if (!mobile) {

        showToast(
            "Enter mobile number."
        );

        return;

    }


    try {

        const patientQuery =
            query(
                collection(
                    db,
                    "patients"
                ),
                where(
                    "mobile",
                    "==",
                    mobile
                )
            );


        const snapshot =
            await getDocs(
                patientQuery
            );


        let patient = null;


        if (
            !snapshot.empty
        ) {

            patient =
                snapshot
                    .docs[0]
                    .data();

        }


        if (!patient) {

            showToast(
                "Patient is not registered. Please complete patient registration first."
            );

            return;

        }


        const doctorId =
            document
                .getElementById(
                    "staffDoctor"
                )
                ?.value;


        const reason =
            document
                .getElementById(
                    "staffReason"
                )
                ?.value;


        const visitDate =
            todayString();


        const token =
            await createToken(
                patient,
                doctorId,
                reason,
                "Staff",
                visitDate
            );


        showToast(
            "Token " +
            formatToken(
                token.number
            ) +
            " created."
        );


        const mobileInput =
            document.getElementById(
                "staffMobile"
            );


        if (mobileInput) {

            mobileInput.value =
                "";

        }


        refreshAll();


    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Unable to create token."
        );

    }

}


/* =========================================================
   DOCTOR CURRENT STATUS
========================================================= */

async function getCurrentDoctorToken(
    doctorId,
    visitDate
) {

    const queue =
        await getDoctorQueue(
            doctorId,
            visitDate
        );


    return queue.length
        ? queue[0]
        : null;

}


/* =========================================================
   REFRESH ALL
========================================================= */

async function refreshAll() {

    try {

        await renderStats();

        await renderDoctorStatus();

        await renderDoctorQueue();

        await renderPatientToken();

        await renderTokens();

        await renderPatients();

        await renderFollowups();

        await renderDocuments();

        await renderPrescriptions();


    } catch (error) {

        console.error(
            "Refresh error:",
            error
        );

    }

}


/* =========================================================
   FIREBASE AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            return;

        }


        /*
           We only automatically restore
           patient accounts at this stage.
        */

        try {

            const patientRef =
                doc(
                    db,
                    "patients",
                    user.uid
                );


            const snapshot =
                await getDoc(
                    patientRef
                );


            if (
                snapshot.exists()
            ) {

                currentPatient =
                    snapshot.data();

                currentRole =
                    "patient";


                /*
                   Don't force-open the app if
                   user is already viewing it.
                */

            }

        } catch (error) {

            console.error(
                "Auth state error:",
                error
            );

        }

    }
);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupVisitDate();

        /*
           Existing UI remains available.
        */

    }
);


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
                .register(
                    "sw.js"
                )
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
window.loginAs = loginAs;
window.logout = logout;

window.openPage = openPage;
window.showNotifications = showNotifications;

window.selectReason = selectReason;
window.generatePatientToken = generatePatientToken;

window.toggleDoctorAvailability = toggleDoctorAvailability;
window.completeConsultation = completeConsultation;

window.renderPatients = renderPatients;
window.viewPatient = viewPatient;

window.createStaffToken = createStaffToken;
window.findStaffPatient = findStaffPatient;

window.viewCurrentPatientDocuments =
    viewCurrentPatientDocuments;

window.viewCurrentPatientHistory =
    viewCurrentPatientHistory;

window.handleDocumentUpload =
    handleDocumentUpload;

window.closeModal = closeModal;
