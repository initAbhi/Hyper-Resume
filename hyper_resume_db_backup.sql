--
-- PostgreSQL database dump
--

\restrict vcoqLN9rmbg9xb74G2g9vQkZgsyhkfz6zAm0LgMD3LOzga8VL6ffc5FMNY8HQCF

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resume_versions DROP CONSTRAINT IF EXISTS resume_versions_resume_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resume_analyses DROP CONSTRAINT IF EXISTS resume_analyses_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resume_analyses DROP CONSTRAINT IF EXISTS resume_analyses_resume_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_matches DROP CONSTRAINT IF EXISTS job_matches_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_matches DROP CONSTRAINT IF EXISTS job_matches_resume_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_matches DROP CONSTRAINT IF EXISTS job_matches_job_description_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_descriptions DROP CONSTRAINT IF EXISTS job_descriptions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_applications DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_applications DROP CONSTRAINT IF EXISTS job_applications_resume_version_id_fkey;
ALTER TABLE IF EXISTS ONLY public.credit_ledger DROP CONSTRAINT IF EXISTS credit_ledger_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_user_id_fkey;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_user_sessions_user_id;
DROP INDEX IF EXISTS public.idx_user_sessions_token_hash;
DROP INDEX IF EXISTS public.idx_templates_template_key;
DROP INDEX IF EXISTS public.idx_resumes_user_id;
DROP INDEX IF EXISTS public.idx_resume_versions_resume_id;
DROP INDEX IF EXISTS public.idx_resume_analyses_user_id;
DROP INDEX IF EXISTS public.idx_resume_analyses_resume_id;
DROP INDEX IF EXISTS public.idx_payments_user_id;
DROP INDEX IF EXISTS public.idx_payments_provider_tx_id;
DROP INDEX IF EXISTS public.idx_payments_order_id;
DROP INDEX IF EXISTS public.idx_payments_idempotency_key;
DROP INDEX IF EXISTS public.idx_job_matches_user_id;
DROP INDEX IF EXISTS public.idx_job_matches_resume_id;
DROP INDEX IF EXISTS public.idx_job_matches_job_description_id;
DROP INDEX IF EXISTS public.idx_job_descriptions_user_id;
DROP INDEX IF EXISTS public.idx_job_applications_user_id;
DROP INDEX IF EXISTS public.idx_credit_ledger_user_id;
DROP INDEX IF EXISTS public.idx_credit_ledger_idempotency_key;
DROP INDEX IF EXISTS public.idx_candidate_profiles_user_id;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.templates DROP CONSTRAINT IF EXISTS templates_template_key_key;
ALTER TABLE IF EXISTS ONLY public.templates DROP CONSTRAINT IF EXISTS templates_pkey;
ALTER TABLE IF EXISTS ONLY public.resumes DROP CONSTRAINT IF EXISTS resumes_pkey;
ALTER TABLE IF EXISTS ONLY public.resume_versions DROP CONSTRAINT IF EXISTS resume_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.resume_analyses DROP CONSTRAINT IF EXISTS resume_analyses_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_provider_transaction_id_key;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_idempotency_key_key;
ALTER TABLE IF EXISTS ONLY public.job_matches DROP CONSTRAINT IF EXISTS job_matches_pkey;
ALTER TABLE IF EXISTS ONLY public.job_descriptions DROP CONSTRAINT IF EXISTS job_descriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.job_applications DROP CONSTRAINT IF EXISTS job_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.credit_ledger DROP CONSTRAINT IF EXISTS credit_ledger_pkey;
ALTER TABLE IF EXISTS ONLY public.credit_ledger DROP CONSTRAINT IF EXISTS credit_ledger_idempotency_key_key;
ALTER TABLE IF EXISTS ONLY public.candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.typeorm_migrations DROP CONSTRAINT IF EXISTS "PK_bb2f075707dd300ba86d0208923";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE IF EXISTS public.typeorm_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_sessions;
DROP SEQUENCE IF EXISTS public.typeorm_migrations_id_seq;
DROP TABLE IF EXISTS public.typeorm_migrations;
DROP TABLE IF EXISTS public.templates;
DROP TABLE IF EXISTS public.resumes;
DROP TABLE IF EXISTS public.resume_versions;
DROP TABLE IF EXISTS public.resume_analyses;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.job_matches;
DROP TABLE IF EXISTS public.job_descriptions;
DROP TABLE IF EXISTS public.job_applications;
DROP TABLE IF EXISTS public.credit_ledger;
DROP TABLE IF EXISTS public.candidate_profiles;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: candidate_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    headline character varying(200) DEFAULT ''::character varying NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    location character varying(150) DEFAULT ''::character varying NOT NULL,
    phone character varying(50),
    linkedin_url character varying(255),
    github_url character varying(255),
    website_url character varying(255),
    skills jsonb DEFAULT '[]'::jsonb NOT NULL,
    experience jsonb DEFAULT '[]'::jsonb NOT NULL,
    education jsonb DEFAULT '[]'::jsonb NOT NULL,
    projects jsonb DEFAULT '[]'::jsonb NOT NULL,
    certifications jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.candidate_profiles OWNER TO postgres;

--
-- Name: credit_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_ledger (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    transaction_type character varying(50) NOT NULL,
    idempotency_key character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.credit_ledger OWNER TO postgres;

--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    resume_version_id uuid,
    company character varying(150) NOT NULL,
    role character varying(150) NOT NULL,
    job_url character varying(500),
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    applied_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_applications OWNER TO postgres;

--
-- Name: job_descriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_descriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    company_name character varying(150),
    original_text text NOT NULL,
    parsed_requirements jsonb DEFAULT '[]'::jsonb NOT NULL,
    source_url character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_descriptions OWNER TO postgres;

--
-- Name: job_matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    resume_id uuid NOT NULL,
    job_description_id uuid NOT NULL,
    overall_score integer NOT NULL,
    score_components jsonb NOT NULL,
    requirements_analysis jsonb NOT NULL,
    recommendations jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_matches OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider character varying(50) NOT NULL,
    provider_transaction_id character varying(255) NOT NULL,
    order_id character varying(255) NOT NULL,
    amount_minor integer NOT NULL,
    currency character varying(10) DEFAULT 'INR'::character varying NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    idempotency_key character varying(255) NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: resume_analyses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resume_analyses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    resume_id uuid NOT NULL,
    analysis_type character varying(50) NOT NULL,
    score integer NOT NULL,
    findings jsonb DEFAULT '{}'::jsonb NOT NULL,
    recommendations jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resume_analyses OWNER TO postgres;

--
-- Name: resume_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resume_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resume_id uuid NOT NULL,
    version_number integer NOT NULL,
    change_summary character varying(255) NOT NULL,
    content_snapshot jsonb NOT NULL,
    job_match_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resume_versions OWNER TO postgres;

--
-- Name: resumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resumes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    template_key character varying(100) DEFAULT 'clean-modern'::character varying NOT NULL,
    locale character varying(20) DEFAULT 'en-US'::character varying NOT NULL,
    is_master boolean DEFAULT false NOT NULL,
    is_archived boolean DEFAULT false NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resumes OWNER TO postgres;

--
-- Name: templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_key character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(500) NOT NULL,
    is_free boolean DEFAULT true NOT NULL,
    layout_options jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.templates OWNER TO postgres;

--
-- Name: typeorm_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.typeorm_migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.typeorm_migrations OWNER TO postgres;

--
-- Name: typeorm_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.typeorm_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.typeorm_migrations_id_seq OWNER TO postgres;

--
-- Name: typeorm_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.typeorm_migrations_id_seq OWNED BY public.typeorm_migrations.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_revoked boolean DEFAULT false NOT NULL,
    user_agent character varying(255),
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: typeorm_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.typeorm_migrations ALTER COLUMN id SET DEFAULT nextval('public.typeorm_migrations_id_seq'::regclass);


--
-- Data for Name: candidate_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_profiles (id, user_id, headline, summary, location, phone, linkedin_url, github_url, website_url, skills, experience, education, projects, certifications, created_at, updated_at) FROM stdin;
0b82c798-beb7-425b-84c3-c753b92faac9	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Senior Full Stack Engineer	Full-stack software engineer with 6+ years of experience architecting distributed cloud systems, real-time reactive applications, and high-throughput microservices using TypeScript, React, Next.js, Node.js, and PostgreSQL.	Bengaluru, India	+91 98765 43210	\N	\N	\N	[{"name": "TypeScript", "level": "expert", "category": "Language"}, {"name": "React", "level": "expert", "category": "Frontend"}, {"name": "Next.js", "level": "expert", "category": "Frontend"}, {"name": "Node.js", "level": "advanced", "category": "Backend"}, {"name": "NestJS", "level": "advanced", "category": "Backend"}, {"name": "PostgreSQL", "level": "advanced", "category": "Database"}, {"name": "Redis", "level": "intermediate", "category": "Database"}, {"name": "Docker", "level": "intermediate", "category": "DevOps"}, {"name": "AWS", "level": "intermediate", "category": "Cloud"}]	[{"title": "Senior Full Stack Engineer", "bullets": ["Architected high-throughput microservices handling 25,000+ RPS with 99.98% uptime using Node.js, NestJS, and PostgreSQL.", "Engineered real-time reactive dashboard using Next.js 15 and Tailwind CSS, reducing average page latency by 42%.", "Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time from 4 days to 45 minutes."], "company": "Acme Cloud Systems", "current": true, "location": "Bengaluru, India", "startDate": "2023-01"}, {"title": "Full Stack Software Engineer", "bullets": ["Spearheaded design and development of core fintech payment settlement workflows processing ₹50M+ in daily transaction volume.", "Optimized complex SQL queries and created composite indexes, reducing p99 database query response times by 65%.", "Collaborated with product designers to implement responsive, accessible WCAG 2.1 AA compliant customer portals."], "company": "Nexus Tech Labs", "current": false, "endDate": "2022-12", "location": "Hyderabad, India", "startDate": "2020-06"}]	[{"gpa": "8.8/10.0", "field": "Computer Science and Engineering", "degree": "Bachelor of Technology", "school": "National Institute of Technology", "graduationDate": "2020-05"}]	[{"url": "https://github.com/initAbhi/Hyper-Resume", "name": "HyperResume Platform", "highlights": ["Built with Next.js 15, NestJS, and PostgreSQL", "Evidence-based parsing"], "skillsUsed": ["TypeScript", "Next.js", "NestJS", "TypeORM", "PostgreSQL"], "description": "Privacy-centric ATS resume optimization engine with grounded evidence validation."}]	[{"name": "AWS Certified Solutions Architect – Associate", "issuer": "Amazon Web Services", "issueDate": "2023-08"}]	2026-10-19 13:36:54.799948+05:30	2026-10-19 13:36:54.799948+05:30
\.


--
-- Data for Name: credit_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_ledger (id, user_id, amount, transaction_type, idempotency_key, description, metadata, created_at) FROM stdin;
28ae2afe-e239-46e7-8f39-2429946e5c8f	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	35	signup_bonus	seed-welcome-dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Initial welcome credit bonus for testing and evaluation	\N	2026-10-19 13:36:54.842695+05:30
c8664f81-418b-49c3-a747-1e39be77e5ad	36122670-7345-44a4-ae9c-fdda2ce99bb6	1000	signup_bonus	seed-welcome-36122670-7345-44a4-ae9c-fdda2ce99bb6	System administrator operational credit allocation	\N	2026-10-19 13:36:54.858469+05:30
5476c307-9dfd-456a-9f8d-bab6f8e7ced4	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	-1	resume_analysis	match-6e6a74c9-d501-4e30-b37e-7ac3a4e1b37e	Job match analysis: Target Role	{"matchId": "6e6a74c9-d501-4e30-b37e-7ac3a4e1b37e"}	2026-10-19 15:31:26.099744+05:30
251cab0d-7d42-491c-8a8d-6ac6b3710b75	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	-1	resume_analysis	match-d26c50f6-8fcc-4039-84bc-341cb4a5ebd2	Job match analysis: Target Role	{"matchId": "d26c50f6-8fcc-4039-84bc-341cb4a5ebd2"}	2026-10-19 15:39:46.563925+05:30
\.


--
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_applications (id, user_id, resume_version_id, company, role, job_url, status, applied_date, notes, created_at, updated_at) FROM stdin;
e144c841-6bc2-4643-91b2-880c583ea5e1	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	0dd5431d-4b09-4869-a1b1-f77c198508e6	Google	Staff Software Engineer	\N	applied	2026-10-19	Referred by engineering director	2026-10-19 20:49:28.170017+05:30	2026-10-19 20:49:28.170017+05:30
190597b6-1c05-47e8-801e-d81ede21b4f0	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	0dd5431d-4b09-4869-a1b1-f77c198508e6	something	se	\N	applied	2026-10-19	\N	2026-10-19 20:53:23.401024+05:30	2026-10-19 20:53:23.401024+05:30
17d0143b-c5aa-4c2a-b900-91da4032660b	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	0dd5431d-4b09-4869-a1b1-f77c198508e6	Acme Corp	Operations Manager - Sample Job	\N	bookmarked	\N	{"salary":"$140k - $175k","location":"Remote","excitement":5,"savedDate":"2026-10-19","interviews":[{"id":"round-1","roundName":"1st Interview","date":"","type":"Phone Screen","format":"Video Call","interviewers":[{"name":"","title":""}]}],"contacts":[],"checklist":[{"id":"1","text":"Tailor resume with job description keywords","completed":false,"category":"applying"},{"id":"2","text":"Review team background on LinkedIn","completed":false,"category":"applying"},{"id":"3","text":"Follow up after 5 business days","completed":false,"category":"interviewing"}],"postedDate":"","deadline":"","followUpDate":"","jobDescription":"Job Responsibilities:\\n• Lead technical design and implementation of distributed systems\\n• Collaborate with cross-functional product and design teams\\n• Optimize performance, scalability, and cloud infrastructure reliability\\n\\nRequirements:\\n• Experience with modern microservices, CI/CD pipelines, and cloud APIs\\n• Strong communication and architectural leadership skills","notesText":""}	2026-10-19 21:12:05.819039+05:30	2026-10-19 21:22:13.848429+05:30
\.


--
-- Data for Name: job_descriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_descriptions (id, user_id, title, company_name, original_text, parsed_requirements, source_url, created_at, updated_at) FROM stdin;
40825221-e6d8-4ff1-aaf7-108156221ac5	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Target Role	eg company	Software Engineer (SE-I)\nExample Company · Full-time · Engineering\n2–3 years experience\nFull Stack\nRemote / Hybrid\n\n\n\n\nAbout the role\nWe are looking for a Software Engineer to design, develop, and maintain scalable web applications. You will work with product managers, designers, and other engineers to build reliable software, improve application performance, and deliver high-quality features.\nResponsibilities\n- Design, develop, and maintain backend APIs using Node.js and NestJS.\n- Build responsive frontend applications using React.js and Next.js.\n- Design database schemas and optimize SQL queries using PostgreSQL.\n- Write clean, reusable, maintainable, and well-tested code.\n- Debug production issues and improve application performance.\n- Participate in code reviews and technical design discussions.\n- Collaborate with cross-functional teams to deliver features.\n- Contribute to CI/CD pipelines, monitoring, and deployment processes.\nRequired qualifications\n- 2+ years of professional software development experience.\n- Strong knowledge of JavaScript and TypeScript.\n- Hands-on experience with React.js and Node.js.\n- Experience building REST APIs and working with authentication systems such as JWT.\n- Good understanding of PostgreSQL, SQL queries, joins, indexes, and transactions.\n- Familiarity with Git, Linux, and basic networking concepts.\n- Understanding of data structures, algorithms, OOP, and common design patterns.\n- Experience debugging complex technical issues.\nPreferred qualifications\n- Experience with AWS services such as EC2, RDS, and S3.\n- Familiarity with Docker and CI/CD pipelines.\n- Knowledge of caching, queues, and distributed systems fundamentals.\n- Experience monitoring and troubleshooting production applications.\nCompensation\n- Experience: 2–3 years\n- Location: India\n- Illustrative salary range: ₹8–15 LPA, depending on company and candidate experience.\nInterview process\n1. Online coding assessment — DSA and problem-solving.\n2. Technical Round 1 — JavaScript/TypeScript, coding, and SQL.\n3. Technical Round 2 — Backend architecture, APIs, databases, and debugging.\n4. Hiring Manager Round — Project ownership, collaboration, and behavioral questions.\n\nWhat you should prepare for this JD\nGiven your full-stack background, these are the areas I would prioritize:\nPriority\tTopics\n1\tJavaScript, TypeScript, promises, event loop, closures\n2\tNode.js, NestJS, dependency injection, middleware, guards\n3\tPostgreSQL, joins, indexes, query optimization, transactions\n4\tDSA — arrays, strings, hash maps, trees, binary search\n5\tSystem design — caching, queues, scaling, database bottlenecks\n6\tProject deep dives — architecture, production incidents, trade-offs\nImportant: This is a sample JD, not a live job listing. Actual requirements and salaries vary by company.\n\nA Software Engineer role can mean different things depending on the company. For your preparation, the most useful distinction is between a Full Stack Software Engineer, a Backend Software Engineer, and a general Software Engineer at a product-based company.	[{"id": "req-1", "text": "2+ years of professional software development experience.", "type": "experience", "keywords": ["software development", "experience", "2+ years"], "importance": "critical"}, {"id": "req-2", "text": "Strong knowledge of JavaScript and TypeScript.", "type": "required_skill", "keywords": ["JavaScript", "TypeScript"], "importance": "critical"}, {"id": "req-3", "text": "Hands-on experience with React.js and Node.js.", "type": "required_skill", "keywords": ["React.js", "Node.js"], "importance": "critical"}, {"id": "req-4", "text": "Experience building REST APIs and working with authentication systems such as JWT.", "type": "required_skill", "keywords": ["REST APIs", "authentication", "JWT"], "importance": "high"}, {"id": "req-5", "text": "Good understanding of PostgreSQL, SQL queries, joins, indexes, and transactions.", "type": "required_skill", "keywords": ["PostgreSQL", "SQL", "queries", "transactions"], "importance": "high"}, {"id": "req-6", "text": "Familiarity with Git, Linux, and basic networking concepts.", "type": "required_skill", "keywords": ["Git", "Linux", "networking"], "importance": "medium"}, {"id": "req-7", "text": "Understanding of data structures, algorithms, OOP, and common design patterns.", "type": "required_skill", "keywords": ["data structures", "algorithms", "OOP", "design patterns"], "importance": "high"}, {"id": "req-8", "text": "Experience debugging complex technical issues.", "type": "experience", "keywords": ["debugging", "troubleshooting"], "importance": "high"}, {"id": "req-9", "text": "Experience with AWS services such as EC2, RDS, and S3.", "type": "preferred_skill", "keywords": ["AWS", "EC2", "RDS", "S3"], "importance": "medium"}, {"id": "req-10", "text": "Familiarity with Docker and CI/CD pipelines.", "type": "preferred_skill", "keywords": ["Docker", "CI/CD"], "importance": "medium"}, {"id": "req-11", "text": "Knowledge of caching, queues, and distributed systems fundamentals.", "type": "preferred_skill", "keywords": ["caching", "queues", "distributed systems"], "importance": "medium"}, {"id": "req-12", "text": "Experience monitoring and troubleshooting production applications.", "type": "preferred_skill", "keywords": ["monitoring", "troubleshooting", "production"], "importance": "medium"}, {"id": "req-13", "text": "Design, develop, and maintain backend APIs using Node.js and NestJS.", "type": "responsibility", "keywords": ["backend", "APIs", "Node.js", "NestJS"], "importance": "critical"}, {"id": "req-14", "text": "Build responsive frontend applications using React.js and Next.js.", "type": "responsibility", "keywords": ["frontend", "React.js", "Next.js"], "importance": "critical"}, {"id": "req-15", "text": "Design database schemas and optimize SQL queries using PostgreSQL.", "type": "responsibility", "keywords": ["database schemas", "SQL optimization", "PostgreSQL"], "importance": "high"}]	\N	2026-10-19 15:31:10.91792+05:30	2026-10-19 15:31:10.91792+05:30
06332723-efca-4648-9e7a-400f512fc8a7	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Target Role	sdf	Software Engineer (SE-I)\nExample Company · Full-time · Engineering\n2–3 years experience\nFull Stack\nRemote / Hybrid\n\n\n\n\nAbout the role\nWe are looking for a Software Engineer to design, develop, and maintain scalable web applications. You will work with product managers, designers, and other engineers to build reliable software, improve application performance, and deliver high-quality features.\nResponsibilities\n- Design, develop, and maintain backend APIs using Node.js and NestJS.\n- Build responsive frontend applications using React.js and Next.js.\n- Design database schemas and optimize SQL queries using PostgreSQL.\n- Write clean, reusable, maintainable, and well-tested code.\n- Debug production issues and improve application performance.\n- Participate in code reviews and technical design discussions.\n- Collaborate with cross-functional teams to deliver features.\n- Contribute to CI/CD pipelines, monitoring, and deployment processes.\nRequired qualifications\n- 2+ years of professional software development experience.\n- Strong knowledge of JavaScript and TypeScript.\n- Hands-on experience with React.js and Node.js.\n- Experience building REST APIs and working with authentication systems such as JWT.\n- Good understanding of PostgreSQL, SQL queries, joins, indexes, and transactions.\n- Familiarity with Git, Linux, and basic networking concepts.\n- Understanding of data structures, algorithms, OOP, and common design patterns.\n- Experience debugging complex technical issues.\nPreferred qualifications\n- Experience with AWS services such as EC2, RDS, and S3.\n- Familiarity with Docker and CI/CD pipelines.\n- Knowledge of caching, queues, and distributed systems fundamentals.\n- Experience monitoring and troubleshooting production applications.\nCompensation\n- Experience: 2–3 years\n- Location: India\n- Illustrative salary range: ₹8–15 LPA, depending on company and candidate experience.\nInterview process\n1. Online coding assessment — DSA and problem-solving.\n2. Technical Round 1 — JavaScript/TypeScript, coding, and SQL.\n3. Technical Round 2 — Backend architecture, APIs, databases, and debugging.\n4. Hiring Manager Round — Project ownership, collaboration, and behavioral questions.\n\nWhat you should prepare for this JD\nGiven your full-stack background, these are the areas I would prioritize:\nPriority\tTopics\n1\tJavaScript, TypeScript, promises, event loop, closures\n2\tNode.js, NestJS, dependency injection, middleware, guards\n3\tPostgreSQL, joins, indexes, query optimization, transactions\n4\tDSA — arrays, strings, hash maps, trees, binary search\n5\tSystem design — caching, queues, scaling, database bottlenecks\n6\tProject deep dives — architecture, production incidents, trade-offs\nImportant: This is a sample JD, not a live job listing. Actual requirements and salaries vary by company.\n\nA Software Engineer role can mean different things depending on the company. For your preparation, the most useful distinction is between a Full Stack Software Engineer, a Backend Software Engineer, and a general Software Engineer at a product-based company.	[{"id": "req-1", "text": "2+ years of professional software development experience", "type": "experience", "keywords": ["experience", "software development", "2+ years"], "importance": "critical"}, {"id": "req-2", "text": "Strong knowledge of JavaScript and TypeScript", "type": "required_skill", "keywords": ["JavaScript", "TypeScript"], "importance": "critical"}, {"id": "req-3", "text": "Hands-on experience with React.js and Node.js", "type": "required_skill", "keywords": ["React.js", "Node.js", "frontend", "backend"], "importance": "critical"}, {"id": "req-4", "text": "Experience building REST APIs and working with authentication systems such as JWT", "type": "required_skill", "keywords": ["REST APIs", "authentication", "JWT"], "importance": "high"}, {"id": "req-5", "text": "Good understanding of PostgreSQL, SQL queries, joins, indexes, and transactions", "type": "required_skill", "keywords": ["PostgreSQL", "SQL", "databases", "queries"], "importance": "high"}, {"id": "req-6", "text": "Familiarity with Git, Linux, and basic networking concepts", "type": "required_skill", "keywords": ["Git", "Linux", "networking"], "importance": "medium"}, {"id": "req-7", "text": "Understanding of data structures, algorithms, OOP, and common design patterns", "type": "required_skill", "keywords": ["data structures", "algorithms", "OOP", "design patterns"], "importance": "high"}, {"id": "req-8", "text": "Experience debugging complex technical issues", "type": "experience", "keywords": ["debugging", "troubleshooting"], "importance": "high"}, {"id": "req-9", "text": "Experience with AWS services such as EC2, RDS, and S3", "type": "preferred_skill", "keywords": ["AWS", "EC2", "RDS", "S3", "cloud"], "importance": "medium"}, {"id": "req-10", "text": "Familiarity with Docker and CI/CD pipelines", "type": "preferred_skill", "keywords": ["Docker", "CI/CD", "devops"], "importance": "medium"}, {"id": "req-11", "text": "Knowledge of caching, queues, and distributed systems fundamentals", "type": "preferred_skill", "keywords": ["caching", "queues", "distributed systems"], "importance": "medium"}, {"id": "req-12", "text": "Experience monitoring and troubleshooting production applications", "type": "preferred_skill", "keywords": ["monitoring", "troubleshooting", "production"], "importance": "medium"}, {"id": "req-13", "text": "Design, develop, and maintain backend APIs using Node.js and NestJS", "type": "responsibility", "keywords": ["Node.js", "NestJS", "backend", "APIs"], "importance": "critical"}, {"id": "req-14", "text": "Build responsive frontend applications using React.js and Next.js", "type": "responsibility", "keywords": ["React.js", "Next.js", "frontend", "responsive"], "importance": "critical"}, {"id": "req-15", "text": "Design database schemas and optimize SQL queries using PostgreSQL", "type": "responsibility", "keywords": ["database schemas", "SQL queries", "PostgreSQL", "optimization"], "importance": "high"}, {"id": "req-16", "text": "Write clean, reusable, maintainable, and well-tested code", "type": "responsibility", "keywords": ["clean code", "maintainable", "tested"], "importance": "high"}, {"id": "req-17", "text": "Debug production issues and improve application performance", "type": "responsibility", "keywords": ["debug", "performance", "production"], "importance": "high"}, {"id": "req-18", "text": "Participate in code reviews and technical design discussions", "type": "responsibility", "keywords": ["code reviews", "technical design"], "importance": "medium"}, {"id": "req-19", "text": "Collaborate with cross-functional teams to deliver features", "type": "responsibility", "keywords": ["collaboration", "cross-functional"], "importance": "medium"}, {"id": "req-20", "text": "Contribute to CI/CD pipelines, monitoring, and deployment processes", "type": "responsibility", "keywords": ["CI/CD", "monitoring", "deployment"], "importance": "medium"}]	\N	2026-10-19 15:39:40.402568+05:30	2026-10-19 15:39:40.402568+05:30
\.


--
-- Data for Name: job_matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_matches (id, user_id, resume_id, job_description_id, overall_score, score_components, requirements_analysis, recommendations, created_at) FROM stdin;
6e6a74c9-d501-4e30-b37e-7ac3a4e1b37e	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	21a7c198-3fa6-488a-aad9-6c35d31a58c8	40825221-e6d8-4ff1-aaf7-108156221ac5	91	{"experienceScore": 88, "formattingScore": 95, "requiredSkillsScore": 83, "responsibilityScore": 100, "preferredSkillsScore": 100}	[{"status": "supported", "confidence": 1, "explanation": "The candidate explicitly states having 2+ years of professional software development experience in the summary.", "requirementId": "req-1", "evidenceQuotes": ["Full Stack Developer with 2+ years of experience building and scaling production-grade web applications and backend systems."], "suggestedAction": "None needed."}, {"status": "supported", "confidence": 1, "explanation": "Candidate lists JavaScript and TypeScript under skills and mentions using TypeScript in project highlights.", "requirementId": "req-2", "evidenceQuotes": ["Designed React + TypeScript dashboard for strategy setup", "TypeScript", "JavaScript"], "suggestedAction": "None needed."}, {"status": "supported", "confidence": 1, "explanation": "Candidate lists React and Node.js in their skills and provides hands-on context through projects and experience.", "requirementId": "req-3", "evidenceQuotes": ["Architected and scaled backend infrastructure using NestJS and AWS", "Designed React + TypeScript dashboard", "Node.js", "React"], "suggestedAction": "None needed."}, {"status": "supported", "confidence": 1, "explanation": "REST APIs and JWT are explicitly listed under skills.", "requirementId": "req-4", "evidenceQuotes": ["REST APIs", "JWT"], "suggestedAction": "Include specific experience bullet points demonstrating API and authentication implementations if possible."}, {"status": "supported", "confidence": 1, "explanation": "PostgreSQL is listed in skills, and database query optimization is mentioned in the experience section.", "requirementId": "req-5", "evidenceQuotes": ["Optimized database queries and streamlined server code to maximize throughput on limited resources", "PostgreSQL"], "suggestedAction": "Add explicit mentions of SQL joins, indexes, and transactions to fully map out the keyword requirements."}, {"status": "supported", "confidence": 1, "explanation": "Git is listed in the candidate's skills. Linux and basic networking are not explicitly detailed in the experience bullets, but Git provides direct support.", "requirementId": "req-6", "evidenceQuotes": ["Git", "GitHub"], "suggestedAction": "Mention Linux and networking experience if applicable."}, {"status": "not_evidenced", "confidence": 0.9, "explanation": "Data structures, algorithms, object-oriented programming (OOP), and design patterns are not explicitly mentioned in the resume summary, skills, or experience bullets.", "requirementId": "req-7", "evidenceQuotes": [], "suggestedAction": "Add examples of algorithms, data structures, or design patterns used in projects if the candidate has this experience."}, {"status": "supported", "confidence": 0.9, "explanation": "Candidate demonstrates troubleshooting and addressing production traffic/scaling issues, which falls under debugging complex technical issues.", "requirementId": "req-8", "evidenceQuotes": ["Maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes during high-scale ad campaigns."], "suggestedAction": "Add explicit debugging terms or troubleshooting stories to the experience bullets."}, {"status": "supported", "confidence": 1, "explanation": "Candidate lists AWS (EC2, S3, Lambda) in skills and details hands-on usage of EC2 and S3 in project highlights.", "requirementId": "req-9", "evidenceQuotes": ["AWS (EC2, S3, Lambda)", "Built scalable backend services using NestJS and integrated AWS S3 for distributed object storage", "Deployed and managed production infrastructure on AWS EC2"], "suggestedAction": "None needed."}, {"status": "supported", "confidence": 1, "explanation": "Docker and CI/CD tools (GitHub Actions, Jenkins) are explicitly listed in the skills section.", "requirementId": "req-10", "evidenceQuotes": ["Docker", "CI/CD (GitHub Actions, Jenkins)"], "suggestedAction": "Add a project or experience bullet showing Docker containerization or CI/CD pipeline setup in action."}, {"status": "supported", "confidence": 1, "explanation": "Candidate lists caching (Redis), queues (Bull queues), and distributed background processing/systems in both skills and experience.", "requirementId": "req-11", "evidenceQuotes": ["Redis", "Bull Queues", "Implemented highly resilient task processing using Redis and Bull queues to handle complex user matching algorithms, distributed background jobs, and real-time notifications."], "suggestedAction": "None needed."}, {"status": "supported", "confidence": 1, "explanation": "Candidate explicitly mentions monitoring, deployment, scaling, and production management in summary and project highlights.", "requirementId": "req-12", "evidenceQuotes": ["Managed infrastructure including AWS EC2, S3, and Cloudflare with server monitoring, automated backups, and deployment pipelines.", "Experienced in independently taking products from development through deployment, monitoring, and scaling."], "suggestedAction": "None needed."}, {"status": "supported", "confidence": 1, "explanation": "Candidate details designing and developing backend APIs using Node.js and NestJS in their experience and project highlights.", "requirementId": "req-13", "evidenceQuotes": ["Designed scalable backend APIs using NestJS with modular architecture focused on performance and reliability.", "Architected and scaled backend infrastructure using NestJS and AWS"], "suggestedAction": "None needed."}, {"status": "supported", "confidence": 1, "explanation": "Candidate lists Next.js and React in skills and mentions building frontends/dashboards with React in project descriptions.", "requirementId": "req-14", "evidenceQuotes": ["Designed React + TypeScript dashboard for strategy setup and performance tracking", "Next.js", "React"], "suggestedAction": "Add a specific mention of building frontend applications using Next.js to project highlights."}, {"status": "supported", "confidence": 0.9, "explanation": "Candidate lists PostgreSQL in skills and references optimizing database queries in the experience section.", "requirementId": "req-15", "evidenceQuotes": ["Optimized database queries and streamlined server code to maximize throughput on limited resources", "PostgreSQL"], "suggestedAction": "Explicitly mention database schema design using PostgreSQL in the project or experience bullets."}]	["Missing evidence for 1 requirement(s). If you possess these capabilities, add them to your Master Profile before generating a tailored submission. Never invent credentials.", "Highlight your verified strengths (14 matched requirements) prominently near the top of your experience bullets."]	2026-10-19 15:31:26.077724+05:30
d26c50f6-8fcc-4039-84bc-341cb4a5ebd2	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	21a7c198-3fa6-488a-aad9-6c35d31a58c8	06332723-efca-4648-9e7a-400f512fc8a7	54	{"experienceScore": 88, "formattingScore": 95, "requiredSkillsScore": 17, "responsibilityScore": 38, "preferredSkillsScore": 75}	[{"status": "supported", "confidence": 1, "explanation": "The summary explicitly states the candidate has 2+ years of professional software development experience.", "requirementId": "req-1", "evidenceQuotes": ["Full Stack Developer with 2+ years of experience building and scaling production-grade web applications and backend systems."], "suggestedAction": "None required."}, {"status": "needs_confirmation", "confidence": 0.8, "explanation": "JavaScript and TypeScript are listed in the candidate's skills section, but specific experience bullets detailing their direct use are sparse.", "requirementId": "req-2", "evidenceQuotes": ["TypeScript", "JavaScript"], "suggestedAction": "Confirm specific projects or responsibilities utilizing JavaScript and TypeScript in experience bullets."}, {"status": "supported", "confidence": 0.9, "explanation": "The candidate's experience and project sections demonstrate hands-on experience with Node.js/NestJS and React.", "requirementId": "req-3", "evidenceQuotes": ["Architected and scaled backend infrastructure using NestJS and AWS", "Designed React + TypeScript dashboard"], "suggestedAction": "None required."}, {"status": "needs_confirmation", "confidence": 0.7, "explanation": "REST APIs and JWT are listed under skills, but the experience bullets do not explicitly describe building REST APIs or working with JWT authentication.", "requirementId": "req-4", "evidenceQuotes": ["REST APIs", "JWT"], "suggestedAction": "Add details in the experience section highlighting REST API creation and JWT implementation."}, {"status": "needs_confirmation", "confidence": 0.7, "explanation": "PostgreSQL is listed in the skills and summary, and optimized database queries are mentioned, but deeper details regarding joins, indexes, and transactions are not explicitly documented in the experience bullets.", "requirementId": "req-5", "evidenceQuotes": ["PostgreSQL"], "suggestedAction": "Clarify PostgreSQL experience regarding indexes, joins, and transactions in the experience bullets."}, {"status": "needs_confirmation", "confidence": 0.6, "explanation": "Git/GitHub are listed in skills, but Linux and basic networking concepts are not explicitly evidenced in the provided resume text.", "requirementId": "req-6", "evidenceQuotes": ["Git", "GitHub"], "suggestedAction": "Add evidence of Linux and networking usage if applicable."}, {"status": "not_evidenced", "confidence": 1, "explanation": "Data structures, algorithms, OOP, and design patterns are not mentioned in the skills or experience sections of the resume.", "requirementId": "req-7", "evidenceQuotes": [], "suggestedAction": "Incorporate relevant computer science fundamentals and design patterns if the candidate possesses them."}, {"status": "supported", "confidence": 0.9, "explanation": "The candidate demonstrates experience troubleshooting and optimizing server code and performance under traffic spikes.", "requirementId": "req-8", "evidenceQuotes": ["Optimized database queries and streamlined server code to maximize throughput on limited resources; maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes"], "suggestedAction": "None required."}, {"status": "supported", "confidence": 1, "explanation": "The resume explicitly mentions hands-on work with AWS services like EC2 and S3 across multiple projects.", "requirementId": "req-9", "evidenceQuotes": ["Deployed and managed production infrastructure on AWS EC2, implementing monitoring, server optimization...", "Managed infrastructure including AWS EC2, S3, and Cloudflare"], "suggestedAction": "None required."}, {"status": "needs_confirmation", "confidence": 0.7, "explanation": "Docker and CI/CD tools are listed in the skills section, but there are no direct mentions of contributing to CI/CD pipelines or using Docker in the experience bullets.", "requirementId": "req-10", "evidenceQuotes": ["Docker", "CI/CD (GitHub Actions, Jenkins)"], "suggestedAction": "Include specific mentions of Docker and CI/CD pipeline usage in the experience descriptions."}, {"status": "supported", "confidence": 0.9, "explanation": "The candidate has clear experience with caching/queues (Redis, Bull queues) and distributed background jobs.", "requirementId": "req-11", "evidenceQuotes": ["Implemented highly resilient task processing using Redis and Bull queues to handle complex user matching algorithms, distributed background jobs, and real-time notifications."], "suggestedAction": "None required."}, {"status": "supported", "confidence": 0.9, "explanation": "Experience monitoring and managing production infrastructure/applications is documented in the experience bullets.", "requirementId": "req-12", "evidenceQuotes": ["Managed infrastructure including AWS EC2, S3, and Cloudflare with server monitoring, automated backups, and deployment pipelines.", "Architected and scaled backend infrastructure using NestJS and AWS, successfully supporting a growing user base of over 500,000"], "suggestedAction": "None required."}, {"status": "supported", "confidence": 1, "explanation": "The candidate provides clear evidence of designing, developing, and maintaining backend APIs using Node.js/NestJS.", "requirementId": "req-13", "evidenceQuotes": ["Architected and scaled backend infrastructure using NestJS and AWS", "Designed scalable backend APIs using NestJS with modular architecture"], "suggestedAction": "None required."}, {"status": "needs_confirmation", "confidence": 0.6, "explanation": "Next.js and React are listed in skills and mentioned in project contexts, but building responsive frontend applications using Next.js is not deeply detailed in the main experience bullets.", "requirementId": "req-14", "evidenceQuotes": ["Designed React + TypeScript dashboard for strategy setup", "Next.js"], "suggestedAction": "Expand on frontend responsibilities involving React.js and Next.js within the professional experience section."}, {"status": "needs_confirmation", "confidence": 0.7, "explanation": "PostgreSQL and query optimization are mentioned, but designing database schemas using PostgreSQL is not explicitly detailed in the experience bullets.", "requirementId": "req-15", "evidenceQuotes": ["Optimized database queries and streamlined server code"], "suggestedAction": "Add details regarding PostgreSQL schema design to the experience bullets."}, {"status": "needs_confirmation", "confidence": 0.6, "explanation": "Writing clean/maintainable code is a general trait, but explicit testing or code quality practices are not deeply highlighted in the experience bullets.", "requirementId": "req-16", "evidenceQuotes": ["Streamlined server code to maximize throughput"], "suggestedAction": "Mention writing tests or utilizing clean code principles in the experience section."}, {"status": "supported", "confidence": 0.9, "explanation": "The candidate details production performance optimization and handling massive traffic spikes under high-scale operations.", "requirementId": "req-17", "evidenceQuotes": ["Optimized database queries and streamlined server code to maximize throughput on limited resources; maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes"], "suggestedAction": "None required."}, {"status": "not_evidenced", "confidence": 1, "explanation": "Code reviews and technical design discussions are not explicitly mentioned in the resume.", "requirementId": "req-18", "evidenceQuotes": [], "suggestedAction": "Add details about participating in code reviews or leading technical design if applicable."}, {"status": "not_evidenced", "confidence": 1, "explanation": "Collaboration with cross-functional teams is not explicitly documented in the experience bullets.", "requirementId": "req-19", "evidenceQuotes": [], "suggestedAction": "Include examples of collaborating with cross-functional teams (e.g., product, QA, design) if applicable."}, {"status": "supported", "confidence": 0.8, "explanation": "The candidate documents working with deployment pipelines, monitoring, and infrastructure deployment processes.", "requirementId": "req-20", "evidenceQuotes": ["Managed infrastructure including AWS EC2, S3, and Cloudflare with server monitoring, automated backups, and deployment pipelines."], "suggestedAction": "None required."}]	["Missing evidence for 3 requirement(s). If you possess these capabilities, add them to your Master Profile before generating a tailored submission. Never invent credentials.", "8 skill(s) are listed in your skills vault without supporting bullets demonstrating production impact. Click to add context bullets.", "Highlight your verified strengths (9 matched requirements) prominently near the top of your experience bullets."]	2026-10-19 15:39:46.54871+05:30
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, user_id, provider, provider_transaction_id, order_id, amount_minor, currency, status, idempotency_key, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: resume_analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resume_analyses (id, user_id, resume_id, analysis_type, score, findings, recommendations, created_at) FROM stdin;
90aceb67-8490-48ee-8258-532fd0841145	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	21a7c198-3fa6-488a-aad9-6c35d31a58c8	ats_check	85	{"metricsCount": 1, "bulletQuality": [{"bullet": "Oodle – Global Dating Platform (Play Store & App Store): Architected and scaled backend infrastructure using NestJS and AWS, successfully supporting a growing user base of over 500,000 (5 Lakh) total users globally.", "feedback": "Strong impact statement", "hasMetric": true, "hasActionVerb": true}, {"bullet": "High-Availability & Optimization: Optimized database queries and streamlined server code to maximize throughput on limited resources; maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes during high-scale ad campaigns.", "feedback": "Include measurable metric (e.g. % improvement, latency reduction)", "hasMetric": false, "hasActionVerb": true}, {"bullet": "Automated Identity & Verification: Integrated AWS Rekognition to automate user identity verification and instantly detect artificial imagery/fake profiles, drastically improving platform integrity.", "feedback": "Include measurable metric (e.g. % improvement, latency reduction)", "hasMetric": false, "hasActionVerb": true}, {"bullet": "Marketing Integrations: Configured and managed Apple Search Ads (ASA) APIs to track attribution and optimize the platform’s global marketing reach.", "feedback": "Missing active strong verb and quantifiable outcome", "hasMetric": false, "hasActionVerb": false}, {"bullet": "Asynchronous Architecture: Implemented highly resilient task processing using Redis and Bull queues to handle complex user matching algorithms, distributed background jobs, and real-time notifications.", "feedback": "Include measurable metric (e.g. % improvement, latency reduction)", "hasMetric": false, "hasActionVerb": true}], "formattingFlags": [], "missingSections": [], "actionVerbsCount": 4}	["Quantify at least 50% of your experience bullets with measurable metrics, percentages, or scale."]	2026-10-19 15:30:21.243842+05:30
\.


--
-- Data for Name: resume_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resume_versions (id, resume_id, version_number, change_summary, content_snapshot, job_match_id, created_at) FROM stdin;
d0e9292d-4468-413e-ac28-05afeea7e32c	ebb2c2ca-0119-4682-a704-dc55d7462677	1	Initial version created	{"skills": [{"name": "Go", "category": "Technical Skills"}], "contact": {"email": "", "fullName": "Candidate", "location": "Remote"}, "summary": "Experienced engineer with demonstrated background in distributed software systems.", "headline": "x cbd g b 8 XR@ j @B L LK@ A @B H j 3@BV H0 0 QP d ( x c b 6 g b D PY s5g ; 8S j iF q E x ZYs 8 P V R5 YYv ; Lv D 4@P R f 1Z 1p 9 Y 7G u vF k t i z a ", "projects": [], "education": [{"field": "Computer Science", "degree": "Bachelor of Science", "school": "University of Technology", "graduationDate": "2021"}], "experience": [], "certifications": []}	\N	2026-10-19 14:20:56.49402+05:30
c9fb673f-c2cf-46c4-bae8-b89b8e40848b	ee52e9cc-370c-4076-8818-7444e90659f9	1	Initial version created	{"skills": [{"name": "Next.js", "category": "Frontend"}, {"name": "React", "category": "Frontend"}, {"name": "Tailwind CSS", "category": "Frontend"}, {"name": "ShadCN", "category": "Frontend"}, {"name": "Redux", "category": "Frontend"}, {"name": "TypeScript", "category": "Frontend"}, {"name": "JavaScript", "category": "Frontend"}, {"name": "Node.js", "category": "Backend"}, {"name": "NestJS", "category": "Backend"}, {"name": "Express", "category": "Backend"}, {"name": "REST APIs", "category": "Backend"}, {"name": "Microservices", "category": "Backend"}, {"name": "Redis", "category": "Backend"}, {"name": "Bull Queues", "category": "Backend"}, {"name": "WebSockets", "category": "Backend"}, {"name": "WebRTC", "category": "Backend"}, {"name": "Auth.js", "category": "Backend"}, {"name": "JWT", "category": "Backend"}, {"name": "MongoDB", "category": "Databases"}, {"name": "PostgreSQL", "category": "Databases"}, {"name": "Prisma", "category": "ORMs"}, {"name": "Mongoose", "category": "ORMs"}, {"name": "Convex", "category": "ORMs"}, {"name": "AWS (EC2, S3, Lambda)", "category": "DevOps & Cloud"}, {"name": "Docker", "category": "DevOps & Cloud"}, {"name": "Kubernetes", "category": "DevOps & Cloud"}, {"name": "Cloudflare", "category": "DevOps & Cloud"}, {"name": "Nginx", "category": "DevOps & Cloud"}, {"name": "PM2", "category": "DevOps & Cloud"}, {"name": "Google Cloud Console", "category": "Google Cloud"}, {"name": "Firebase", "category": "Google Cloud"}, {"name": "Google Cloud Pub/Sub", "category": "Google Cloud"}, {"name": "Google Play Console", "category": "Google Cloud"}, {"name": "Server Monitoring", "category": "Infrastructure"}, {"name": "Scaling", "category": "Infrastructure"}, {"name": "Backup Automation", "category": "Infrastructure"}, {"name": "CI/CD (GitHub Actions, Jenkins)", "category": "Infrastructure"}, {"name": "JavaScript", "category": "Languages"}, {"name": "TypeScript", "category": "Languages"}, {"name": "Python", "category": "Languages"}, {"name": "Java", "category": "Languages"}, {"name": "Claude Code", "category": "AI & Dev Tools"}, {"name": "CodeRabbit", "category": "AI & Dev Tools"}, {"name": "Lovable", "category": "AI & Dev Tools"}, {"name": "Bolt", "category": "AI & Dev Tools"}, {"name": "Antigravity", "category": "AI & Dev Tools"}, {"name": "Cursor", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "Other"}, {"name": "Selenium Automation", "category": "Other"}, {"name": "GIS Systems", "category": "Other"}, {"name": "Chrome Extensions", "category": "Other"}, {"name": "Git", "category": "Other"}, {"name": "GitHub", "category": "Other"}], "contact": {"email": "developerabhi17@gmail.com", "phone": "+91-6268644194", "fullName": "Abhi Singh", "githubUrl": "github.com/initAbhi", "linkedinUrl": "linkedin.com/in/developer-abhi-j1714"}, "summary": "Full Stack Developer with 2+ years of experience building and scaling production-grade web applications and backend systems. Experienced in Next.js, React, NestJS, Node.js, PostgreSQL, MongoDB, Redis, and AWS, with hands-on expertise in system architecture, API development, distributed job processing, cloud infrastructure, and DevOps. Currently working on a global platform serving 500,000+ users, with a strong focus on performance optimization, high availability, scalability, and reliable production deployments. Experienced in independently taking products from development through deployment, monitoring, and scaling.", "headline": "FULL STACK DEVELOPER", "projects": [{"name": "Infodatabox – Cloud Storage Platform (Google Drive Clone)", "highlights": ["Handled the entire system development independently including frontend, backend architecture, deployment, and DevOps infrastructure.", "Built scalable backend services using NestJS and integrated AWS S3 for distributed object storage with efficient upload, download, and access control mechanisms.", "Deployed and managed production infrastructure on AWS EC2, implementing monitoring, server optimization, and scalable architecture capable of supporting millions of users."], "description": "Architected and developed a scalable cloud file storage platform similar to Google Drive for Ensowebworks, supporting secure file storage, sharing, and file management workflows."}, {"name": "Oodle – Global Dating Platform", "highlights": ["Designed scalable backend APIs using NestJS with modular architecture focused on performance and reliability.", "Implemented distributed job processing using Redis and Bull queues for notifications, matching logic, and asynchronous workflows.", "Managed infrastructure including AWS EC2, S3, and Cloudflare with server monitoring, automated backups, and deployment pipelines.", "Configured PM2 clustering and scaling strategies to maintain reliability and performance under high concurrency."], "description": "Backend engineer for a large-scale dating platform available on Google Play Store and Apple App Store supporting global users and high traffic workloads."}, {"name": "Trading Bot – Automated Crypto Trading Platform", "highlights": ["Automated trading strategies based on technical indicators, enabling real-time rule-based decision making with secure API key management."], "description": "Designed React + TypeScript dashboard for strategy setup and performance tracking, integrated with Delta Exchange APIs for order execution."}], "education": [{"field": "Computer Science", "degree": "Bachelor in Computer Application", "school": "Tilak Maharashtra Vidyapeeth", "graduationDate": "2026"}], "experience": [{"title": "Full Stack Developer", "bullets": ["Oodle – Global Dating Platform (Play Store & App Store): Architected and scaled backend infrastructure using NestJS and AWS, successfully supporting a growing user base of over 500,000 (5 Lakh) total users globally.", "High-Availability & Optimization: Optimized database queries and streamlined server code to maximize throughput on limited resources; maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes during high-scale ad campaigns.", "Automated Identity & Verification: Integrated AWS Rekognition to automate user identity verification and instantly detect artificial imagery/fake profiles, drastically improving platform integrity.", "Marketing Integrations: Configured and managed Apple Search Ads (ASA) APIs to track attribution and optimize the platform’s global marketing reach.", "Asynchronous Architecture: Implemented highly resilient task processing using Redis and Bull queues to handle complex user matching algorithms, distributed background jobs, and real-time notifications."], "company": "Algo Ocean", "current": true, "endDate": "Present", "startDate": "June 2024"}], "certifications": []}	\N	2026-10-19 15:13:33.789367+05:30
0dd5431d-4b09-4869-a1b1-f77c198508e6	21a7c198-3fa6-488a-aad9-6c35d31a58c8	1	Initial version created	{"skills": [{"name": "Next.js", "category": "Frontend"}, {"name": "React", "category": "Frontend"}, {"name": "Tailwind CSS", "category": "Frontend"}, {"name": "ShadCN", "category": "Frontend"}, {"name": "Redux", "category": "Frontend"}, {"name": "TypeScript", "category": "Frontend"}, {"name": "JavaScript", "category": "Frontend"}, {"name": "Node.js", "category": "Backend"}, {"name": "NestJS", "category": "Backend"}, {"name": "Express", "category": "Backend"}, {"name": "REST APIs", "category": "Backend"}, {"name": "Microservices", "category": "Backend"}, {"name": "Redis", "category": "Backend"}, {"name": "Bull Queues", "category": "Backend"}, {"name": "WebSockets", "category": "Backend"}, {"name": "WebRTC", "category": "Backend"}, {"name": "Auth.js", "category": "Backend"}, {"name": "JWT", "category": "Backend"}, {"name": "MongoDB", "category": "Databases"}, {"name": "PostgreSQL", "category": "Databases"}, {"name": "Prisma", "category": "ORMs"}, {"name": "Mongoose", "category": "ORMs"}, {"name": "Convex", "category": "ORMs"}, {"name": "AWS (EC2, S3, Lambda)", "category": "DevOps & Cloud"}, {"name": "Docker", "category": "DevOps & Cloud"}, {"name": "Kubernetes", "category": "DevOps & Cloud"}, {"name": "Cloudflare", "category": "DevOps & Cloud"}, {"name": "Nginx", "category": "DevOps & Cloud"}, {"name": "PM2", "category": "DevOps & Cloud"}, {"name": "Google Cloud Console", "category": "Google Cloud"}, {"name": "Firebase", "category": "Google Cloud"}, {"name": "Google Cloud Pub/Sub", "category": "Google Cloud"}, {"name": "Google Play Console", "category": "Google Cloud"}, {"name": "Server Monitoring", "category": "Infrastructure"}, {"name": "Scaling", "category": "Infrastructure"}, {"name": "Backup Automation", "category": "Infrastructure"}, {"name": "CI/CD (GitHub Actions, Jenkins)", "category": "Infrastructure"}, {"name": "JavaScript", "category": "Languages"}, {"name": "TypeScript", "category": "Languages"}, {"name": "Python", "category": "Languages"}, {"name": "Java", "category": "Languages"}, {"name": "Claude Code", "category": "AI & Dev Tools"}, {"name": "CodeRabbit", "category": "AI & Dev Tools"}, {"name": "Lovable", "category": "AI & Dev Tools"}, {"name": "Bolt", "category": "AI & Dev Tools"}, {"name": "Antigravity", "category": "AI & Dev Tools"}, {"name": "Cursor", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "Other"}, {"name": "Selenium Automation", "category": "Other"}, {"name": "GIS Systems", "category": "Other"}, {"name": "Chrome Extensions", "category": "Other"}, {"name": "Git", "category": "Other"}, {"name": "GitHub", "category": "Other"}], "contact": {"email": "developerabhi17@gmail.com", "phone": "+91-6268644194", "fullName": "Abhi Singh", "githubUrl": "github.com/initAbhi", "linkedinUrl": "linkedin.com/in/developer-abhi-j1714"}, "summary": "Full Stack Developer with 2+ years of experience building and scaling production-grade web applications and backend systems. Experienced in Next.js, React, NestJS, Node.js, PostgreSQL, MongoDB, Redis, and AWS, with hands-on expertise in system architecture, API development, distributed job processing, cloud infrastructure, and DevOps. Currently working on a global platform serving 500,000+ users, with a strong focus on performance optimization, high availability, scalability, and reliable production deployments. Experienced in independently taking products from development through deployment, monitoring, and scaling.", "headline": "Full Stack Developer", "projects": [{"name": "Infodatabox – Cloud Storage Platform (Google Drive Clone)", "highlights": ["Handled the entire system development independently including frontend, backend architecture, deployment, and DevOps infrastructure.", "Built scalable backend services using NestJS and integrated AWS S3 for distributed object storage with efficient upload, download, and access control mechanisms.", "Deployed and managed production infrastructure on AWS EC2, implementing monitoring, server optimization, and scalable architecture capable of supporting millions of users."], "description": "Architected and developed a scalable cloud file storage platform similar to Google Drive for Ensowebworks, supporting secure file storage, sharing, and file management workflows."}, {"name": "Oodle – Global Dating Platform", "highlights": ["Designed scalable backend APIs using NestJS with modular architecture focused on performance and reliability.", "Implemented distributed job processing using Redis and Bull queues for notifications, matching logic, and asynchronous workflows.", "Managed infrastructure including AWS EC2, S3, and Cloudflare with server monitoring, automated backups, and deployment pipelines.", "Configured PM2 clustering and scaling strategies to maintain reliability and performance under high concurrency."], "description": "Backend engineer for a large-scale dating platform available on Google Play Store and Apple App Store supporting global users and high traffic workloads."}, {"name": "Trading Bot – Automated Crypto Trading Platform", "highlights": ["Automated trading strategies based on technical indicators, enabling real-time rule-based decision making with secure API key management."], "description": "Designed React + TypeScript dashboard for strategy setup and performance tracking, integrated with Delta Exchange APIs for order execution."}], "education": [{"field": "Computer Science", "degree": "Bachelor in Computer Application", "school": "Tilak Maharashtra Vidyapeeth", "graduationDate": "2026"}], "experience": [{"title": "Full Stack Developer", "bullets": ["Oodle – Global Dating Platform (Play Store & App Store): Architected and scaled backend infrastructure using NestJS and AWS, successfully supporting a growing user base of over 500,000 (5 Lakh) total users globally.", "High-Availability & Optimization: Optimized database queries and streamlined server code to maximize throughput on limited resources; maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes during high-scale ad campaigns.", "Automated Identity & Verification: Integrated AWS Rekognition to automate user identity verification and instantly detect artificial imagery/fake profiles, drastically improving platform integrity.", "Marketing Integrations: Configured and managed Apple Search Ads (ASA) APIs to track attribution and optimize the platform’s global marketing reach.", "Asynchronous Architecture: Implemented highly resilient task processing using Redis and Bull queues to handle complex user matching algorithms, distributed background jobs, and real-time notifications."], "company": "Algo Ocean", "current": true, "endDate": "Present", "startDate": "June 2024"}], "certifications": []}	\N	2026-10-19 15:14:52.207462+05:30
\.


--
-- Data for Name: resumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resumes (id, user_id, name, template_key, locale, is_master, is_archived, version, content, created_at, updated_at) FROM stdin;
cfcb9da8-ca5b-4f60-a107-f3f8530538c5	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Full Stack Engineer (Master)	clean-modern	en-US	t	f	1	{"skills": [{"name": "TypeScript", "category": "Language"}, {"name": "React", "category": "Frontend"}, {"name": "Next.js", "category": "Frontend"}, {"name": "NestJS", "category": "Backend"}, {"name": "PostgreSQL", "category": "Database"}, {"name": "Docker", "category": "DevOps"}, {"name": "AWS", "category": "Cloud"}], "contact": {"email": "demo@hyperresume.ai", "phone": "+91 98765 43210", "fullName": "Demo Candidate", "location": "Bengaluru, India", "githubUrl": "https://github.com/democandidate", "linkedinUrl": "https://linkedin.com/in/democandidate"}, "summary": "Full-stack software engineer with 6+ years of experience architecting distributed cloud systems, real-time reactive applications, and high-throughput microservices using TypeScript, React, Next.js, Node.js, and PostgreSQL.", "headline": "Senior Full Stack Engineer", "projects": [{"name": "HyperResume Platform", "description": "Privacy-centric ATS resume optimization engine with grounded evidence validation."}], "education": [{"field": "Computer Science and Engineering", "degree": "Bachelor of Technology", "school": "National Institute of Technology", "graduationDate": "2020-05"}], "experience": [{"title": "Senior Full Stack Engineer", "bullets": ["Architected high-throughput microservices handling 25,000+ RPS with 99.98% uptime using Node.js, NestJS, and PostgreSQL.", "Engineered real-time reactive dashboard using Next.js 15 and Tailwind CSS, reducing average page latency by 42%.", "Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time from 4 days to 45 minutes."], "company": "Acme Cloud Systems", "current": true, "location": "Bengaluru, India", "startDate": "2023-01"}, {"title": "Full Stack Software Engineer", "bullets": ["Spearheaded design and development of core fintech payment settlement workflows processing ₹50M+ in daily transaction volume.", "Optimized complex SQL queries and created composite indexes, reducing p99 database query response times by 65%.", "Collaborated with product designers to implement responsive, accessible WCAG 2.1 AA compliant customer portals."], "company": "Nexus Tech Labs", "current": false, "endDate": "2022-12", "location": "Hyderabad, India", "startDate": "2020-06"}]}	2026-10-19 13:36:54.818683+05:30	2026-10-19 13:36:54.818683+05:30
ebb2c2ca-0119-4682-a704-dc55d7462677	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Abhi_resume	clean-modern	en-US	f	f	1	{"skills": [{"name": "Go", "category": "Technical Skills"}], "contact": {"email": "", "fullName": "Candidate", "location": "Remote"}, "summary": "Experienced engineer with demonstrated background in distributed software systems.", "headline": "x cbd g b 8 XR@ j @B L LK@ A @B H j 3@BV H0 0 QP d ( x c b 6 g b D PY s5g ; 8S j iF q E x ZYs 8 P V R5 YYv ; Lv D 4@P R f 1Z 1p 9 Y 7G u vF k t i z a ", "projects": [], "education": [{"field": "Computer Science", "degree": "Bachelor of Science", "school": "University of Technology", "graduationDate": "2021"}], "experience": [], "certifications": []}	2026-10-19 14:20:56.484864+05:30	2026-10-19 14:20:56.484864+05:30
ee52e9cc-370c-4076-8818-7444e90659f9	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Abhi_resume	classic-ats	en-US	f	f	4	{"skills": [{"name": "Next.js", "category": "Frontend"}, {"name": "React", "category": "Frontend"}, {"name": "Tailwind CSS", "category": "Frontend"}, {"name": "ShadCN", "category": "Frontend"}, {"name": "Redux", "category": "Frontend"}, {"name": "TypeScript", "category": "Frontend"}, {"name": "JavaScript", "category": "Frontend"}, {"name": "Node.js", "category": "Backend"}, {"name": "NestJS", "category": "Backend"}, {"name": "Express", "category": "Backend"}, {"name": "REST APIs", "category": "Backend"}, {"name": "Microservices", "category": "Backend"}, {"name": "Redis", "category": "Backend"}, {"name": "Bull Queues", "category": "Backend"}, {"name": "WebSockets", "category": "Backend"}, {"name": "WebRTC", "category": "Backend"}, {"name": "Auth.js", "category": "Backend"}, {"name": "JWT", "category": "Backend"}, {"name": "MongoDB", "category": "Databases"}, {"name": "PostgreSQL", "category": "Databases"}, {"name": "Prisma", "category": "ORMs"}, {"name": "Mongoose", "category": "ORMs"}, {"name": "Convex", "category": "ORMs"}, {"name": "AWS (EC2, S3, Lambda)", "category": "DevOps & Cloud"}, {"name": "Docker", "category": "DevOps & Cloud"}, {"name": "Kubernetes", "category": "DevOps & Cloud"}, {"name": "Cloudflare", "category": "DevOps & Cloud"}, {"name": "Nginx", "category": "DevOps & Cloud"}, {"name": "PM2", "category": "DevOps & Cloud"}, {"name": "Google Cloud Console", "category": "Google Cloud"}, {"name": "Firebase", "category": "Google Cloud"}, {"name": "Google Cloud Pub/Sub", "category": "Google Cloud"}, {"name": "Google Play Console", "category": "Google Cloud"}, {"name": "Server Monitoring", "category": "Infrastructure"}, {"name": "Scaling", "category": "Infrastructure"}, {"name": "Backup Automation", "category": "Infrastructure"}, {"name": "CI/CD (GitHub Actions, Jenkins)", "category": "Infrastructure"}, {"name": "JavaScript", "category": "Languages"}, {"name": "TypeScript", "category": "Languages"}, {"name": "Python", "category": "Languages"}, {"name": "Java", "category": "Languages"}, {"name": "Claude Code", "category": "AI & Dev Tools"}, {"name": "CodeRabbit", "category": "AI & Dev Tools"}, {"name": "Lovable", "category": "AI & Dev Tools"}, {"name": "Bolt", "category": "AI & Dev Tools"}, {"name": "Antigravity", "category": "AI & Dev Tools"}, {"name": "Cursor", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "Other"}, {"name": "Selenium Automation", "category": "Other"}, {"name": "GIS Systems", "category": "Other"}, {"name": "Chrome Extensions", "category": "Other"}, {"name": "Git", "category": "Other"}, {"name": "GitHub", "category": "Other"}], "contact": {"email": "developerabhi17@gmail.com", "phone": "+91-6268644194", "fullName": "Abhi Singh", "githubUrl": "github.com/initAbhi", "linkedinUrl": "linkedin.com/in/developer-abhi-j1714"}, "summary": "Full Stack Developer with 2+ years of experience building and scaling production-grade web applications and backend systems. Experienced in Next.js, React, NestJS, Node.js, PostgreSQL, MongoDB, Redis, and AWS, with hands-on expertise in system architecture, API development, distributed job processing, cloud infrastructure, and DevOps. Currently working on a global platform serving 500,000+ users, with a strong focus on performance optimization, high availability, scalability, and reliable production deployments. Experienced in independently taking products from development through deployment, monitoring, and scaling.", "headline": "FULL STACK DEVELOPER", "projects": [{"name": "Infodatabox – Cloud Storage Platform (Google Drive Clone)", "highlights": ["Handled the entire system development independently including frontend, backend architecture, deployment, and DevOps infrastructure.", "Built scalable backend services using NestJS and integrated AWS S3 for distributed object storage with efficient upload, download, and access control mechanisms.", "Deployed and managed production infrastructure on AWS EC2, implementing monitoring, server optimization, and scalable architecture capable of supporting millions of users."], "description": "Architected and developed a scalable cloud file storage platform similar to Google Drive for Ensowebworks, supporting secure file storage, sharing, and file management workflows."}, {"name": "Oodle – Global Dating Platform", "highlights": ["Designed scalable backend APIs using NestJS with modular architecture focused on performance and reliability.", "Implemented distributed job processing using Redis and Bull queues for notifications, matching logic, and asynchronous workflows.", "Managed infrastructure including AWS EC2, S3, and Cloudflare with server monitoring, automated backups, and deployment pipelines.", "Configured PM2 clustering and scaling strategies to maintain reliability and performance under high concurrency."], "description": "Backend engineer for a large-scale dating platform available on Google Play Store and Apple App Store supporting global users and high traffic workloads."}, {"name": "Trading Bot – Automated Crypto Trading Platform", "highlights": ["Automated trading strategies based on technical indicators, enabling real-time rule-based decision making with secure API key management."], "description": "Designed React + TypeScript dashboard for strategy setup and performance tracking, integrated with Delta Exchange APIs for order execution."}], "education": [{"field": "Computer Science", "degree": "Bachelor in Computer Application", "school": "Tilak Maharashtra Vidyapeeth", "graduationDate": "2026"}], "experience": [{"title": "Full Stack Developer", "bullets": ["Oodle – Global Dating Platform (Play Store & App Store): Architected and scaled backend infrastructure using NestJS and AWS, successfully supporting a growing user base of over 500,000 (5 Lakh) total users globally.", "High-Availability & Optimization: Optimized database queries and streamlined server code to maximize throughput on limited resources; maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes during high-scale ad campaigns.", "Automated Identity & Verification: Integrated AWS Rekognition to automate user identity verification and instantly detect artificial imagery/fake profiles, drastically improving platform integrity.", "Marketing Integrations: Configured and managed Apple Search Ads (ASA) APIs to track attribution and optimize the platform’s global marketing reach.", "Asynchronous Architecture: Implemented highly resilient task processing using Redis and Bull queues to handle complex user matching algorithms, distributed background jobs, and real-time notifications."], "company": "Algo Ocean", "current": true, "endDate": "Present", "startDate": "June 2024"}], "certifications": []}	2026-10-19 15:13:33.780269+05:30	2026-10-19 15:13:59.500554+05:30
21a7c198-3fa6-488a-aad9-6c35d31a58c8	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	Abhi_resume	clean-modern	en-US	f	f	14	{"skills": [{"name": "Next.js", "category": "Frontend"}, {"name": "React", "category": "Frontend"}, {"name": "Tailwind CSS", "category": "Frontend"}, {"name": "ShadCN", "category": "Frontend"}, {"name": "Redux", "category": "Frontend"}, {"name": "TypeScript", "category": "Frontend"}, {"name": "JavaScript", "category": "Frontend"}, {"name": "Node.js", "category": "Backend"}, {"name": "NestJS", "category": "Backend"}, {"name": "Express", "category": "Backend"}, {"name": "REST APIs", "category": "Backend"}, {"name": "Microservices", "category": "Backend"}, {"name": "Redis", "category": "Backend"}, {"name": "Bull Queues", "category": "Backend"}, {"name": "WebSockets", "category": "Backend"}, {"name": "WebRTC", "category": "Backend"}, {"name": "Auth.js", "category": "Backend"}, {"name": "JWT", "category": "Backend"}, {"name": "MongoDB", "category": "Databases"}, {"name": "PostgreSQL", "category": "Databases"}, {"name": "Prisma", "category": "ORMs"}, {"name": "Mongoose", "category": "ORMs"}, {"name": "Convex", "category": "ORMs"}, {"name": "AWS (EC2, S3, Lambda)", "category": "DevOps & Cloud"}, {"name": "Docker", "category": "DevOps & Cloud"}, {"name": "Kubernetes", "category": "DevOps & Cloud"}, {"name": "Cloudflare", "category": "DevOps & Cloud"}, {"name": "Nginx", "category": "DevOps & Cloud"}, {"name": "PM2", "category": "DevOps & Cloud"}, {"name": "Google Cloud Console", "category": "Google Cloud"}, {"name": "Firebase", "category": "Google Cloud"}, {"name": "Google Cloud Pub/Sub", "category": "Google Cloud"}, {"name": "Google Play Console", "category": "Google Cloud"}, {"name": "Server Monitoring", "category": "Infrastructure"}, {"name": "Scaling", "category": "Infrastructure"}, {"name": "Backup Automation", "category": "Infrastructure"}, {"name": "CI/CD (GitHub Actions, Jenkins)", "category": "Infrastructure"}, {"name": "JavaScript", "category": "Languages"}, {"name": "TypeScript", "category": "Languages"}, {"name": "Python", "category": "Languages"}, {"name": "Java", "category": "Languages"}, {"name": "Claude Code", "category": "AI & Dev Tools"}, {"name": "CodeRabbit", "category": "AI & Dev Tools"}, {"name": "Lovable", "category": "AI & Dev Tools"}, {"name": "Bolt", "category": "AI & Dev Tools"}, {"name": "Antigravity", "category": "AI & Dev Tools"}, {"name": "Cursor", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "AI & Dev Tools"}, {"name": "AI/LLM Integration", "category": "Other"}, {"name": "Selenium Automation", "category": "Other"}, {"name": "GIS Systems", "category": "Other"}, {"name": "Chrome Extensions", "category": "Other"}, {"name": "Git", "category": "Other"}, {"name": "GitHub", "category": "Other"}], "contact": {"email": "developerabhi17@gmail.com", "phone": "+91-6268644194", "fullName": "Abhi Singh", "githubUrl": "github.com/initAbhi", "linkedinUrl": "linkedin.com/in/developer-abhi-j1714"}, "summary": "Full Stack Developer with 2+ years of experience building and scaling production-grade web applications and backend systems. Experienced in Next.js, React, NestJS, Node.js, PostgreSQL, MongoDB, Redis, and AWS, with hands-on expertise in system architecture, API development, distributed job processing, cloud infrastructure, and DevOps. Currently working on a global platform serving 500,000+ users, with a strong focus on performance optimization, high availability, scalability, and reliable production deployments. Experienced in independently taking products from development through deployment, monitoring, and scaling.", "headline": "Full Stack Developer", "projects": [{"name": "Infodatabox – Cloud Storage Platform (Google Drive Clone)", "highlights": ["Handled the entire system development independently including frontend, backend architecture, deployment, and DevOps infrastructure.", "Built scalable backend services using NestJS and integrated AWS S3 for distributed object storage with efficient upload, download, and access control mechanisms.", "Deployed and managed production infrastructure on AWS EC2, implementing monitoring, server optimization, and scalable architecture capable of supporting millions of users."], "description": "Architected and developed a scalable cloud file storage platform similar to Google Drive for Ensowebworks, supporting secure file storage, sharing, and file management workflows."}, {"name": "Oodle – Global Dating Platform", "highlights": ["Designed scalable backend APIs using NestJS with modular architecture focused on performance and reliability.", "Implemented distributed job processing using Redis and Bull queues for notifications, matching logic, and asynchronous workflows.", "Managed infrastructure including AWS EC2, S3, and Cloudflare with server monitoring, automated backups, and deployment pipelines.", "Configured PM2 clustering and scaling strategies to maintain reliability and performance under high concurrency."], "description": "Backend engineer for a large-scale dating platform available on Google Play Store and Apple App Store supporting global users and high traffic workloads."}, {"name": "Trading Bot – Automated Crypto Trading Platform", "highlights": ["Automated trading strategies based on technical indicators, enabling real-time rule-based decision making with secure API key management."], "description": "Designed React + TypeScript dashboard for strategy setup and performance tracking, integrated with Delta Exchange APIs for order execution."}], "education": [{"field": "Computer Science", "degree": "Bachelor in Computer Application", "school": "Tilak Maharashtra Vidyapeeth", "graduationDate": "2026"}], "experience": [{"title": "Full Stack Developer", "bullets": ["Oodle – Global Dating Platform (Play Store & App Store): Architected and scaled backend infrastructure using NestJS and AWS, successfully supporting a growing user base of over 500,000 (5 Lakh) total users globally.", "High-Availability & Optimization: Optimized database queries and streamlined server code to maximize throughput on limited resources; maintained near-zero downtime by dynamically scaling multiple instances to manage massive traffic spikes during high-scale ad campaigns.", "Automated Identity & Verification: Integrated AWS Rekognition to automate user identity verification and instantly detect artificial imagery/fake profiles, drastically improving platform integrity.", "Marketing Integrations: Configured and managed Apple Search Ads (ASA) APIs to track attribution and optimize the platform’s global marketing reach.", "Asynchronous Architecture: Implemented highly resilient task processing using Redis and Bull queues to handle complex user matching algorithms, distributed background jobs, and real-time notifications."], "company": "Algo Ocean", "current": true, "endDate": "Present", "startDate": "June 2024"}], "certifications": []}	2026-10-19 15:14:52.199836+05:30	2026-10-19 15:58:38.200943+05:30
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.templates (id, template_key, name, description, is_free, layout_options, is_active, created_at) FROM stdin;
43de9c03-73e0-4168-a625-3a2d50fb8685	clean-modern	Clean Modern	Standard single-column layout engineered for high ATS parsing accuracy and tech roles.	t	{"font": "Inter", "columns": 1, "headerStyle": "centered"}	t	2026-10-19 14:01:28.366331+05:30
b50cff21-414b-45c4-933d-d8d236dcdd1e	technical-ats	Technical ATS	Minimalist hierarchy optimized for engineering, DevOps, and backend roles.	t	{"font": "Roboto", "columns": 1, "headerStyle": "left-aligned"}	t	2026-10-19 14:01:28.366331+05:30
aa6b3f6e-9514-4676-b50d-fd3196831670	executive	Executive & Staff	Balanced typographic hierarchy for senior IC and engineering management roles.	t	{"font": "Merriweather", "columns": 1, "headerStyle": "split"}	t	2026-10-19 14:01:28.366331+05:30
39974de4-bd5b-4139-a645-6127024c7a04	minimalist-pro	Minimalist Pro	Ultra-compact single page template with subtle accent borders for competitive SaaS applications.	f	{"font": "Geist", "columns": 1, "headerStyle": "clean"}	t	2026-10-19 14:01:28.366331+05:30
\.


--
-- Data for Name: typeorm_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.typeorm_migrations (id, "timestamp", name) FROM stdin;
1	1728864000000	CreateUsersTable1728864000000
2	1728864000001	CreateCoreEntities1728864000001
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, token_hash, expires_at, is_revoked, user_agent, ip_address, created_at) FROM stdin;
82d375d4-6f6e-454c-8ce0-065c76c77da4	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	0e59b2c8cc215f3d1526c93720270fe4bebb7048c83e0facc62971134e8e476f	2026-10-26 14:11:34.48+05:30	f	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.22621.6133	::1	2026-10-19 14:11:34.484805+05:30
67c1b4da-75bf-46c3-81d4-69ddc745afdf	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	e3a4905eaff34e7d4e3efd08db1d05e31be241c3edfa587b6f4064e56c66f330	2026-10-26 14:13:00.121+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 14:13:00.123256+05:30
929a3ebd-fd8e-4f67-a7b9-aaef986e1540	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	9396d4ac1856c87a38cbfda11be29eb6178e00789b6bfa80b06c07674f7dd919	2026-10-26 14:14:34.409+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 14:14:34.411103+05:30
8c754dc1-ce18-4644-8300-d4f6bbe58d24	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	ed597075b79f2b9104092eff6e90da09b808a49da180e50bebe9fcde79866a04	2026-10-26 14:21:21.639+05:30	f	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.22621.6133	::1	2026-10-19 14:21:21.640779+05:30
9c01fdb5-a813-4752-8d44-f57d65c9e2ab	36122670-7345-44a4-ae9c-fdda2ce99bb6	91f7cf802f62147249af59ee9d23a76a13707720dde532aef8454a3c8bb142a6	2026-10-26 14:21:26.107+05:30	f	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.22621.6133	::1	2026-10-19 14:21:26.10845+05:30
2e4d5951-938a-41ba-8e78-d138bcc2ef2f	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	a2c06582db7009681b7a622f232da6434f058d703aa314dc34996c42ad8cc89f	2026-10-26 14:35:40.273+05:30	f	node	::1	2026-10-19 14:35:40.279447+05:30
028c0458-a388-4ac2-b04d-288a04948845	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	10cc08b3cf14d471ede960e39e40a2313d4e88ecfc437e8d31a346e0d44e799d	2026-10-26 15:12:35.942+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 15:12:35.943317+05:30
f739ebd0-d9c6-4a22-b8ec-138d062768bf	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	14d47ca026c841be2e8dff76cd9ca545d5d42b0f3a7e808ddff593bd2df8e1de	2026-10-26 15:23:46.519+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 15:23:46.520122+05:30
ec45f8af-4f62-4c8f-9728-b303701700b6	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	45ffbdf3706406ce67c5391f77b6d7071f2415ff9300de8551aaf0a577867344	2026-10-26 20:20:50.285+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 20:20:50.290019+05:30
db7663aa-6d3f-4ef0-8ac4-ee5f1fa87e81	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	dd3cbcec732a8ebb8e09a9e3a624207944acf1cd96a9c999a6ed092703aa5695	2026-10-26 21:21:51.547+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 21:21:51.548993+05:30
8fc72644-6df5-4ccd-870d-033c4224ff12	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	c92f91ba3484dcf74a49bb9a295044021e0bb162e4370ac3029aa05d168587ab	2026-10-26 23:41:34.776+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 23:41:34.788705+05:30
c0abf94d-dc13-4825-826e-a704d591af68	dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	c8c9d23eeb92d4d532368b9a849bc67a9c312c9ba5368a2dddb0293b1aa4b4fa	2026-10-26 23:50:20.379+05:30	f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	2026-10-19 23:50:20.380802+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, role, is_active, created_at, updated_at, is_email_verified) FROM stdin;
dd0f5cd5-4a02-469b-8821-14dbd51ba5d1	demo@hyperresume.ai	$2b$10$rrPk3KpmNCsnkq7rQQf1qusNCcIE1hLawzhKhnXbA49RU/1IRkTbC	Demo Candidate	user	t	2026-10-19 13:36:54.77618+05:30	2026-10-19 14:22:17.674434+05:30	t
36122670-7345-44a4-ae9c-fdda2ce99bb6	admin@hyperresume.ai	$2b$10$TKHqNqnGAzh8HcM8uOBTF.NY5txpMbkRcV8.4uRx.XwVeWkn.S0yu	System Administrator	admin	t	2026-10-19 13:36:54.850778+05:30	2026-10-19 14:22:17.702317+05:30	t
\.


--
-- Name: typeorm_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.typeorm_migrations_id_seq', 2, true);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: typeorm_migrations PK_bb2f075707dd300ba86d0208923; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.typeorm_migrations
    ADD CONSTRAINT "PK_bb2f075707dd300ba86d0208923" PRIMARY KEY (id);


--
-- Name: candidate_profiles candidate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id);


--
-- Name: candidate_profiles candidate_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_key UNIQUE (user_id);


--
-- Name: credit_ledger credit_ledger_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_ledger
    ADD CONSTRAINT credit_ledger_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: credit_ledger credit_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_ledger
    ADD CONSTRAINT credit_ledger_pkey PRIMARY KEY (id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: job_descriptions job_descriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_descriptions
    ADD CONSTRAINT job_descriptions_pkey PRIMARY KEY (id);


--
-- Name: job_matches job_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_pkey PRIMARY KEY (id);


--
-- Name: payments payments_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_provider_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_provider_transaction_id_key UNIQUE (provider_transaction_id);


--
-- Name: resume_analyses resume_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resume_analyses
    ADD CONSTRAINT resume_analyses_pkey PRIMARY KEY (id);


--
-- Name: resume_versions resume_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resume_versions
    ADD CONSTRAINT resume_versions_pkey PRIMARY KEY (id);


--
-- Name: resumes resumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: templates templates_template_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_template_key_key UNIQUE (template_key);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: idx_candidate_profiles_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_profiles_user_id ON public.candidate_profiles USING btree (user_id);


--
-- Name: idx_credit_ledger_idempotency_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_ledger_idempotency_key ON public.credit_ledger USING btree (idempotency_key);


--
-- Name: idx_credit_ledger_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credit_ledger_user_id ON public.credit_ledger USING btree (user_id);


--
-- Name: idx_job_applications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_user_id ON public.job_applications USING btree (user_id);


--
-- Name: idx_job_descriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_descriptions_user_id ON public.job_descriptions USING btree (user_id);


--
-- Name: idx_job_matches_job_description_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_matches_job_description_id ON public.job_matches USING btree (job_description_id);


--
-- Name: idx_job_matches_resume_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_matches_resume_id ON public.job_matches USING btree (resume_id);


--
-- Name: idx_job_matches_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_matches_user_id ON public.job_matches USING btree (user_id);


--
-- Name: idx_payments_idempotency_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_idempotency_key ON public.payments USING btree (idempotency_key);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_payments_provider_tx_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_provider_tx_id ON public.payments USING btree (provider_transaction_id);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_resume_analyses_resume_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resume_analyses_resume_id ON public.resume_analyses USING btree (resume_id);


--
-- Name: idx_resume_analyses_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resume_analyses_user_id ON public.resume_analyses USING btree (user_id);


--
-- Name: idx_resume_versions_resume_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resume_versions_resume_id ON public.resume_versions USING btree (resume_id);


--
-- Name: idx_resumes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resumes_user_id ON public.resumes USING btree (user_id);


--
-- Name: idx_templates_template_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_templates_template_key ON public.templates USING btree (template_key);


--
-- Name: idx_user_sessions_token_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_token_hash ON public.user_sessions USING btree (token_hash);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: candidate_profiles candidate_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: credit_ledger credit_ledger_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_ledger
    ADD CONSTRAINT credit_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_resume_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_resume_version_id_fkey FOREIGN KEY (resume_version_id) REFERENCES public.resume_versions(id) ON DELETE SET NULL;


--
-- Name: job_applications job_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_descriptions job_descriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_descriptions
    ADD CONSTRAINT job_descriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_matches job_matches_job_description_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_job_description_id_fkey FOREIGN KEY (job_description_id) REFERENCES public.job_descriptions(id) ON DELETE CASCADE;


--
-- Name: job_matches job_matches_resume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;


--
-- Name: job_matches job_matches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: resume_analyses resume_analyses_resume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resume_analyses
    ADD CONSTRAINT resume_analyses_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;


--
-- Name: resume_analyses resume_analyses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resume_analyses
    ADD CONSTRAINT resume_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: resume_versions resume_versions_resume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resume_versions
    ADD CONSTRAINT resume_versions_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;


--
-- Name: resumes resumes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict vcoqLN9rmbg9xb74G2g9vQkZgsyhkfz6zAm0LgMD3LOzga8VL6ffc5FMNY8HQCF

