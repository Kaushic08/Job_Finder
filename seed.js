require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./models/Job'); 

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in .env file. Cannot seed database.');
    process.exit(1);
}

const sampleJobs = [
 
  { title: 'Software Development Engineer', company: 'InfoTech India', location: 'Bengaluru, India', description: 'Join our core engineering team to build scalable backend services using Java and Spring Boot in a cloud environment.', skills: ['java', 'spring boot', 'microservices', 'aws', 'sql'], employmentType: 'Full-time' },
  { title: 'Data Scientist', company: 'Analytics Hub', location: 'Hyderabad, India', description: 'Leverage machine learning techniques to extract insights from large datasets. Strong Python and ML framework experience needed.', skills: ['python', 'machine learning', 'tensorflow', 'pandas', 'sql', 'data visualization'], employmentType: 'Full-time' },
  { title: 'QA Automation Engineer', company: 'Quality Systems Pvt. Ltd.', location: 'Pune, India', description: 'Develop and maintain automated test suites for web applications using Selenium and Java/Python.', skills: ['selenium', 'java', 'python', 'testng', 'jira', 'api testing'], employmentType: 'Full-time' },
  { title: 'Cloud DevOps Engineer', company: 'Cloudify Solutions', location: 'Chennai, India', description: 'Implement and manage CI/CD pipelines, infrastructure as code (IaC), and monitoring solutions on AWS/Azure.', skills: ['aws', 'azure', 'docker', 'kubernetes', 'terraform', 'jenkins', 'linux', 'scripting'], employmentType: 'Full-time' },
  { title: 'Senior Product Manager', company: 'Innovate India', location: 'Mumbai, India', description: 'Define product strategy, roadmap, and feature requirements for our B2B SaaS platform. Work closely with engineering and marketing teams.', skills: ['product management', 'agile', 'market research', 'jira', 'saas'], employmentType: 'Full-time' },
  { title: 'Business Analyst', company: 'Fintech Solutions', location: 'Gurgaon, India', description: 'Gather and document business requirements, perform gap analysis, and work with development teams to deliver financial software solutions.', skills: ['business analysis', 'requirements gathering', 'sql', 'excel', 'fintech'], employmentType: 'Full-time' },
  { title: 'React Native Developer', company: 'MobileFirst Labs', location: 'Noida, India', description: 'Build cross-platform mobile applications using React Native. Experience with native modules is a plus.', skills: ['react native', 'javascript', 'redux', 'ios', 'android', 'rest api'], employmentType: 'Contract' },
  { title: 'Technical Writer (Remote)', company: 'DocuTech Services', location: 'Remote, India', description: 'Create clear and concise technical documentation, including API guides, user manuals, and knowledge base articles.', skills: ['technical writing', 'api documentation', 'markdown', 'git'], employmentType: 'Part-time' },
  { title: 'Database Administrator (DBA)', company: 'DataSecure India', location: 'Bengaluru, India', description: 'Manage, monitor, and maintain performance of PostgreSQL and MySQL databases in production environments.', skills: ['postgresql', 'mysql', 'database administration', 'sql tuning', 'backup', 'linux'], employmentType: 'Full-time' },
  { title: 'Network Engineer', company: 'ConnectNet India', location: 'Chennai, India', description: 'Design, implement, and troubleshoot enterprise network infrastructure including routers, switches, and firewalls (Cisco/Juniper).', skills: ['networking', 'cisco ios', 'junos', 'tcp/ip', 'routing', 'switching', 'firewalls'], employmentType: 'Full-time' },


  { title: 'AI Engineer', company: 'FutureAI Solutions', location: 'Bengaluru, India', description: 'Develop and deploy cutting-edge AI models for NLP and computer vision tasks in a fast-paced startup environment.', skills: ['python', 'pytorch', 'tensorflow', 'nlp', 'computer vision', 'aws', 'docker'], employmentType: 'Full-time' },
  { title: 'Bioinformatics Scientist', company: 'GeneTech Labs', location: 'Hyderabad, India', description: 'Analyze genomic and proteomic data using computational methods. PhD or relevant Masters experience required.', skills: ['python', 'r', 'biopython', 'nextflow', 'snakemake', 'genomics', 'statistics', 'linux'], employmentType: 'Full-time' },
  { title: 'Fintech Business Analyst', company: 'Mumbai Finance Hub', location: 'Mumbai, India', description: 'Bridge the gap between business needs and technical solutions in the rapidly evolving fintech space focusing on lending platforms.', skills: ['business analysis', 'fintech', 'sql', 'requirements gathering', 'agile', 'payments', 'lending'], employmentType: 'Full-time' },
  { title: 'Embedded Software Engineer C++', company: 'AutoSystems Pune', location: 'Pune, India', description: 'Design and develop firmware for automotive embedded control units (ECUs) using modern C++ standards.', skills: ['c++', 'c', 'embedded systems', 'rtos', 'can bus', 'automotive', 'linux kernel'], employmentType: 'Full-time' },
  { title: 'MERN Stack Developer', company: 'Kolkata Web Works', location: 'Kolkata, India', description: 'Build and maintain modern, responsive web applications using the MERN stack (MongoDB, Express, React, Node.js).', skills: ['mongodb', 'express', 'react', 'node.js', 'javascript', 'rest api', 'html', 'css'], employmentType: 'Contract' }
]; 

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding.');

    const clearExisting = true;

    if (clearExisting) {
        await Job.deleteMany({}); 
        console.log('Existing jobs cleared.');
        await Job.insertMany(sampleJobs); 
        console.log(`${sampleJobs.length} sample jobs seeded successfully!`);
    } else {
        
        const count = await Job.countDocuments();
        if (count === 0) {
            console.log('No existing jobs found. Seeding database...');
            await Job.insertMany(sampleJobs);
            console.log(`${sampleJobs.length} sample jobs seeded successfully!`);
        } else {
            console.log(`Database already contains ${count} jobs. Seeding skipped (clearExisting is false).`);
        }
    }
  })
  .catch(err => {
    console.error('Database connection or seeding error:', err);
  })
  .finally(() => {
    mongoose.connection.close()
      .then(() => console.log('MongoDB connection closed after seeding.'))
      .catch(err => console.error('Error closing MongoDB connection:', err));
  });