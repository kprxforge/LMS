import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === AI SETUP ===
  let ai: GoogleGenAI | null = null;
  function getAIClient() {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
    }
    return ai;
  }

  // === MOCK DATABASE ===
  let registrationRequests: any[] = [];
  let users = [
    {
      id: "u1",
      role: "student",
      name: "Alex Dev",
      email: "student@example.com",
      password: "password",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      xp: 2450,
      streak: 12,
      theme: "light",
      notifications: true,
    },
    {
      id: "u2",
      role: "student",
      name: "Taylor Swift",
      email: "taylor@example.com",
      password: "password",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024e",
      xp: 1200,
      streak: 3,
      theme: "dark",
      notifications: true,
    },
    {
      id: "a1",
      role: "admin",
      name: "Super Admin",
      email: "admin@auralms.com",
      password: "admin123",
      avatar: "https://i.pravatar.cc/150?u=admin",
      theme: "light",
      notifications: true,
    }
  ];

  let courses = [
    {
      id: "c1",
      title: "Advanced Full-Stack System Design",
      description: "Learn how to architect scalable SaaS platforms.",
      category: "Engineering",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
      duration: "12h 30m",
      level: "Advanced",
      instructorName: "Sarah Jenkins",
      tags: ["System Design", "Architecture"]
    },
    {
      id: "c2",
      title: "React & Node.js Masterclass",
      description: "Build robust frontend and backend services.",
      category: "Web Development",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
      duration: "8h 15m",
      level: "Intermediate",
      instructorName: "Michael Chen",
      tags: ["React", "Express"]
    },
    {
      id: "c3",
      title: "Python Full Stack",
      description: "Comprehensive guide to full stack python development.",
      category: "Engineering",
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800",
      duration: "20h 00m",
      level: "Beginner",
      instructorName: "Alex Turner",
      tags: ["Python", "Django", "React"]
    },
    {
      id: "c4",
      title: "Artificial Intelligence",
      description: "Introductory and advanced AI concepts.",
      category: "Data Science",
      thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800",
      duration: "15h 45m",
      level: "Advanced",
      instructorName: "Dr. Elena Rostova",
      tags: ["AI", "Machine Learning", "Deep Learning"]
    },
    {
      id: "c5",
      title: "Data Science",
      description: "Data analysis, visualization, and manipulation.",
      category: "Data Science",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      duration: "18h 20m",
      level: "Intermediate",
      instructorName: "Marcus Webb",
      tags: ["Data", "Analysis", "Python"]
    },
    {
      id: "c6",
      title: "Cloud Computing",
      description: "Mastering AWS, GCP, and Azure basics.",
      category: "Engineering",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      duration: "10h 10m",
      level: "Intermediate",
      instructorName: "Samantha Lee",
      tags: ["Cloud", "AWS", "Deployment"]
    }
  ];

  let enrollments = [
    { id: "e1", studentId: "u1", courseId: "c1", progress: 65, enrolledAt: "2023-01-01T00:00:00Z" },
    { id: "e2", studentId: "u1", courseId: "c2", progress: 100, enrolledAt: "2023-02-01T00:00:00Z" }
  ];

  let courseApplications: any[] = [];

  let materials = [
    { id: "m1", courseId: "c1", title: "System Architecture Diagram", type: "pdf", url: "#", uploadedAt: new Date().toISOString() },
    { id: "m2", courseId: "c2", title: "React Component Lifecycle", type: "video", url: "#", uploadedAt: new Date().toISOString() }
  ];

  let quizzes = [
    { id: "q1", courseId: "c2", title: "React Basics Quiz", questions: [{ q: "What is JSX?", options: ["Syntax", "Language"], correct: 0 }] }
  ];

  let quizAttempts = [
    { id: "qa1", studentId: "u1", quizId: "q1", score: 92, submittedAt: new Date().toISOString() }
  ];

  let certificatesData = [
    {
      id: "cert1",
      courseId: "c2",
      courseTitle: "React & Node.js Masterclass",
      studentName: "Alex Dev",
      studentId: "u1",
      issueDate: "2023-10-20"
    }
  ];

  let activities = [
    { id: "a1", studentId: "u1", title: "React Basics Quiz", date: "2 hours ago", type: "quiz", score: 92 },
    { id: "a2", studentId: "u1", title: "Earned Frontend Certificate", date: "Last week", type: "certificate" },
  ];

  let notificationsData: any[] = [];

  let achievementsData = [
    { id: "badge1", title: "First Blood", description: "Completed your first quiz", icon: "Target", unlockedAt: "2023-10-01" },
    { id: "badge2", title: "Week Warrior", description: "Maintained a 7-day streak", icon: "Flame", unlockedAt: "2023-10-08" },
  ];

  function generateId(prefix: string) {
    return prefix + Math.random().toString(36).substr(2, 9);
  }

  function getUserId(req: any) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      return auth.split(" ")[1];
    }
    // Fallback for simplicity during development or if headers are missing
    return "u1"; 
  }

  // === REST APIs ===
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token: user.id }); // Using ID as token
    } else {
      const pendingReg = registrationRequests.find(r => r.email === email && r.password === password);
      if (pendingReg && pendingReg.status === "pending") {
        res.status(403).json({ error: "Your registration is under review. Please wait for administrator approval." });
      } else if (pendingReg && pendingReg.status === "rejected") {
        res.status(403).json({ error: "Your registration request has been rejected." });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  });

  app.get("/api/users/me", (req, res) => {
    const userId = getUserId(req);
    const user = users.find(u => u.id === userId);
    if (user) {
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.put("/api/users/me", (req, res) => {
    const userId = getUserId(req);
    const updates = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      const { password: _, ...safeUser } = users[userIndex];
      res.json(safeUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // REGISTRATION ROUTES
  app.post("/api/registrations", (req, res) => {
    const reg = {
      ...req.body,
      id: generateId("reg"),
      status: "pending",
      date: new Date().toISOString()
    };
    registrationRequests.push(reg);
    res.json({ reg });
  });

  app.get("/api/admin/registrations", (req, res) => {
    res.json(registrationRequests);
  });

  app.post("/api/admin/registrations/:id/approve", (req, res) => {
    try {
      const id = req.params.id;
      if (!id) throw new Error("Registration ID missing");

      const reqIndex = registrationRequests.findIndex(r => r.id === id);
      if (reqIndex === -1) throw new Error("Registration object not found in database");

      const reg = registrationRequests[reqIndex];
      const originalStatus = reg.status;

      const usersLength = users.length;
      const enrollmentsLength = enrollments.length;
      const notificationsLength = notificationsData.length;
      const activitiesLength = activities.length;

      try {
        reg.status = "approved";
        reg.approvalDate = new Date().toISOString();
        reg.approvedBy = getUserId(req) || "admin";
        
        // Create student
        const newStudent = {
          id: generateId("u"),
          role: "student",
          name: reg.fullName,
          email: reg.email,
          password: reg.password,
          mobile: reg.mobile,
          avatar: "https://i.pravatar.cc/150?u=" + Math.random(),
          xp: 0,
          streak: 0,
          theme: "light",
          notifications: true,
        };
        users.push(newStudent);

        // Create enrollment for interested course
        const matchedCourse = courses.find(c => c.title === reg.interestedCourse);
        if (matchedCourse) {
          enrollments.push({
            id: generateId("e"),
            studentId: newStudent.id,
            courseId: matchedCourse.id,
            progress: 0,
            enrolledAt: new Date().toISOString()
          });
        }

        // Notification log
        notificationsData.push({
          id: generateId("n"),
          studentId: newStudent.id,
          title: "Registration Approved",
          message: "Your registration has been approved.",
          type: "system",
          date: new Date().toISOString(),
          read: false
        });

        // Activity log
        activities.unshift({
          id: generateId("a"),
          studentId: newStudent.id,
          title: "Account Created & Registered",
          date: "Just now",
          type: "system"
        });

        res.json({ success: true, student: newStudent, message: "Registration approved successfully." });
      } catch (innerError) {
        // Rollback memory state
        reg.status = originalStatus;
        delete reg.approvalDate;
        delete reg.approvedBy;
        
        users.length = usersLength;
        enrollments.length = enrollmentsLength;
        notificationsData.length = notificationsLength;
        if (activities.length > activitiesLength) {
          activities.shift();
        }
        
        throw innerError;
      }
    } catch (err: any) {
      console.error("Critical Error Approving:", err);
      res.status(500).json({ success: false, error: err.message || "Error Approving" });
    }
  });

  app.post("/api/admin/registrations/:id/reject", (req, res) => {
    try {
      const id = req.params.id;
      if (!id) throw new Error("Registration ID missing");

      const reqIndex = registrationRequests.findIndex(r => r.id === id);
      if (reqIndex === -1) throw new Error("Registration object not found in database");

      const reg = registrationRequests[reqIndex];
      const originalStatus = reg.status;

      const notificationsLength = notificationsData.length;

      try {
        reg.status = "rejected";
        reg.rejectedDate = new Date().toISOString();
        reg.rejectedBy = getUserId(req) || "admin";
        reg.reason = req.body.reason || 'Unknown';
        reg.comment = req.body.comment || '';
        
        // Save simulated WhatsApp message to Notification Logs for audit trail
        notificationsData.push({
          id: generateId("n"),
          studentId: "non-user-log",
          emailId: reg.email,
          title: "Registration Rejected",
          message: "Registration rejected for reason: " + reg.reason,
          type: "system",
          date: new Date().toISOString(),
          read: false
        });
        
        res.json({ success: true, message: "Registration rejected successfully." });
      } catch (innerError) {
        // Rollback memory state
        reg.status = originalStatus;
        delete reg.rejectedDate;
        delete reg.rejectedBy;
        delete reg.reason;
        delete reg.comment;
        notificationsData.length = notificationsLength;
        throw innerError;
      }
    } catch (err: any) {
      console.error("Critical Error Rejecting:", err);
      res.status(500).json({ success: false, error: err.message || "Error Rejecting" });
    }
  });

  // STUDENT ROUTES
  app.get("/api/courses", (req, res) => {
    const userId = getUserId(req);
    // Add progress and application status to courses for the specific student
    const result = courses.map(c => {
      const enrollment = enrollments.find(e => e.studentId === userId && e.courseId === c.id);
      
      let applicationStatus = null;
      if (!enrollment) {
        // If they are not enrolled, check if they applied
        // Check both course applications AND initial registration if the course matches
        const courseApp = courseApplications.find(a => a.studentId === userId && a.courseId === c.id);
        if (courseApp) {
          applicationStatus = courseApp.status;
        } else {
          // Check if this was their interested course at registration and registration is pending
          // But wait, if registration is pending, they shouldn't even be logged in yet.
          // Since they are logged in, registration must be approved.
          // Wait, actually, if they are logged in but enrolled, it will have progress.
        }
      }
      return { 
        ...c, 
        progress: enrollment ? enrollment.progress : undefined, 
        applicationStatus: applicationStatus 
      };
    });
    res.json(result);
  });

  app.post("/api/courses/:id/enroll", (req, res) => {
    const userId = getUserId(req);
    const courseId = req.params.id;
    const existing = enrollments.find(e => e.courseId === courseId && e.studentId === userId);
    if (!existing) {
      enrollments.push({
        id: generateId("e"),
        studentId: userId,
        courseId,
        progress: 0,
        enrolledAt: new Date().toISOString()
      });
      // also log activity
      const course = courses.find(c => c.id === courseId);
      if (course) {
        activities.unshift({
          id: generateId("a"),
          studentId: userId,
          title: `Enrolled in ${course.title}`,
          date: "Just now",
          type: "lesson"
        });
      }
    }
    res.json({ success: true });
  });

  app.post("/api/course-applications", (req, res) => {
    const userId = getUserId(req);
    const newApp = {
      id: generateId("ca"),
      studentId: userId,
      status: "pending",
      date: new Date().toISOString(),
      ...req.body
    };
    courseApplications.push(newApp);
    res.json({ success: true, application: newApp });
  });

  app.get("/api/admin/course-applications", (req, res) => {
    const enriched = courseApplications.map(app => {
      const course = courses.find(c => c.id === app.courseId);
      const student = users.find(u => u.id === app.studentId);
      return {
        ...app,
        courseTitle: course ? course.title : "Unknown Course",
        instructor: course ? course.instructorName : "Unknown",
        duration: course ? course.duration : "Unknown",
        studentName: student ? student.name : app.name || "Unknown"
      };
    });
    res.json(enriched);
  });

  app.post("/api/admin/course-applications/:id/approve", (req, res) => {
    try {
      const id = req.params.id;
      if (!id) throw new Error("Application ID missing");

      const appIndex = courseApplications.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error("Course application not found in database");

      const application = courseApplications[appIndex];
      const originalStatus = application.status;
      const enrollmentsLength = enrollments.length;
      const notificationsLength = notificationsData.length;
      const activitiesLength = activities.length;

      try {
        application.status = "approved";
        application.approvalDate = new Date().toISOString();
        application.approvedBy = getUserId(req) || "admin";
        
        const course = courses.find(c => c.id === application.courseId);
        if (!course) throw new Error("Course not found");

        const studentId = application.studentId || "u1";
        const student = users.find(u => u.id === studentId);
        if (!student) throw new Error("Student account not found");
        
        // automatic enrollment
        if (!enrollments.find(e => e.studentId === studentId && e.courseId === application.courseId)) {
          enrollments.push({
            id: generateId("e"),
            studentId: studentId,
            courseId: application.courseId,
            progress: 0,
            enrolledAt: new Date().toISOString()
          });
        }

        // Add notification log
        notificationsData.push({
          id: generateId("n"),
          studentId: studentId,
          title: "Course Application Approved",
          message: `Your application for ${course?.title || 'the course'} has been approved.`,
          type: "system",
          date: new Date().toISOString(),
          read: false
        });

        // Add activity
        activities.unshift({
          id: generateId("a"),
          studentId: studentId,
          title: `Enrolled in ${course.title}`,
          date: "Just now",
          type: "system"
        });

        res.json({ success: true, message: "Course application approved successfully." });
      } catch (innerError) {
        application.status = originalStatus;
        delete application.approvalDate;
        delete application.approvedBy;
        enrollments.length = enrollmentsLength;
        notificationsData.length = notificationsLength;
        if (activities.length > activitiesLength) {
          activities.shift();
        }
        throw innerError;
      }
    } catch (err: any) {
      console.error("Critical Error Approving Course App:", err);
      res.status(500).json({ success: false, error: err.message || "Error Approving" });
    }
  });

  app.post("/api/admin/course-applications/:id/reject", (req, res) => {
    try {
      const id = req.params.id;
      if (!id) throw new Error("Application ID missing");

      const appIndex = courseApplications.findIndex(a => a.id === id);
      if (appIndex === -1) throw new Error("Course application not found in database");

      const application = courseApplications[appIndex];
      const originalStatus = application.status;

      try {
        application.status = "rejected";
        application.rejectedDate = new Date().toISOString();
        application.rejectedBy = getUserId(req) || "admin";
        
        res.json({ success: true, message: "Course application rejected successfully." });
      } catch (innerError) {
        application.status = originalStatus;
        delete application.rejectedDate;
        delete application.rejectedBy;
        throw innerError;
      }
    } catch (err: any) {
      console.error("Critical Error Rejecting Course App:", err);
      res.status(500).json({ success: false, error: err.message || "Error Rejecting" });
    }
  });

  app.post("/api/courses/:id/progress", (req, res) => {
    const userId = getUserId(req);
    const courseId = req.params.id;
    const { progress } = req.body;
    const enrollment = enrollments.find(e => e.courseId === courseId && e.studentId === userId);
    if (enrollment) {
      enrollment.progress = Math.min(100, Math.max(0, progress));
      // Give XP
      const user = users.find(u => u.id === userId);
      if (user && user.role === "student") user.xp += 10;
    }
    res.json({ success: true });
  });

  app.get("/api/activities", (req, res) => {
    const userId = getUserId(req);
    res.json(activities.filter(a => a.studentId === userId));
  });

  app.get("/api/achievements", (req, res) => {
    res.json(achievementsData);
  });

  app.get("/api/certificates", (req, res) => {
    const userId = getUserId(req);
    const userRole = users.find(u => u.id === userId)?.role;
    if (userRole === "admin") {
      res.json(certificatesData);
    } else {
      res.json(certificatesData.filter(c => c.studentId === userId));
    }
  });

  app.get("/api/materials", (req, res) => {
    res.json(materials);
  });

  app.get("/api/quizzes", (req, res) => {
    res.json(quizzes);
  });

  app.get("/api/quiz-attempts", (req, res) => {
    const userId = getUserId(req);
    const userRole = users.find(u => u.id === userId)?.role;
    if (userRole === "admin") {
      res.json(quizAttempts);
    } else {
      res.json(quizAttempts.filter(qa => qa.studentId === userId));
    }
  });

  app.post("/api/quizzes/:id/submit", (req, res) => {
    const userId = getUserId(req);
    const quizId = req.params.id;
    const { score } = req.body;
    quizAttempts.push({
      id: generateId("qa"),
      studentId: userId,
      quizId,
      score,
      submittedAt: new Date().toISOString()
    });
    
    // add activity
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      activities.unshift({
        id: generateId("a"),
        studentId: userId,
        title: quiz.title,
        date: "Just now",
        type: "quiz",
        score
      });
    }

    // Give XP
    const user = users.find(u => u.id === userId);
    if (user && user.role === "student") user.xp += Math.round(score);

    res.json({ success: true });
  });


  // === ADMIN ROUTES ===
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalStudents: users.filter(u => u.role === "student").length,
      totalCourses: courses.length,
      activeEnrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.progress === 100).length,
      quizAttempts: quizAttempts.length,
      certificatesIssued: certificatesData.length,
      pendingRegistrations: registrationRequests.filter(r => r.status === "pending").length,
      approvedRegistrations: registrationRequests.filter(r => r.status === "approved").length,
      rejectedRegistrations: registrationRequests.filter(r => r.status === "rejected").length,
      todayRegistrations: registrationRequests.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length,
      weeklyRegistrations: registrationRequests.filter(r => {
        const d = new Date(r.date);
        const now = new Date();
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
      }).length,
      pendingCourseApplications: courseApplications.filter(a => a.status === "pending").length,
      approvedCourseApplications: courseApplications.filter(a => a.status === "approved").length,
      rejectedCourseApplications: courseApplications.filter(a => a.status === "rejected").length,
      todayCourseApplications: courseApplications.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length,
      weeklyCourseApplications: courseApplications.filter(a => new Date(a.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    });
  });

  app.get("/api/admin/users", (req, res) => {
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    users = users.filter(u => u.id !== req.params.id || u.role === "admin");
    // Cascading deletes
    enrollments = enrollments.filter(e => e.studentId !== req.params.id);
    quizAttempts = quizAttempts.filter(qa => qa.studentId !== req.params.id);
    certificatesData = certificatesData.filter(c => c.studentId !== req.params.id);
    activities = activities.filter(a => a.studentId !== req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/courses", (req, res) => {
    const course = {
      ...req.body,
      id: generateId("c"),
    };
    courses.push(course);
    res.json(course);
  });

  app.put("/api/admin/courses/:id", (req, res) => {
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      courses[index] = { ...courses[index], ...req.body };
      res.json(courses[index]);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  });

  app.delete("/api/admin/courses/:id", (req, res) => {
    courses = courses.filter(c => c.id !== req.params.id);
    enrollments = enrollments.filter(e => e.courseId !== req.params.id);
    materials = materials.filter(m => m.courseId !== req.params.id);
    quizzes = quizzes.filter(q => q.courseId !== req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/materials", (req, res) => {
    const material = {
      ...req.body,
      id: generateId("m"),
      uploadedAt: new Date().toISOString()
    };
    materials.push(material);
    res.json(material);
  });

  app.delete("/api/admin/materials/:id", (req, res) => {
    materials = materials.filter(m => m.id !== req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/quizzes", (req, res) => {
    const quiz = {
      ...req.body,
      id: generateId("q"),
    };
    quizzes.push(quiz);
    res.json(quiz);
  });

  app.delete("/api/admin/quizzes/:id", (req, res) => {
    quizzes = quizzes.filter(q => q.id !== req.params.id);
    quizAttempts = quizAttempts.filter(qa => qa.quizId !== req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/certificates", (req, res) => {
    const { studentId, courseId } = req.body;
    const student = users.find(u => u.id === studentId);
    const course = courses.find(c => c.id === courseId);
    if (student && course) {
      const cert = {
        id: generateId("cert"),
        courseId,
        courseTitle: course.title,
        studentName: student.name,
        studentId,
        issueDate: new Date().toISOString()
      };
      certificatesData.push(cert);
      
      // Notify via activity
      activities.unshift({
        id: generateId("a"),
        studentId,
        title: `Earned certificate for ${course.title}`,
        date: "Just now",
        type: "certificate"
      });
      res.json(cert);
    } else {
      res.status(404).json({ error: "Student or course not found" });
    }
  });

  app.delete("/api/admin/certificates/:id", (req, res) => {
    certificatesData = certificatesData.filter(c => c.id !== req.params.id);
    res.json({ success: true });
  });

  // AI APIs
  app.post("/api/gemini/summarize", async (req, res) => {
    try {
      const { lessonTitle, courseTitle } = req.body;
      const aiClient = getAIClient();
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Provide a very concise bulleted summary (3-5 bullet points) for a hypothetical lesson titled "${lessonTitle}" in the course "${courseTitle}". Format as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert technical instructor generating short, punchy summaries. Do not include markdown formatting like ```json.",
        }
      });
      const summaryText = response.text.trim();
      let summaryArray;
      try {
        summaryArray = JSON.parse(summaryText);
      } catch (e) {
        // Fallback if parsing fails
        summaryArray = ["Error interpreting AI response."];
      }
      res.json({ summary: summaryArray });
    } catch (error: any) {
      console.error("AI summarization error:", error);
      res.status(500).json({ error: error.message || "Failed to generate summary." });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const studentId = getUserId(req);
      const studentUser = users.find(u => u.id === studentId) || users[0];
      const studentEnrollments = enrollments.filter(e => e.studentId === studentUser.id);
      const studentCertificates = certificatesData.filter(c => c.studentId === studentUser.id);
      const studentQuizzes = quizzes; // all quizzes
      const studentMaterials = materials; // all materials

      // Compile course detail list
      const enrolledCoursesDetail = studentEnrollments.map(e => {
        const c = courses.find(course => course.id === e.courseId);
        return {
          title: c?.title || "Unknown Course",
          progress: e.progress,
          instructor: c?.instructorName || "Unknown Instructor",
          level: c?.level || "Unknown Level",
          duration: c?.duration || "N/A"
        };
      });

      const recommendedCoursesDetail = courses.filter(c => !studentEnrollments.some(e => e.courseId === c.id));

      const certificatesDetail = studentCertificates.map(c => ({
        courseTitle: c.courseTitle,
        issueDate: c.issueDate
      }));

      const context = {
        studentName: studentUser.name,
        xp: studentUser.xp,
        streak: studentUser.streak,
        enrolledCourses: enrolledCoursesDetail,
        recommendedCourses: recommendedCoursesDetail.map(c => ({ title: c.title, instructor: c.instructorName, category: c.category, level: c.level })),
        certificates: certificatesDetail,
        quizzes: studentQuizzes.map(q => {
          const c = courses.find(course => course.id === q.courseId);
          return { title: q.title, courseTitle: c?.title };
        }),
        materials: studentMaterials.map(m => {
          const c = courses.find(course => course.id === m.courseId);
          return { title: m.title, courseTitle: c?.title, type: m.type };
        })
      };

      const { message, history = [] } = req.body;

      // Check if Gemini API key exists
      const hasApiKey = !!process.env.GEMINI_API_KEY;

      if (hasApiKey) {
        const aiClient = getAIClient();
        
        // Format history for the generateContent API
        const formattedContents = [
          ...history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          })),
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ];

        const systemInstruction = `You are "AURA Learning Assistant", a supportive, super-intelligent technical study companion for the student named ${context.studentName}.
Your tone is friendly, technical, empowering, and highly helpful.
Use markdown to format your responses beautifully (bold, lists, etc.), but keep answers relatively concise so they fit well in a chat panel.

Current Student Context:
- Student Name: ${context.studentName}
- Current Streak: ${context.streak} days
- Experience Points (XP): ${context.xp} XP
- Enrolled Courses: ${JSON.stringify(context.enrolledCourses)}
- Recommended Courses (not enrolled): ${JSON.stringify(context.recommendedCourses)}
- Earned Certificates: ${JSON.stringify(context.certificates)}
- Available Quizzes: ${JSON.stringify(context.quizzes)}
- Available Materials: ${JSON.stringify(context.materials)}

Your primary goals:
1. Explain technical concepts (e.g. system design, react, node.js, python, databases, data science, AI) clearly and structured with practical examples.
2. Recommend the next lessons/activities.
3. Show learning progress or help prepare for upcoming quizzes.
4. Provide daily learning motivation, suggest study plans, and career guidance.
5. If the student asks about their courses, progress, or certificates, answer accurately based on the Current Student Context.`;

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        return res.json({ text: response.text });
      } else {
        // Mock fallback logic
        const lower = message.toLowerCase();
        let reply = "";

        if (lower.includes("my courses") || lower.includes("enrolled") || lower.includes("📚")) {
          reply = `Here are the courses you are currently studying:
\n${context.enrolledCourses.map(c => `• **${c.title}**\n  - Progress: **${c.progress}%**\n  - Instructor: ${c.instructor}\n  - Level: ${c.level}`).join('\n\n')}
\nWould you like me to recommend what topic to cover next?`;
        } else if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("🔥")) {
          reply = `Based on your profile, I highly recommend checking out these hot new courses:
\n${context.recommendedCourses.map(c => `• **${c.title}**\n  - Category: ${c.category}\n  - Level: ${c.level}\n  - Instructor: ${c.instructor}`).join('\n\n')}
\nThese courses align perfectly with your career growth and current skills!`;
        } else if (lower.includes("progress") || lower.includes("streak") || lower.includes("📈")) {
          const completed = context.enrolledCourses.filter(c => c.progress === 100).length;
          reply = `Here is your current academic progress tracker:
\n• **Experience Points**: ⭐ **${context.xp} XP**\n• **Daily Streak**: 🔥 **${context.streak} Days**\n• **Enrolled Courses**: 📚 **${context.enrolledCourses.length}**\n• **Completed Courses**: 🏆 **${completed}**
\nYou're doing fantastic! Keep up the flame to unlock your next achievement.`;
        } else if (lower.includes("quiz") || lower.includes("upcoming") || lower.includes("prep") || lower.includes("📝")) {
          reply = `Here is your quiz schedule and preparation tips:
\n• **Upcoming Quiz**: **React Basics Quiz** (Course: React & Node.js Masterclass)
\n**💡 Quick Preparation Tips:**
1. Review the React Component Lifecycle video.
2. Understand JSX rules and state vs. props.
3. Test yourself with code snippets.
\nType *Explain React Lifecycle* if you want me to break it down for you!`;
        } else if (lower.includes("daily goal") || lower.includes("goal") || lower.includes("🎯")) {
          reply = `🎯 **Your Daily Goal for today:**
\n1. Complete **1 lesson** in *${context.enrolledCourses[0]?.title || "your active course"}*.
2. Attempt today's quiz to maintain your **${context.streak} day streak**.
\n*Pro-tip: Consistent 15-minute daily sessions yield a 90% higher retention rate!*`;
        } else if (lower.includes("certificate") || lower.includes("earned") || lower.includes("🏆")) {
          if (context.certificates.length > 0) {
            reply = `🏆 **Congratulations! You have earned the following credentials:**
\n${context.certificates.map(c => `• **${c.courseTitle}**\n  - Issued on: *${c.issueDate}*\n  - Status: Verified & Shareable`).join('\n\n')}
\nKeep learning to unlock more credentials and show them off on LinkedIn!`;
          } else {
            reply = `You haven't completed any courses yet to earn certificates. Complete a course to 100% to generate your first credential!`;
          }
        } else if (lower.includes("explain") || lower.includes("topic") || lower.includes("difficult") || lower.includes("💡")) {
          reply = `Sure! What topic would you like me to explain? Here are some highly requested subjects:
\n1. **System Design (Load Balancers & Caching)**
2. **React Hooks (useState & useEffect)**
3. **REST APIs vs. GraphQL**
4. **Python Generators & Decorators**
\nJust type the topic name (e.g. *"Explain Load Balancers"* or *"Explain React Hooks"*) and I'll break it down into plain English with code examples!`;
        } else if (lower.includes("planner") || lower.includes("study plan") || lower.includes("calendar") || lower.includes("📅")) {
          reply = `📅 **Your Personalized Study Planner:**
\n• **Mon, Wed, Fri**: Spend 30 mins on *${context.enrolledCourses[0]?.title || "Active Course"}* theory.
• **Tue, Thu**: Practical hands-on practice (write code / build projects).
• **Weekend**: Attempt 1 quiz and summarize concepts.
\nHow does this schedule look for you? We can adjust it based on your availability!`;
        } else if (lower.includes("load balancer") || lower.includes("system design") || lower.includes("caching")) {
          reply = `### 💡 Topic Explainer: Load Balancers (System Design)
\nImagine you own a popular burger joint. If you only have one chef (server), customers will wait in a massive line during lunch hours.
\nA **Load Balancer** acts as a friendly host standing at the door. As hungry clients arrive, it routes them to different chefs so no single chef is overwhelmed.
\n**How it works in tech:**
1. A user makes an HTTP request to your app.
2. The Load Balancer intercepts it.
3. It forwards the request to one of your backend servers using algorithms like **Round Robin** (cycling one by one) or **Least Connections** (sending to the idle server).
\n**Benefits:**
• Prevents server crashes during peak traffic.
• Enhances application availability (if one server goes down, traffic is routed to others).`;
        } else if (lower.includes("react hooks") || lower.includes("useeffect") || lower.includes("usestate")) {
          reply = `### 💡 Topic Explainer: React Hooks (useState & useEffect)
\nIn React, **Hooks** are functions that let functional components hook into state and lifecycle features.
\n**1. useState (State Hook)**
It allows you to keep track of local state variables:
\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`
\n**2. useEffect (Side-Effects Hook)**
It runs code when components mount, unmount, or when specific variables change:
\`\`\`jsx
import React, { useEffect } from 'react';

useEffect(() => {
  // Runs once on mount
  console.log("Component mounted!");
}, []); // Empty dependency array
\`\`\`
\nNeed me to write a custom example for your course? Just ask!`;
        } else {
          reply = `Hello **${context.studentName}**! I'm your AURA AI Study Companion. 🎓
\nI can help you master complex programming concepts, guide you through your course material, suggest personalized study calendars, or help you prep for the **React Basics Quiz**.
\nFeel free to ask any specific academic or technical questions!`;
        }

        return res.json({ text: reply });
      }
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error.message || "Something went wrong." });
    }
  });

  app.post("/api/gemini/admin-chat", async (req, res) => {
    try {
      const activeStudentsCount = users.filter(u => u.role === "student").length;
      const coursesCount = courses.length;
      const activeEnrollmentsCount = enrollments.length;
      const quizAttemptsCount = quizAttempts.length;
      const certificatesCount = certificatesData.length;
      const pendingRegCount = registrationRequests.filter(r => r.status === "pending").length;
      const approvedRegCount = registrationRequests.filter(r => r.status === "approved").length;
      const rejectedRegCount = registrationRequests.filter(r => r.status === "rejected").length;
      const pendingAppCount = courseApplications.filter(a => a.status === "pending").length;
      const approvedAppCount = courseApplications.filter(a => a.status === "approved").length;
      const rejectedAppCount = courseApplications.filter(a => a.status === "rejected").length;

      // Find highest/lowest enrollment courses
      const courseEnrollments: { [key: string]: number } = {};
      courses.forEach(c => { courseEnrollments[c.id] = 0; });
      enrollments.forEach(e => {
        if (courseEnrollments[e.courseId] !== undefined) {
          courseEnrollments[e.courseId]++;
        }
      });
      let highestEnrollmentCourse = "None";
      let highestEnrollmentCount = -1;
      let lowestEnrollmentCourse = "None";
      let lowestEnrollmentCount = Infinity;

      courses.forEach(c => {
        const count = courseEnrollments[c.id] || 0;
        if (count > highestEnrollmentCount) {
          highestEnrollmentCount = count;
          highestEnrollmentCourse = c.title;
        }
        if (count < lowestEnrollmentCount) {
          lowestEnrollmentCount = count;
          lowestEnrollmentCourse = c.title;
        }
      });

      if (courses.length === 0) {
        lowestEnrollmentCourse = "None";
        lowestEnrollmentCount = 0;
      }

      const adminContext = {
        totalStudents: activeStudentsCount,
        totalCourses: coursesCount,
        activeEnrollments: activeEnrollmentsCount,
        quizAttempts: quizAttemptsCount,
        certificatesIssued: certificatesCount,
        pendingRegistrations: pendingRegCount,
        approvedRegistrations: approvedRegCount,
        rejectedRegistrations: rejectedRegCount,
        pendingCourseApplications: pendingAppCount,
        approvedCourseApplications: approvedAppCount,
        rejectedCourseApplications: rejectedAppCount,
        highestEnrollmentCourse,
        highestEnrollmentCount,
        lowestEnrollmentCourse,
        lowestEnrollmentCount,
        pendingStudentsList: registrationRequests.filter(r => r.status === "pending").map(r => ({ name: r.fullName, email: r.email, college: r.college })),
        pendingApplicationsList: courseApplications.filter(a => a.status === "pending").map(a => {
          const student = users.find(u => u.id === a.studentId);
          const course = courses.find(c => c.id === a.courseId);
          return { studentName: student?.name || "Unknown", courseTitle: course?.title || "Unknown" };
        })
      };

      const { message, history = [] } = req.body;
      const hasApiKey = !!process.env.GEMINI_API_KEY;

      if (hasApiKey) {
        const aiClient = getAIClient();
        const formattedContents = [
          ...history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          })),
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ];

        const systemInstruction = `You are "AURA Admin Assistant", an elite, super-intelligent administrative intelligence system and management companion.
Your tone is professional, technical, precise, and highly analytical.
Use markdown to format your responses beautifully (bold, metrics tables, lists, etc.), but keep answers relatively concise.

Platform Administrative State:
- Total Enrolled Students (Active): ${adminContext.totalStudents}
- Courses Available: ${adminContext.totalCourses}
- Total Active Enrollments: ${adminContext.activeEnrollments}
- Quiz Attempts: ${adminContext.quizAttempts}
- Certificates Issued: ${adminContext.certificatesIssued}
- Pending Student Registrations: ${adminContext.pendingRegistrations}
- Approved Student Registrations: ${adminContext.approvedRegistrations}
- Rejected Student Registrations: ${adminContext.rejectedRegistrations}
- Pending Course Enrolment Applications: ${adminContext.pendingCourseApplications}
- Approved Course Enrolment Applications: ${adminContext.approvedCourseApplications}
- Rejected Course Enrolment Applications: ${adminContext.rejectedCourseApplications}
- Highest Enrolled Course: ${adminContext.highestEnrollmentCourse} (${adminContext.highestEnrollmentCount} enrollments)
- Lowest Enrolled Course: ${adminContext.lowestEnrollmentCourse} (${adminContext.lowestEnrollmentCount} enrollments)
- Pending Registration Requests: ${JSON.stringify(adminContext.pendingStudentsList)}
- Pending Course Applications List: ${JSON.stringify(adminContext.pendingApplicationsList)}

Your primary goals:
1. Provide a comprehensive summary of the system and user activities.
2. Answer detailed administrative queries about students, courses, quiz attempts, and pending approvals accurately using the Platform Administrative State.
3. Generate smart actionable insights to improve student engagement, highlight low-enrollment courses, and list items waiting for approval.
4. Show platform analytics, activity logs, or system health indicators.`;

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.2, // Lower temperature for factual admin data
          }
        });

        return res.json({ text: response.text });
      } else {
        // Mock fallback logic
        const lower = message.toLowerCase();
        let reply = "";

        if (lower.includes("dashboard summary") || lower.includes("summary") || lower.includes("📊")) {
          reply = `### 📊 Platform Dashboard Summary
\n• **Active Students**: \`${adminContext.totalStudents}\`
• **Courses Available**: \`${adminContext.totalCourses}\`
• **Total Enrollments**: \`${adminContext.activeEnrollments}\`
• **Pending Registrations**: \`${adminContext.pendingRegistrations}\`
• **Pending Course Apps**: \`${adminContext.pendingCourseApplications}\`
• **Certificates Issued**: \`${adminContext.certificatesIssued}\`
• **Quiz Attempts**: \`${adminContext.quizAttempts}\`
\n**Smart Insights:**
- **${adminContext.highestEnrollmentCourse}** is currently leading with **${adminContext.highestEnrollmentCount}** enrollments.
- There are **${adminContext.pendingRegistrations + adminContext.pendingCourseApplications}** pending tasks waiting for your review today.`;
        } else if (lower.includes("student") || lower.includes("statistics") || lower.includes("inactive") || lower.includes("👨🎓")) {
          reply = `### 👨🎓 Student Statistics & Health Report
\n• **Total Active Accounts**: \`${adminContext.totalStudents}\`
• **Approved Today**: \`2\`
• **Pending Account Verification**: \`${adminContext.pendingRegistrations}\`
\n**💡 AI Suggestion:**
- All currently enrolled students are active, but **1** student hasn't attempted a quiz this week. Consider sending an automated encouragement notification.
- To view inactive students or specific profiles, check the **User Management** tab in your admin sidebar.`;
        } else if (lower.includes("course") || lower.includes("analytics") || lower.includes("enrollment") || lower.includes("📚")) {
          reply = `### 📚 Course Performance Analytics
\n• **Most Popular Course**: **${adminContext.highestEnrollmentCourse}** (${adminContext.highestEnrollmentCount} enrollments)
• **Needs Promotion (Lowest)**: **${adminContext.lowestEnrollmentCourse}** (${adminContext.lowestEnrollmentCount} enrollments)
• **Course Count**: \`${adminContext.totalCourses}\`
\n**📈 Smart Insight:**
- Course enrollments are up by **18%** this month.
- *Tip: Adding intermediate-level quizzes to the lowest enrolled courses has historically increased completion rates by up to 24%!*`;
        } else if (lower.includes("pending") || lower.includes("registration") || lower.includes("request") || lower.includes("📝")) {
          if (adminContext.pendingRegistrations > 0 || adminContext.pendingCourseApplications > 0) {
            let details = `### 📝 Pending Approvals Queue\n`;
            if (adminContext.pendingRegistrations > 0) {
              details += `\n**Pending Student Accounts (${adminContext.pendingRegistrations}):**\n` + 
                adminContext.pendingStudentsList.map(s => `• **${s.name}** (${s.email}) - College: *${s.college}*`).join('\n');
            }
            if (adminContext.pendingCourseApplications > 0) {
              details += `\n**Pending Course Enrollments (${adminContext.pendingCourseApplications}):**\n` +
                adminContext.pendingApplicationsList.map(a => `• **${a.studentName}** is applying for *${a.courseTitle}*`).join('\n');
            }
            details += `\n\n*Action Required: Go to "Registrations" or "Applications" from your admin sidebar to Approve/Reject these requests.*`;
            reply = details;
          } else {
            reply = `### 📝 Pending Approvals Queue
\nExcellent! There are **0 pending student registrations** or course applications waiting for review right now.
\nAll student records are fully synchronized!`;
          }
        } else if (lower.includes("analytics") || lower.includes("rate") || lower.includes("📈")) {
          reply = `### 📈 Platform-Wide Analytics
\n• **Quiz Completion Rate**: **82%** (Target: 80%)
• **Avg. Engagement Time**: **35 mins/day**
• **Certificate Unlock Rate**: **14%**
• **Course Satisfaction Score**: **4.8/5.0**
\n**💡 Optimization Recommendation:**
- Students are highly active on Tuesdays and Thursdays. Scheduled announcements on these days can increase user engagement by **15%**.`;
        } else if (lower.includes("certificate") || lower.includes("🏆")) {
          reply = `### 🏆 Certificate Distribution Statistics
\n• **Total Certificates Issued**: \`${adminContext.certificatesIssued}\`
• **Top Certified Course**: **React & Node.js Masterclass**
• **Verified Rate**: **100%** secure and verifiable.
\nStudents who complete courses instantly generate shareable neomorphic PDF certificates!`;
        } else if (lower.includes("notification") || lower.includes("summary") || lower.includes("🔔")) {
          reply = `### 🔔 Notification System Summary
\n• **Broadcasts Sent Today**: \`0\`
• **Auto-alerts Triggered**: \`4\`
• **Active Alerts**: System is healthy, all student verification triggers are functioning normally.
\nYou can broadcast global announcements directly from the administrative portal!`;
        } else if (lower.includes("activity") || lower.includes("log") || lower.includes("today") || lower.includes("📅")) {
          reply = `### 📅 Platform Activity Log (Today)
\n• **[08:15 AM]** New student registered (Taylor Swift).
• **[09:30 AM]** Student Alex Dev unlocked certificate for **React & Node.js Masterclass**.
• **[11:45 AM]** Updated study materials for **Advanced Full-Stack System Design**.
• **[02:10 PM]** Approved 1 new course application request.
\n*Platform is operating at 100% efficiency. No performance bottlenecks reported.*`;
        } else if (lower.includes("suggestion") || lower.includes("recommend") || lower.includes("improvement") || lower.includes("💡")) {
          reply = `### 💡 AI Strategic Suggestions
\n1. **Promote Low Enrollment**: Create a short promo or announcement for *${adminContext.lowestEnrollmentCourse}* to boost its visibility.
2. **Action Approvals**: You have **${adminContext.pendingRegistrations}** pending registration approvals. Reviewing them soon improves student onboarding experience.
3. **Weekly Newsletter**: Broadcast a summary of newly added courses to all active accounts to boost course adoption rates.`;
        } else if (lower.includes("health") || lower.includes("system") || lower.includes("status") || lower.includes("⚙")) {
          reply = `### ⚙ System Operational Status
\n• **API Gateway**: **ONLINE** (Ping: 42ms)
• **Database Sync**: **100% synchronized**
• **Vite Dev Server**: Running on Port **3000**
• **LMS Engine Version**: \`v1.4.2-neo\`
• **Memory Usage**: **42%** (Healthy)
\nAll services are fully operational. No warnings or errors detected.`;
        } else {
          reply = `Welcome back, Admin.
\nToday's Platform Summary:
• **New Registrations**: \`${adminContext.pendingRegistrations + 2}\`
• **Pending Approvals**: \`${adminContext.pendingRegistrations + adminContext.pendingCourseApplications}\`
• **Approved Today**: \`3\`
• **Active Students**: \`${adminContext.totalStudents}\`
• **Courses Available**: \`${adminContext.totalCourses}\`
• **Quiz Attempts Today**: \`5\`
• **Certificates Issued**: \`${adminContext.certificatesIssued}\`
\nHow can I assist you today? I can help you analyze platform metrics, course popularity, inspect pending queues, or generate strategic suggestions!`;
        }

        return res.json({ text: reply });
      }
    } catch (error: any) {
      console.error("AI admin-chat error:", error);
      res.status(500).json({ error: error.message || "Something went wrong." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
