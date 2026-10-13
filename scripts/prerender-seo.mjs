import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const origin = "https://forestviewmontessori.org";
const routes = [
  ["gallery", "Gallery | Forestview Montessori", "Explore photos of our Montessori classrooms, learning activities, and school community."],
  ["about", "About Forestview Montessori | Plymouth Montessori School", "Learn about Forestview Montessori, our guides, values, and child-centered Montessori approach in Plymouth."],
  ["admissions", "Admissions | Forestview Montessori", "Explore Forestview Montessori admissions, tuition information, forms, schedules, and enrollment steps."],
  ["rules", "Rules and Regulations | Forestview Montessori", "Review Forestview Montessori school policies, family expectations, and program guidelines."],
  ["syllabus", "Syllabus | Forestview Montessori", "Review Forestview Montessori toddler and preschool curriculum, learning areas, and Montessori philosophy."],
  ["tour", "Book a Tour | Forestview Montessori", "Schedule a tour of Forestview Montessori in Plymouth and learn about toddler and preschool openings."],
  ["contact", "Contact Forestview Montessori", "Contact Forestview Montessori in Plymouth for admissions, tours, careers, and general questions."],
  ["careers", "Careers | Forestview Montessori", "Explore teaching and staff career opportunities at Forestview Montessori."],
  ["blog", "Blog | Forestview Montessori", "Read Forestview Montessori news, child development ideas, and school updates."],
  ["blog/welcome-to-our-school-blog", "Welcome to Our School Blog | Forestview Montessori", "Classroom glimpses, parent tips, and school news from Forestview Montessori in Plymouth."],
  ["blog/practical-life-in-the-toddler-room", "Practical Life in the Toddler Room | Forestview Montessori", "Learn why practical life activities build concentration, coordination, language, and confidence for toddlers."],
  ["blog/montessori-at-home-consistency-without-pressure", "Montessori at Home | Forestview Montessori", "Simple ways families can support order, respect, independence, and consistent routines at home."],
];

const template = await readFile("dist/index.html", "utf8");
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

for (const [path, title, description] of routes) {
  const url = `${origin}/${path}`;
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escape(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escape(description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
  const directory = join("dist", ...path.split("/"));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), html);
}

console.log(`Generated ${routes.length} crawlable route documents.`);
