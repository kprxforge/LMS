from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ---- Auth ----
class LoginRequest(BaseModel):
    email: str
    password: str


# ---- User ----
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    theme: Optional[str] = None
    notifications: Optional[bool] = None
    xp: Optional[int] = None
    streak: Optional[int] = None


# ---- Registration ----
class RegistrationCreate(BaseModel):
    fullName: str
    email: str
    password: str
    mobile: Optional[str] = None
    college: Optional[str] = None
    interestedCourse: Optional[str] = None


class RejectRequest(BaseModel):
    reason: Optional[str] = "Unknown"
    comment: Optional[str] = ""


# ---- Course ----
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    instructorName: Optional[str] = None
    tags: Optional[List[str]] = []


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    instructorName: Optional[str] = None
    tags: Optional[List[str]] = None


class ProgressUpdate(BaseModel):
    progress: int


# ---- Course Application ----
class CourseApplicationCreate(BaseModel):
    courseId: str
    name: Optional[str] = None


# ---- Materials ----
class MaterialCreate(BaseModel):
    courseId: str
    title: str
    type: Optional[str] = "pdf"
    url: Optional[str] = "#"


# ---- Quizzes ----
class QuizCreate(BaseModel):
    courseId: str
    title: str
    questions: Optional[List[Any]] = []


class QuizSubmit(BaseModel):
    score: float


# ---- Certificates ----
class CertificateCreate(BaseModel):
    studentId: str
    courseId: str


# ---- Notifications ----
class NotificationCreate(BaseModel):
    studentId: Optional[str] = None
    title: str
    message: Optional[str] = None
    type: Optional[str] = "system"


# ---- AI ----
class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class SummarizeRequest(BaseModel):
    lessonTitle: str
    courseTitle: str
