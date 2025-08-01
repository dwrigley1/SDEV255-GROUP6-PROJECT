// Run this script to add mock data, already added, will reset db
// Run with node seed.js
// Needs .env with MONGO_URI, which is in .env.example
// Courses use teacher._id as creator_id. In our app this would come from someothing like req.user._id after login.

const connecttoDB = require("./DB/db");
const { User, Course } = require("./DB/models");
require("dotenv").config();

async function seedtheDB() {
  try {
    await connecttoDB();
    await User.deleteMany({});
    await Course.deleteMany({});

    const teacher = await User.create({
      email: "dakota@example.com",
      password: "password123",
      first_name: "Dakota",
      last_name: "Wrigley",
      role: "teacher"
    });

    await User.create({
      email: "fingus@example.com",
      password: "password123",
      first_name: "Fingus",
      last_name: "Backend",
      role: "teacher"
    });

    await User.create({
      email: "hulk@example.com",
      password: "password123",
      first_name: "Hulk",
      last_name: "Hoagie",
      role: "student"
    });

    const courses = [
      {
        name: "ENGL 111 - English Composition",
        description:
          "English Composition is designed to develop students abilities to craft, organize, and express ideas clearly and effectively in their own writing. This course incorporates critical reading, critical thinking, and the writing process, as well as research and the ethical use of sources in writing for the academic community. Extended essays, including a researched argument, are required.",
        subject: "English",
        credits: 3,
        creator_id: teacher._id
      },
      {
        name: "ENGL 202 - Creative Writing",
        description:
          "This course introduces students to opportunities for self-expression in two or more literary genres - fiction, poetry, drama, and creative nonfiction.",
        subject: "English",
        credits: 3,
        creator_id: teacher._id
      },
      {
        name: "MATH 221 - Calculus for Technology I",
        description:
          "First course in a two-semester sequence in the techniques of calculus, with an emphasis on how they are applied to technology. Topics include limits, continuity, first and second derivatives, definite and indefinite integrals, and applications of these concepts.",
        subject: "Mathematics",
        credits: 3,
        creator_id: teacher._id
      },
      {
        name: "MATH 222 - Calculus for Technology II",
        description:
          "Second course in a two-semester sequence in the techniques of calculus, with an emphasis on how they are applied to technology. Topics include the calculus of transcendental functions, techniques of integration, differential equations, infinite series, and applications of these concepts.",
        subject: "Mathematics",
        credits: 3,
        creator_id: teacher._id
      },
      {
        name: "BIOL 121 - General Biology I",
        description:
          "Students will be introduced to those biological and chemical principles associated with cell structure and function, photosynthesis, cellular respiration, mitosis, meiosis, molecular and Mendelian genetics, enzyme function and energetics. An overview of natural selection and biotechnology as it applies to prokaryotes and eukaryotes.",
        subject: "Biology",
        credits: 3,
        creator_id: teacher._id
      },
      {
        name: "BIOL 122 - General Biology II",
        description:
          "Students will be introduced to those principles associated with evolution, form and function of plants and animals, and ecology. The course will trace the evolution of organisms and explore plant structures, development and interaction with their environment. Students will look at anatomy, physiology, development and behavior of animals and will learn aspects of conservation biology.",
        subject: "Biology",
        credits: 3,
        creator_id: teacher._id
      }
    ];

    await Course.insertMany(courses);
    console.log("WORKED");
    process.exit();
  } catch (err) {
    console.error("DIDNT WORK:", err);
    process.exit(1);
  }
}

seedtheDB();