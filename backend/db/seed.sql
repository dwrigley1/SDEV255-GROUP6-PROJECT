DELETE FROM courses;
DELETE FROM users;

-- mock users
INSERT INTO users (email, first_name, last_name, role)
VALUES 
  ('dakota@example.com', 'Dakota', 'Frontend', 'teacher'),
  ('fingus@example.com', 'Fingus', 'Backend', 'teacher'),
  ('hulkhoagie@example.com', 'Hulk', 'Hoagie', 'student');

-- inserts courses created by Dakota creator_id=1
INSERT INTO courses (name, description, subject, credits, creator_id)
VALUES
  ('ENGL 111 - English Composition', 
   'English Composition is designed to develop students’ abilities to craft, organize, and express ideas clearly and effectively in their own writing. This course incorporates critical reading, critical thinking, and the writing process, as well as research and the ethical use of sources in writing for the academic community. Extended essays, including a researched argument, are required.',
   'English', 3, 1),

  ('ENGL 202 - Creative Writing',
   'This course introduces students to opportunities for self-expression in two or more literary genres - fiction, poetry, drama, and creative nonfiction.',
   'English', 3, 1),

  ('MATH 221 - Calculus for Technology I',
   'First course in a two-semester sequence in the techniques of calculus, with an emphasis on how they are applied to technology. Topics include limits, continuity, first and second derivatives, definite and indefinite integrals, and applications of these concepts..',
   'Mathematics', 3, 1),

  ('MATH 222 - Calculus for Technology II',
   'Second course in a two-semester sequence in the techniques of calculus, with an emphasis on how they are applied to technology. Topics include the calculus of transcendental functions, techniques of integration, differential equations, infinite series, and applications of these concepts.',
   'Mathematics', 3, 1),

  ('BIOL 121 - General Biology I',
   'Students will be introduced to those biological and chemical principles associated with cell structure and function, photosynthesis, cellular respiration, mitosis, meiosis, molecular and Mendelian genetics, enzyme function and energetics. An overview of natural selection and biotechnology as it applies to prokaryotes and eukaryotes.',
   'Biology', 3, 1),

  ('BIOL 122 - General Biology II',
   'Students will be introduced to those principles associated with evolution, form and function of plants and animals, and ecology. The course will trace the evolution of organisms and explore plant structures, development and interaction with their environment. Students will look at anatomy, physiology, development and behavior of animals and will learn aspects of conservation biology.',
   'Biology', 3, 1);