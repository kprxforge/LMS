"""
Master LMS — Python FastAPI Backend
Supabase PostgreSQL persistence | Gemini AI integration
"""

import os
import random
import string
import json
from typing import Optional
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import supabase
from models import (
    LoginRequest, UserUpdate,
    RegistrationCreate, RejectRequest,
    CourseCreate, CourseUpdate, ProgressUpdate,
    CourseApplicationCreate,
    MaterialCreate, QuizCreate, QuizSubmit,
    CertificateCreate, ChatRequest, SummarizeRequest,
    NotificationCreate,
)
from auth import get_user_id

load_dotenv()

# ============================================================
# APP SETUP
# ============================================================
app = FastAPI(title="Master LMS API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HELPERS
# ============================================================
def gen_id(prefix: str = "") -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
    return prefix + suffix


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        return genai
    except Exception:
        return None


# ============================================================
# AUTH ROUTES
# ============================================================
@app.post("/api/auth/login")
async def login(body: LoginRequest):
    # Check users table
    res = supabase.table("users").select("*").eq("email", body.email).execute()
    users = res.data or []

    matched = next((u for u in users if u.get("password") == body.password), None)
    if matched:
        safe = {k: v for k, v in matched.items() if k != "password"}
        return {"user": safe, "token": matched["id"]}

    # Check pending registration
    reg_res = supabase.table("registration_requests").select("*").eq("email", body.email).execute()
    regs = reg_res.data or []
    pending_reg = next((r for r in regs if r.get("password") == body.password), None)

    if pending_reg:
        status_val = pending_reg.get("status")
        if status_val == "pending":
            raise HTTPException(status_code=403, detail="Your registration is under review. Please wait for administrator approval.")
        elif status_val == "rejected":
            raise HTTPException(status_code=403, detail="Your registration request has been rejected.")

    raise HTTPException(status_code=401, detail="Invalid credentials")


# ============================================================
# USER ROUTES
# ============================================================
@app.get("/api/users/me")
async def get_me(user_id: str = Depends(get_user_id)):
    res = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = {k: v for k, v in res.data.items() if k != "password"}
    return user


@app.put("/api/users/me")
async def update_me(body: UserUpdate, user_id: str = Depends(get_user_id)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    # Map camelCase from frontend to snake_case DB columns
    field_map = {"instructorName": "instructor_name"}
    mapped = {}
    for k, v in updates.items():
        mapped[field_map.get(k, k)] = v
    if not mapped:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase.table("users").update(mapped).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = {k: v for k, v in res.data[0].items() if k != "password"}
    return user


# ============================================================
# REGISTRATION ROUTES
# ============================================================
@app.post("/api/registrations")
async def create_registration(body: RegistrationCreate):
    reg = {
        "id": gen_id("reg"),
        "full_name": body.fullName,
        "email": body.email,
        "password": body.password,
        "mobile": body.mobile,
        "college": body.college,
        "interested_course": body.interestedCourse,
        "status": "pending",
        "date": now_iso(),
    }
    res = supabase.table("registration_requests").insert(reg).execute()
    inserted = res.data[0] if res.data else reg
    # Return with camelCase for frontend compatibility
    return {"reg": {
        "id": inserted["id"],
        "fullName": inserted.get("full_name"),
        "email": inserted.get("email"),
        "status": inserted.get("status"),
        "date": inserted.get("date"),
    }}


@app.get("/api/admin/registrations")
async def get_registrations():
    res = supabase.table("registration_requests").select("*").order("date", desc=True).execute()
    # Map snake_case to camelCase for frontend
    rows = []
    for r in (res.data or []):
        rows.append({
            "id": r["id"],
            "fullName": r.get("full_name"),
            "email": r.get("email"),
            "password": r.get("password"),
            "mobile": r.get("mobile"),
            "college": r.get("college"),
            "interestedCourse": r.get("interested_course"),
            "status": r.get("status"),
            "date": r.get("date"),
            "approvalDate": r.get("approval_date"),
            "approvedBy": r.get("approved_by"),
            "rejectedDate": r.get("rejected_date"),
            "rejectedBy": r.get("rejected_by"),
            "reason": r.get("reason"),
            "comment": r.get("comment"),
        })
    return rows


@app.post("/api/admin/registrations/{reg_id}/approve")
async def approve_registration(reg_id: str, user_id: str = Depends(get_user_id)):
    # Fetch registration
    reg_res = supabase.table("registration_requests").select("*").eq("id", reg_id).single().execute()
    if not reg_res.data:
        raise HTTPException(status_code=404, detail="Registration not found")
    reg = reg_res.data

    # Create new student user
    new_student = {
        "id": gen_id("u"),
        "role": "student",
        "name": reg["full_name"],
        "email": reg["email"],
        "password": reg["password"],
        "mobile": reg.get("mobile"),
        "avatar": f"https://i.pravatar.cc/150?u={random.random()}",
        "xp": 0,
        "streak": 0,
        "theme": "light",
        "notifications": True,
    }
    supabase.table("users").insert(new_student).execute()

    # Enroll in interested course if exists
    if reg.get("interested_course"):
        course_res = supabase.table("courses").select("id").eq("title", reg["interested_course"]).execute()
        if course_res.data:
            course_id = course_res.data[0]["id"]
            supabase.table("enrollments").insert({
                "id": gen_id("e"),
                "student_id": new_student["id"],
                "course_id": course_id,
                "progress": 0,
                "enrolled_at": now_iso(),
            }).execute()

    # Add notification
    supabase.table("notifications").insert({
        "id": gen_id("n"),
        "student_id": new_student["id"],
        "title": "Registration Approved",
        "message": "Your registration has been approved.",
        "type": "system",
        "date": now_iso(),
        "read": False,
    }).execute()

    # Add activity
    supabase.table("activities").insert({
        "id": gen_id("act"),
        "student_id": new_student["id"],
        "title": "Account Created & Registered",
        "date": "Just now",
        "type": "system",
        "created_at": now_iso(),
    }).execute()

    # Update registration status
    supabase.table("registration_requests").update({
        "status": "approved",
        "approval_date": now_iso(),
        "approved_by": user_id,
    }).eq("id", reg_id).execute()

    safe_student = {k: v for k, v in new_student.items() if k != "password"}
    return {"success": True, "student": safe_student, "message": "Registration approved successfully."}


@app.post("/api/admin/registrations/{reg_id}/reject")
async def reject_registration(reg_id: str, body: RejectRequest, user_id: str = Depends(get_user_id)):
    reg_res = supabase.table("registration_requests").select("*").eq("id", reg_id).single().execute()
    if not reg_res.data:
        raise HTTPException(status_code=404, detail="Registration not found")
    reg = reg_res.data

    # Log notification
    supabase.table("notifications").insert({
        "id": gen_id("n"),
        "student_id": "non-user-log",
        "email_id": reg.get("email"),
        "title": "Registration Rejected",
        "message": f"Registration rejected for reason: {body.reason}",
        "type": "system",
        "date": now_iso(),
        "read": False,
    }).execute()

    # Update registration status
    supabase.table("registration_requests").update({
        "status": "rejected",
        "rejected_date": now_iso(),
        "rejected_by": user_id,
        "reason": body.reason,
        "comment": body.comment,
    }).eq("id", reg_id).execute()

    return {"success": True, "message": "Registration rejected successfully."}


# ============================================================
# COURSE ROUTES
# ============================================================
@app.get("/api/courses")
async def get_courses(user_id: str = Depends(get_user_id)):
    courses_res = supabase.table("courses").select("*").execute()
    courses = courses_res.data or []

    enrollments_res = supabase.table("enrollments").select("*").eq("student_id", user_id).execute()
    enrollments = enrollments_res.data or []

    apps_res = supabase.table("course_applications").select("*").eq("student_id", user_id).execute()
    applications = apps_res.data or []

    result = []
    for c in courses:
        enrollment = next((e for e in enrollments if e["course_id"] == c["id"]), None)
        app_entry = next((a for a in applications if a["course_id"] == c["id"]), None)
        result.append({
            "id": c["id"],
            "title": c["title"],
            "description": c["description"],
            "category": c["category"],
            "thumbnail": c["thumbnail"],
            "duration": c["duration"],
            "level": c["level"],
            "instructorName": c.get("instructor_name"),
            "tags": c.get("tags") or [],
            "progress": enrollment["progress"] if enrollment else None,
            "applicationStatus": app_entry["status"] if (app_entry and not enrollment) else None,
        })
    return result


@app.post("/api/courses/{course_id}/enroll")
async def enroll_course(course_id: str, user_id: str = Depends(get_user_id)):
    # Check if already enrolled
    existing = supabase.table("enrollments").select("id").eq("student_id", user_id).eq("course_id", course_id).execute()
    if not existing.data:
        supabase.table("enrollments").insert({
            "id": gen_id("e"),
            "student_id": user_id,
            "course_id": course_id,
            "progress": 0,
            "enrolled_at": now_iso(),
        }).execute()

        # Log activity
        course_res = supabase.table("courses").select("title").eq("id", course_id).single().execute()
        if course_res.data:
            supabase.table("activities").insert({
                "id": gen_id("act"),
                "student_id": user_id,
                "title": f"Enrolled in {course_res.data['title']}",
                "date": "Just now",
                "type": "lesson",
                "created_at": now_iso(),
            }).execute()

    return {"success": True}


@app.post("/api/courses/{course_id}/progress")
async def update_progress(course_id: str, body: ProgressUpdate, user_id: str = Depends(get_user_id)):
    progress = max(0, min(100, body.progress))
    supabase.table("enrollments").update({"progress": progress}).eq("student_id", user_id).eq("course_id", course_id).execute()
    # Give XP
    user_res = supabase.table("users").select("xp, role").eq("id", user_id).single().execute()
    if user_res.data and user_res.data.get("role") == "student":
        new_xp = (user_res.data.get("xp") or 0) + 10
        supabase.table("users").update({"xp": new_xp}).eq("id", user_id).execute()
    return {"success": True}


# ============================================================
# COURSE APPLICATION ROUTES
# ============================================================
@app.post("/api/course-applications")
async def apply_course(body: CourseApplicationCreate, user_id: str = Depends(get_user_id)):
    new_app = {
        "id": gen_id("ca"),
        "student_id": user_id,
        "course_id": body.courseId,
        "name": body.name,
        "status": "pending",
        "date": now_iso(),
    }
    res = supabase.table("course_applications").insert(new_app).execute()
    return {"success": True, "application": res.data[0] if res.data else new_app}


@app.get("/api/admin/course-applications")
async def get_course_applications():
    apps_res = supabase.table("course_applications").select("*").order("date", desc=True).execute()
    apps = apps_res.data or []

    result = []
    for app in apps:
        course_res = supabase.table("courses").select("title,instructor_name,duration").eq("id", app["course_id"]).execute()
        student_res = supabase.table("users").select("name").eq("id", app["student_id"]).execute()
        course = course_res.data[0] if course_res.data else {}
        student = student_res.data[0] if student_res.data else {}
        result.append({
            **app,
            "courseTitle": course.get("title", "Unknown Course"),
            "instructor": course.get("instructor_name", "Unknown"),
            "duration": course.get("duration", "Unknown"),
            "studentName": student.get("name") or app.get("name") or "Unknown",
        })
    return result


@app.post("/api/admin/course-applications/{app_id}/approve")
async def approve_course_application(app_id: str, user_id: str = Depends(get_user_id)):
    app_res = supabase.table("course_applications").select("*").eq("id", app_id).single().execute()
    if not app_res.data:
        raise HTTPException(status_code=404, detail="Course application not found")
    application = app_res.data

    course_res = supabase.table("courses").select("*").eq("id", application["course_id"]).single().execute()
    if not course_res.data:
        raise HTTPException(status_code=404, detail="Course not found")
    course = course_res.data

    student_id = application["student_id"]
    student_res = supabase.table("users").select("id").eq("id", student_id).single().execute()
    if not student_res.data:
        raise HTTPException(status_code=404, detail="Student account not found")

    # Auto-enroll
    existing = supabase.table("enrollments").select("id").eq("student_id", student_id).eq("course_id", application["course_id"]).execute()
    if not existing.data:
        supabase.table("enrollments").insert({
            "id": gen_id("e"),
            "student_id": student_id,
            "course_id": application["course_id"],
            "progress": 0,
            "enrolled_at": now_iso(),
        }).execute()

    # Notify student
    supabase.table("notifications").insert({
        "id": gen_id("n"),
        "student_id": student_id,
        "title": "Course Application Approved",
        "message": f"Your application for {course['title']} has been approved.",
        "type": "system",
        "date": now_iso(),
        "read": False,
    }).execute()

    # Add activity
    supabase.table("activities").insert({
        "id": gen_id("act"),
        "student_id": student_id,
        "title": f"Enrolled in {course['title']}",
        "date": "Just now",
        "type": "system",
        "created_at": now_iso(),
    }).execute()

    # Update application status
    supabase.table("course_applications").update({
        "status": "approved",
        "approval_date": now_iso(),
        "approved_by": user_id,
    }).eq("id", app_id).execute()

    return {"success": True, "message": "Course application approved successfully."}


@app.post("/api/admin/course-applications/{app_id}/reject")
async def reject_course_application(app_id: str, user_id: str = Depends(get_user_id)):
    app_res = supabase.table("course_applications").select("id").eq("id", app_id).single().execute()
    if not app_res.data:
        raise HTTPException(status_code=404, detail="Course application not found")

    supabase.table("course_applications").update({
        "status": "rejected",
        "rejected_date": now_iso(),
        "rejected_by": user_id,
    }).eq("id", app_id).execute()

    return {"success": True, "message": "Course application rejected successfully."}


# ============================================================
# ACTIVITIES
# ============================================================
@app.get("/api/activities")
async def get_activities(user_id: str = Depends(get_user_id)):
    res = supabase.table("activities").select("*").eq("student_id", user_id).order("created_at", desc=True).execute()
    return res.data or []


# ============================================================
# ACHIEVEMENTS
# ============================================================
@app.get("/api/achievements")
async def get_achievements():
    res = supabase.table("achievements").select("*").execute()
    return res.data or []


# ============================================================
# CERTIFICATES
# ============================================================
@app.get("/api/certificates")
async def get_certificates(user_id: str = Depends(get_user_id)):
    user_res = supabase.table("users").select("role").eq("id", user_id).single().execute()
    role = user_res.data.get("role") if user_res.data else "student"
    if role == "admin":
        res = supabase.table("certificates").select("*").execute()
    else:
        res = supabase.table("certificates").select("*").eq("student_id", user_id).execute()
    certs = res.data or []
    # Map to camelCase
    return [{
        "id": c["id"],
        "courseId": c.get("course_id"),
        "courseTitle": c.get("course_title"),
        "studentName": c.get("student_name"),
        "studentId": c.get("student_id"),
        "issueDate": c.get("issue_date"),
    } for c in certs]


@app.post("/api/admin/certificates")
async def create_certificate(body: CertificateCreate):
    student_res = supabase.table("users").select("name").eq("id", body.studentId).single().execute()
    course_res = supabase.table("courses").select("title").eq("id", body.courseId).single().execute()
    if not student_res.data or not course_res.data:
        raise HTTPException(status_code=404, detail="Student or course not found")

    cert = {
        "id": gen_id("cert"),
        "course_id": body.courseId,
        "course_title": course_res.data["title"],
        "student_name": student_res.data["name"],
        "student_id": body.studentId,
        "issue_date": now_iso(),
    }
    supabase.table("certificates").insert(cert).execute()

    # Add activity
    supabase.table("activities").insert({
        "id": gen_id("act"),
        "student_id": body.studentId,
        "title": f"Earned certificate for {course_res.data['title']}",
        "date": "Just now",
        "type": "certificate",
        "created_at": now_iso(),
    }).execute()

    return {
        "id": cert["id"],
        "courseId": cert["course_id"],
        "courseTitle": cert["course_title"],
        "studentName": cert["student_name"],
        "studentId": cert["student_id"],
        "issueDate": cert["issue_date"],
    }


@app.delete("/api/admin/certificates/{cert_id}")
async def delete_certificate(cert_id: str):
    supabase.table("certificates").delete().eq("id", cert_id).execute()
    return {"success": True}


# ============================================================
# MATERIALS
# ============================================================
@app.get("/api/materials")
async def get_materials():
    res = supabase.table("materials").select("*").execute()
    mats = res.data or []
    return [{
        "id": m["id"],
        "courseId": m.get("course_id"),
        "title": m.get("title"),
        "type": m.get("type"),
        "url": m.get("url"),
        "uploadedAt": m.get("uploaded_at"),
    } for m in mats]


@app.post("/api/admin/materials")
async def create_material(body: MaterialCreate):
    mat = {
        "id": gen_id("m"),
        "course_id": body.courseId,
        "title": body.title,
        "type": body.type,
        "url": body.url,
        "uploaded_at": now_iso(),
    }
    supabase.table("materials").insert(mat).execute()
    return {
        "id": mat["id"],
        "courseId": mat["course_id"],
        "title": mat["title"],
        "type": mat["type"],
        "url": mat["url"],
        "uploadedAt": mat["uploaded_at"],
    }


@app.delete("/api/admin/materials/{material_id}")
async def delete_material(material_id: str):
    supabase.table("materials").delete().eq("id", material_id).execute()
    return {"success": True}


# ============================================================
# QUIZZES
# ============================================================
@app.get("/api/quizzes")
async def get_quizzes():
    res = supabase.table("quizzes").select("*").execute()
    quizzes = res.data or []
    return [{
        "id": q["id"],
        "courseId": q.get("course_id"),
        "title": q.get("title"),
        "questions": q.get("questions") or [],
    } for q in quizzes]


@app.get("/api/quiz-attempts")
async def get_quiz_attempts(user_id: str = Depends(get_user_id)):
    user_res = supabase.table("users").select("role").eq("id", user_id).single().execute()
    role = user_res.data.get("role") if user_res.data else "student"
    if role == "admin":
        res = supabase.table("quiz_attempts").select("*").execute()
    else:
        res = supabase.table("quiz_attempts").select("*").eq("student_id", user_id).execute()
    attempts = res.data or []
    return [{
        "id": a["id"],
        "studentId": a.get("student_id"),
        "quizId": a.get("quiz_id"),
        "score": a.get("score"),
        "submittedAt": a.get("submitted_at"),
    } for a in attempts]


@app.post("/api/quizzes/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, body: QuizSubmit, user_id: str = Depends(get_user_id)):
    attempt = {
        "id": gen_id("qa"),
        "student_id": user_id,
        "quiz_id": quiz_id,
        "score": body.score,
        "submitted_at": now_iso(),
    }
    supabase.table("quiz_attempts").insert(attempt).execute()

    # Log activity
    quiz_res = supabase.table("quizzes").select("title").eq("id", quiz_id).single().execute()
    if quiz_res.data:
        supabase.table("activities").insert({
            "id": gen_id("act"),
            "student_id": user_id,
            "title": quiz_res.data["title"],
            "date": "Just now",
            "type": "quiz",
            "score": body.score,
            "created_at": now_iso(),
        }).execute()

    # Give XP
    user_res = supabase.table("users").select("xp, role").eq("id", user_id).single().execute()
    if user_res.data and user_res.data.get("role") == "student":
        new_xp = (user_res.data.get("xp") or 0) + round(body.score)
        supabase.table("users").update({"xp": new_xp}).eq("id", user_id).execute()

    return {"success": True}


@app.post("/api/admin/quizzes")
async def create_quiz(body: QuizCreate):
    quiz = {
        "id": gen_id("q"),
        "course_id": body.courseId,
        "title": body.title,
        "questions": body.questions or [],
    }
    supabase.table("quizzes").insert(quiz).execute()
    return {
        "id": quiz["id"],
        "courseId": quiz["course_id"],
        "title": quiz["title"],
        "questions": quiz["questions"],
    }


@app.delete("/api/admin/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str):
    supabase.table("quiz_attempts").delete().eq("quiz_id", quiz_id).execute()
    supabase.table("quizzes").delete().eq("id", quiz_id).execute()
    return {"success": True}


# ============================================================
# ADMIN — STATS
# ============================================================
@app.get("/api/admin/stats")
async def admin_stats():
    users_res = supabase.table("users").select("id, role").execute()
    users_all = users_res.data or []
    students = [u for u in users_all if u.get("role") == "student"]

    courses_res = supabase.table("courses").select("id").execute()
    enrollments_res = supabase.table("enrollments").select("progress").execute()
    quiz_res = supabase.table("quiz_attempts").select("id").execute()
    certs_res = supabase.table("certificates").select("id").execute()
    regs_res = supabase.table("registration_requests").select("status, date").execute()
    apps_res = supabase.table("course_applications").select("status, date").execute()

    enrollments = enrollments_res.data or []
    regs = regs_res.data or []
    apps = apps_res.data or []

    now = datetime.now(timezone.utc)
    week_ago = now.timestamp() - 7 * 24 * 60 * 60

    def is_today(d_str):
        try:
            d = datetime.fromisoformat(d_str.replace("Z", "+00:00"))
            return d.date() == now.date()
        except Exception:
            return False

    def is_this_week(d_str):
        try:
            d = datetime.fromisoformat(d_str.replace("Z", "+00:00"))
            return d.timestamp() >= week_ago
        except Exception:
            return False

    return {
        "totalStudents": len(students),
        "totalCourses": len(courses_res.data or []),
        "activeEnrollments": len(enrollments),
        "completedCourses": sum(1 for e in enrollments if e.get("progress") == 100),
        "quizAttempts": len(quiz_res.data or []),
        "certificatesIssued": len(certs_res.data or []),
        "pendingRegistrations": sum(1 for r in regs if r.get("status") == "pending"),
        "approvedRegistrations": sum(1 for r in regs if r.get("status") == "approved"),
        "rejectedRegistrations": sum(1 for r in regs if r.get("status") == "rejected"),
        "todayRegistrations": sum(1 for r in regs if is_today(r.get("date", ""))),
        "weeklyRegistrations": sum(1 for r in regs if is_this_week(r.get("date", ""))),
        "pendingCourseApplications": sum(1 for a in apps if a.get("status") == "pending"),
        "approvedCourseApplications": sum(1 for a in apps if a.get("status") == "approved"),
        "rejectedCourseApplications": sum(1 for a in apps if a.get("status") == "rejected"),
        "todayCourseApplications": sum(1 for a in apps if is_today(a.get("date", ""))),
        "weeklyCourseApplications": sum(1 for a in apps if is_this_week(a.get("date", ""))),
    }


# ============================================================
# ADMIN — USERS
# ============================================================
@app.get("/api/admin/users")
async def get_admin_users():
    res = supabase.table("users").select("*").execute()
    return [{k: v for k, v in u.items() if k != "password"} for u in (res.data or [])]


@app.delete("/api/admin/users/{target_id}")
async def delete_user(target_id: str):
    # Don't delete admins
    user_res = supabase.table("users").select("role").eq("id", target_id).single().execute()
    if user_res.data and user_res.data.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin users")

    # Cascade deletes
    supabase.table("enrollments").delete().eq("student_id", target_id).execute()
    supabase.table("quiz_attempts").delete().eq("student_id", target_id).execute()
    supabase.table("certificates").delete().eq("student_id", target_id).execute()
    supabase.table("activities").delete().eq("student_id", target_id).execute()
    supabase.table("notifications").delete().eq("student_id", target_id).execute()
    supabase.table("users").delete().eq("id", target_id).execute()
    return {"success": True}


# ============================================================
# ADMIN — COURSES
# ============================================================
@app.post("/api/admin/courses")
async def create_course(body: CourseCreate):
    course = {
        "id": gen_id("c"),
        "title": body.title,
        "description": body.description,
        "category": body.category,
        "thumbnail": body.thumbnail,
        "duration": body.duration,
        "level": body.level,
        "instructor_name": body.instructorName,
        "tags": body.tags or [],
    }
    res = supabase.table("courses").insert(course).execute()
    inserted = res.data[0] if res.data else course
    return {
        "id": inserted["id"],
        "title": inserted["title"],
        "description": inserted.get("description"),
        "category": inserted.get("category"),
        "thumbnail": inserted.get("thumbnail"),
        "duration": inserted.get("duration"),
        "level": inserted.get("level"),
        "instructorName": inserted.get("instructor_name"),
        "tags": inserted.get("tags") or [],
    }


@app.put("/api/admin/courses/{course_id}")
async def update_course(course_id: str, body: CourseUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    field_map = {"instructorName": "instructor_name"}
    mapped = {field_map.get(k, k): v for k, v in updates.items()}
    if not mapped:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase.table("courses").update(mapped).eq("id", course_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Course not found")
    c = res.data[0]
    return {
        "id": c["id"],
        "title": c["title"],
        "description": c.get("description"),
        "category": c.get("category"),
        "thumbnail": c.get("thumbnail"),
        "duration": c.get("duration"),
        "level": c.get("level"),
        "instructorName": c.get("instructor_name"),
        "tags": c.get("tags") or [],
    }


@app.delete("/api/admin/courses/{course_id}")
async def delete_course(course_id: str):
    supabase.table("enrollments").delete().eq("course_id", course_id).execute()
    supabase.table("materials").delete().eq("course_id", course_id).execute()
    supabase.table("quizzes").delete().eq("course_id", course_id).execute()
    supabase.table("course_applications").delete().eq("course_id", course_id).execute()
    supabase.table("certificates").delete().eq("course_id", course_id).execute()
    supabase.table("courses").delete().eq("id", course_id).execute()
    return {"success": True}


# ============================================================
# NOTIFICATIONS
# ============================================================
@app.get("/api/notifications")
async def get_notifications(user_id: str = Depends(get_user_id)):
    res = supabase.table("notifications").select("*").eq("student_id", user_id).order("date", desc=True).execute()
    return res.data or []


@app.post("/api/admin/notifications")
async def send_notification(body: NotificationCreate):
    notif = {
        "id": gen_id("n"),
        "student_id": body.studentId,
        "title": body.title,
        "message": body.message,
        "type": body.type,
        "date": now_iso(),
        "read": False,
    }
    supabase.table("notifications").insert(notif).execute()
    return {"success": True, "notification": notif}


# ============================================================
# AI — GEMINI ROUTES
# ============================================================
@app.post("/api/gemini/summarize")
async def gemini_summarize(body: SummarizeRequest):
    genai = get_gemini_client()
    if genai:
        try:
            model = genai.GenerativeModel(
                model_name="gemini-3.5-flash",
                system_instruction="You are an expert technical instructor generating short, punchy summaries. Respond ONLY with a valid JSON array of strings, no markdown code fences.",
            )
            response = model.generate_content(
                f'Provide a very concise bulleted summary (3-5 bullet points) for a hypothetical lesson titled "{body.lessonTitle}" in the course "{body.courseTitle}". Format as a JSON array of strings.'
            )
            text = response.text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
            summary = json.loads(text)
            return {"summary": summary}
        except Exception as e:
            return {"summary": [f"AI error: {str(e)}"]}
    else:
        return {"summary": [
            f"This lesson covers the core concepts of **{body.lessonTitle}**.",
            "Key principles are explored with practical examples.",
            "You will apply these skills in hands-on exercises.",
            "Real-world use cases are discussed to reinforce learning.",
            "A quiz is available to test your understanding.",
        ]}


@app.post("/api/gemini/chat")
async def gemini_chat(body: ChatRequest, user_id: str = Depends(get_user_id)):
    # Build student context
    student_res = supabase.table("users").select("*").eq("id", user_id).execute()
    student_user = (student_res.data or [{}])[0]

    enrollments_res = supabase.table("enrollments").select("*").eq("student_id", user_id).execute()
    certs_res = supabase.table("certificates").select("*").eq("student_id", user_id).execute()
    courses_res = supabase.table("courses").select("*").execute()
    quizzes_res = supabase.table("quizzes").select("*").execute()
    materials_res = supabase.table("materials").select("*").execute()

    all_courses = courses_res.data or []
    enrollments = enrollments_res.data or []
    certificates = certs_res.data or []
    quizzes = quizzes_res.data or []
    materials = materials_res.data or []

    enrolled_courses_detail = []
    for e in enrollments:
        c = next((x for x in all_courses if x["id"] == e["course_id"]), None)
        if c:
            enrolled_courses_detail.append({
                "title": c.get("title"),
                "progress": e.get("progress"),
                "instructor": c.get("instructor_name"),
                "level": c.get("level"),
                "duration": c.get("duration"),
            })

    enrolled_ids = {e["course_id"] for e in enrollments}
    recommended = [{"title": c.get("title"), "instructor": c.get("instructor_name"), "category": c.get("category"), "level": c.get("level")} for c in all_courses if c["id"] not in enrolled_ids]
    certs_detail = [{"courseTitle": c.get("course_title"), "issueDate": c.get("issue_date")} for c in certificates]

    context = {
        "studentName": student_user.get("name", "Student"),
        "xp": student_user.get("xp", 0),
        "streak": student_user.get("streak", 0),
        "enrolledCourses": enrolled_courses_detail,
        "recommendedCourses": recommended,
        "certificates": certs_detail,
        "quizzes": [{"title": q.get("title"), "courseTitle": next((c.get("title") for c in all_courses if c["id"] == q.get("course_id")), None)} for q in quizzes],
        "materials": [{"title": m.get("title"), "courseTitle": next((c.get("title") for c in all_courses if c["id"] == m.get("course_id")), None), "type": m.get("type")} for m in materials],
    }

    genai = get_gemini_client()
    if genai:
        try:
            system_instruction = f"""You are "AURA Learning Assistant", a supportive, super-intelligent technical study companion for the student named {context['studentName']}.
Your tone is friendly, technical, empowering, and highly helpful.
BE EXTREMELY BRIEF AND CONCISE. Give only the main points in a short, punchy response (1-2 sentences maximum). Use bullet points if necessary. Speed and brevity are your highest priorities. Do NOT give long explanations.

Current Student Context:
- Student Name: {context['studentName']}
- Current Streak: {context['streak']} days
- Experience Points (XP): {context['xp']} XP
- Enrolled Courses: {json.dumps(context['enrolledCourses'])}
- Recommended Courses (not enrolled): {json.dumps(context['recommendedCourses'])}
- Earned Certificates: {json.dumps(context['certificates'])}
- Available Quizzes: {json.dumps(context['quizzes'])}
- Available Materials: {json.dumps(context['materials'])}"""

            model = genai.GenerativeModel(
                model_name="gemini-3.5-flash",
                system_instruction=system_instruction,
                generation_config={"temperature": 0.7}
            )
            history_formatted = [
                {"role": h.role if h.role in ("user", "model") else "user", "parts": [h.text]}
                for h in (body.history or [])
            ]
            chat = model.start_chat(history=history_formatted)
            response = chat.send_message(body.message)
            return {"text": response.text}
        except Exception as e:
            return {"text": f"AI temporarily unavailable: {str(e)}"}
    else:
        # Fallback mock
        name = context["studentName"]
        return {"text": f"Hello **{name}**! I'm your AURA AI Study Companion. 🎓\n\nI can help you master complex programming concepts, guide you through your course material, suggest personalized study calendars, or help you prep for upcoming quizzes.\n\nFeel free to ask any specific academic or technical questions! *(Set GEMINI_API_KEY in backend/.env to enable full AI responses.)*"}


@app.post("/api/gemini/admin-chat")
async def gemini_admin_chat(body: ChatRequest, user_id: str = Depends(get_user_id)):
    # Build admin context from real Supabase data
    stats_response = await admin_stats()

    all_courses = (supabase.table("courses").select("id, title").execute().data or [])
    enrollments_all = (supabase.table("enrollments").select("course_id").execute().data or [])
    pending_regs = supabase.table("registration_requests").select("full_name, email, college").eq("status", "pending").execute().data or []
    pending_apps_raw = supabase.table("course_applications").select("student_id, course_id").eq("status", "pending").execute().data or []

    # Enrollment counts per course
    enroll_count: dict = {}
    for c in all_courses:
        enroll_count[c["id"]] = 0
    for e in enrollments_all:
        cid = e.get("course_id")
        if cid in enroll_count:
            enroll_count[cid] += 1

    highest_course = "None"
    lowest_course = "None"
    highest_count = -1
    lowest_count = float("inf")
    for c in all_courses:
        cnt = enroll_count.get(c["id"], 0)
        if cnt > highest_count:
            highest_count = cnt
            highest_course = c["title"]
        if cnt < lowest_count:
            lowest_count = cnt
            lowest_course = c["title"]

    # Build pending applications detail
    pending_apps_detail = []
    for a in pending_apps_raw:
        student = supabase.table("users").select("name").eq("id", a["student_id"]).execute().data
        course = supabase.table("courses").select("title").eq("id", a["course_id"]).execute().data
        pending_apps_detail.append({
            "studentName": student[0]["name"] if student else "Unknown",
            "courseTitle": course[0]["title"] if course else "Unknown",
        })

    admin_context = {
        **stats_response,
        "highestEnrollmentCourse": highest_course,
        "highestEnrollmentCount": highest_count,
        "lowestEnrollmentCourse": lowest_course,
        "lowestEnrollmentCount": lowest_count if lowest_count != float("inf") else 0,
        "pendingStudentsList": [{"name": r.get("full_name"), "email": r.get("email"), "college": r.get("college")} for r in pending_regs],
        "pendingApplicationsList": pending_apps_detail,
    }

    genai = get_gemini_client()
    if genai:
        try:
            system_instruction = f"""You are "AURA Admin Assistant", an elite, super-intelligent administrative intelligence system and management companion.
Your tone is professional, technical, precise, and highly analytical.
BE EXTREMELY BRIEF AND CONCISE. Give only the main points in a short, punchy response (1-2 sentences maximum). Use bullet points if necessary. Speed and brevity are your highest priorities. Do NOT give long explanations.

Platform Administrative State:
- Total Enrolled Students (Active): {admin_context['totalStudents']}
- Courses Available: {admin_context['totalCourses']}
- Total Active Enrollments: {admin_context['activeEnrollments']}
- Quiz Attempts: {admin_context['quizAttempts']}
- Certificates Issued: {admin_context['certificatesIssued']}
- Pending Student Registrations: {admin_context['pendingRegistrations']}
- Approved Student Registrations: {admin_context['approvedRegistrations']}
- Rejected Student Registrations: {admin_context['rejectedRegistrations']}
- Pending Course Enrolment Applications: {admin_context['pendingCourseApplications']}
- Approved Course Enrolment Applications: {admin_context['approvedCourseApplications']}
- Rejected Course Enrolment Applications: {admin_context['rejectedCourseApplications']}
- Highest Enrolled Course: {admin_context['highestEnrollmentCourse']} ({admin_context['highestEnrollmentCount']} enrollments)
- Lowest Enrolled Course: {admin_context['lowestEnrollmentCourse']} ({admin_context['lowestEnrollmentCount']} enrollments)
- Pending Registration Requests: {json.dumps(admin_context['pendingStudentsList'])}
- Pending Course Applications List: {json.dumps(admin_context['pendingApplicationsList'])}"""

            model = genai.GenerativeModel(
                model_name="gemini-3.5-flash",
                system_instruction=system_instruction,
                generation_config={"temperature": 0.2}
            )
            history_formatted = [
                {"role": h.role if h.role in ("user", "model") else "user", "parts": [h.text]}
                for h in (body.history or [])
            ]
            chat = model.start_chat(history=history_formatted)
            response = chat.send_message(body.message)
            return {"text": response.text}
        except Exception as e:
            return {"text": f"AI temporarily unavailable: {str(e)}"}
    else:
        return {"text": f"""Welcome back, Admin.\n\nToday's Platform Summary:\n• **Active Students**: `{admin_context['totalStudents']}`\n• **Pending Approvals**: `{admin_context['pendingRegistrations'] + admin_context['pendingCourseApplications']}`\n• **Courses Available**: `{admin_context['totalCourses']}`\n• **Certificates Issued**: `{admin_context['certificatesIssued']}`\n\n*Set GEMINI_API_KEY in backend/.env to enable full AI responses.*"""}


# ============================================================
# ROOT
# ============================================================
@app.get("/")
async def root():
    return {"message": "Master LMS API is running 🚀", "version": "2.0.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
