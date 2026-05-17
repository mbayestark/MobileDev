import { mutation } from "./_generated/server";

export const seedData = mutation({
  handler: async (ctx) => {
    const existingItems = await ctx.db.query("items").first();
    if (existingItems) {
      return { message: "Data already seeded" };
    }

    // Seed users
    await ctx.db.insert("users", {
      studentId: "ADMIN-001",
      password: "admin123",
      name: "Admin User",
      email: "admin@daust.edu",
      phone: "+221 77 123 4567",
      role: "faculty",
      department: "Student Affairs",
      position: "IT Coordinator",
      isAdmin: true,
      adminLevel: "super",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("users", {
      studentId: "STU-001",
      password: "student123",
      name: "John Doe",
      email: "john@daust.edu",
      role: "student",
      major: "Electrical Engineering",
      year: "2nd",
      isAdmin: false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("users", {
      studentId: "FAC-001",
      password: "faculty123",
      name: "Dr. Smith",
      email: "smith@daust.edu",
      role: "faculty",
      department: "Engineering",
      position: "Professor",
      isAdmin: false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Seed items
    await ctx.db.insert("items", {
      barcode: "ITEM-SCOPE-001",
      name: "Oscilloscope Rigol DS1054Z",
      category: "equipment",
      location: "Lab 1",
      status: "available",
      createdAt: Date.now(),
    });

    await ctx.db.insert("items", {
      barcode: "ITEM-HDMI-001",
      name: "HDMI Cable 2m",
      category: "tool",
      location: "Lab 1",
      status: "available",
      createdAt: Date.now(),
    });

    await ctx.db.insert("items", {
      barcode: "ITEM-MULTI-001",
      name: "Digital Multimeter",
      category: "equipment",
      location: "Lab 2",
      status: "available",
      createdAt: Date.now(),
    });

    await ctx.db.insert("items", {
      barcode: "ITEM-PROJ-001",
      name: "Projector Epson EB-X51",
      category: "equipment",
      location: "Classroom 2A",
      status: "available",
      createdAt: Date.now(),
    });

    await ctx.db.insert("items", {
      barcode: "ITEM-ARDUINO-001",
      name: "Arduino Uno R3 Kit",
      category: "tool",
      location: "Lab 1",
      status: "available",
      createdAt: Date.now(),
    });

    await ctx.db.insert("items", {
      barcode: "ITEM-RASP-001",
      name: "Raspberry Pi 4 Model B",
      category: "equipment",
      location: "Lab 2",
      status: "available",
      createdAt: Date.now(),
    });

    // Seed facilities
    await ctx.db.insert("facilities", {
      barcode: "FACILITY-LAB1",
      name: "Lab 1 - Electronics",
      type: "lab",
      capacity: 20,
      createdAt: Date.now(),
    });

    await ctx.db.insert("facilities", {
      barcode: "FACILITY-LAB2",
      name: "Lab 2 - Computer Science",
      type: "lab",
      capacity: 25,
      createdAt: Date.now(),
    });

    await ctx.db.insert("facilities", {
      barcode: "FACILITY-LAB3",
      name: "Lab 3 - Physics",
      type: "lab",
      capacity: 20,
      createdAt: Date.now(),
    });

    await ctx.db.insert("facilities", {
      barcode: "FACILITY-CLASS2A",
      name: "Classroom 2A",
      type: "classroom",
      capacity: 40,
      createdAt: Date.now(),
    });

    await ctx.db.insert("facilities", {
      barcode: "FACILITY-CLASS2B",
      name: "Classroom 2B",
      type: "classroom",
      capacity: 40,
      createdAt: Date.now(),
    });

    await ctx.db.insert("facilities", {
      barcode: "FACILITY-CAFE",
      name: "Cafeteria",
      type: "cafeteria",
      capacity: 100,
      createdAt: Date.now(),
    });

    return { message: "Seed data inserted successfully" };
  },
});
