-- =============================================================================
-- ESN Porto Organization Seed Data 2025/2026
-- =============================================================================

-- MEMBERS (74 total)
-- Status: new_member (35), member (31), inactive_member (8)

INSERT INTO public.members (name, status) VALUES
-- New Members (35)
('Afonso Fonseca', 'new_member'),
('Ana Braz', 'new_member'),
('Ana Clara Solarevisky', 'new_member'),
('Bianca Costa', 'new_member'),
('Camila Mendez', 'new_member'),
('Catarina Ramos', 'new_member'),
('Diana Vivas', 'new_member'),
('Diogo Lopes', 'new_member'),
('Filipa Macedo', 'new_member'),
('Francisco Coelho', 'new_member'),
('Francisco Dias', 'new_member'),
('Inês Lopes', 'new_member'),
('Isabela Schlickmann Bastos', 'new_member'),
('Ivo Silva', 'new_member'),
('José Sousa', 'new_member'),
('Kaue Magagnin Oliveira', 'new_member'),
('Leonor Costa', 'new_member'),
('Maarten Nieman', 'new_member'),
('Mafalda Santos Silva', 'new_member'),
('Margarida Dinis Martins', 'new_member'),
('Maria Miguel Silva Santos', 'new_member'),
('María Paula Almeida', 'new_member'),
('Maria Rosa Frazão', 'new_member'),
('Marlon Gomes', 'new_member'),
('Marta Mouta', 'new_member'),
('Martim Valadar', 'new_member'),
('Miguel Moita', 'new_member'),
('Pablo Vera', 'new_member'),
('Patrícia Cardoso', 'new_member'),
('Sabrina Silva', 'new_member'),
('Sofia Costa', 'new_member'),
('Tomás Freitas', 'new_member'),
('Tomás Mortágua', 'new_member'),
('Tomás Pinto', 'new_member'),
('Victoria Baiocco', 'new_member'),
-- Members (31)
('Adriano Machado', 'member'),
('Afonso Faro', 'member'),
('Afonso Vaz Osório', 'member'),
('Amanda Japiassu', 'member'),
('André Augusto', 'member'),
('Aris Stamatoulis', 'member'),
('Bárbara Ferreira', 'member'),
('Carolina Bessil', 'member'),
('Carolina Oliveira', 'member'),
('Diogo Luís', 'member'),
('Fernanda Japiassu', 'member'),
('Flora Corrêa', 'member'),
('Gabriel Bueno', 'member'),
('Giovanna Fargnoli', 'member'),
('Heloísa Santos', 'member'),
('Henrique Correia', 'member'),
('Inês Mexia', 'member'),
('Inês Russo', 'member'),
('Lívia Bernardes', 'member'),
('Margarida Delduque', 'member'),
('Maria Eduarda Ribeiro', 'member'),
('Maria João Silva', 'member'),
('Marina Anjos', 'member'),
('Marina Oliveira', 'member'),
('Maurilio Mestre', 'member'),
('Pedro Loureiro', 'member'),
('Pedro Machado', 'member'),
('Ricardo Morais', 'member'),
('Sofia Gonçalves', 'member'),
('Tamara Fedorenko', 'member'),
('Tiago Coimbra', 'member'),
-- Inactive Members (8)
('Andreia Adão', 'inactive_member'),
('Beatriz Rodrigues', 'inactive_member'),
('Luca de Castro Rosolem', 'inactive_member'),
('Mara Patrício', 'inactive_member'),
('Margarida Reis', 'inactive_member'),
('Maria João Soares', 'inactive_member'),
('Renata Santos', 'inactive_member'),
('Sofia Gonzalez', 'inactive_member')
ON CONFLICT DO NOTHING;

-- DEPARTMENTS (10 regular + 3 statutory bodies)
INSERT INTO public.departments (name, type, sort_order) VALUES
('Events', 'department', 1),
('Education', 'department', 2),
('Projects', 'department', 3),
('Communication', 'department', 4),
('Marketing', 'department', 5),
('Partnerships', 'department', 6),
('IT', 'department', 7),
('Human Resources', 'department', 8),
('Training & Teambuildings', 'department', 9),
('Buddy Programme', 'department', 10),
('Board', 'statutory_body', 1),
('Audit Team', 'statutory_body', 2),
('Chairing Team', 'statutory_body', 3)
ON CONFLICT (name) DO NOTHING;

-- WORKING GROUPS
INSERT INTO public.working_groups (department_id, name, sort_order)
SELECT d.id, wg.name, wg.sort_order
FROM public.departments d
CROSS JOIN (VALUES
  ('Events', 'Sports', 1),
  ('Events', 'Trips', 2),
  ('Events', 'Night Events', 3),
  ('Events', 'Activities', 4),
  ('Education', 'Advocacy & Projects', 1),
  ('Education', 'Educational Events', 2),
  ('Projects', 'External Projects', 1),
  ('Projects', 'Internal Projects', 2),
  ('Communication', 'Audiovisual', 1),
  ('Communication', 'Social Media', 2),
  ('Communication', 'Graphics', 3)
) AS wg(dept_name, name, sort_order)
WHERE d.name = wg.dept_name
ON CONFLICT (department_id, name) DO NOTHING;

-- =============================================================================
-- DEPARTMENT MEMBERSHIPS
-- Helper: insert membership by member name, department name, optional WG name
-- =============================================================================

-- STATUTORY BODIES

-- Board
INSERT INTO public.department_memberships (member_id, department_id, role, position)
SELECT m.id, d.id, 'manager', v.position
FROM (VALUES
  ('Maria João Silva', 'President'),
  ('Aris Stamatoulis', 'Vice-President'),
  ('Pedro Machado', 'Treasurer'),
  ('Afonso Faro', 'Events Manager'),
  ('Tiago Coimbra', 'Marketing Manager')
) AS v(member_name, position)
JOIN public.members m ON m.name = v.member_name
JOIN public.departments d ON d.name = 'Board';

-- Board Support Positions
INSERT INTO public.department_memberships (member_id, department_id, role, position)
SELECT m.id, d.id, 'member', v.position
FROM (VALUES
  ('Diogo Lopes', 'Internship Recruiter'),
  ('Filipa Macedo', 'Education Officer'),
  ('Fernanda Japiassu', 'External Relations Officer'),
  ('Maurilio Mestre', 'Network Officer'),
  ('Diogo Lopes', 'Office Team'),
  ('Pedro Loureiro', 'Office Team')
) AS v(member_name, position)
JOIN public.members m ON m.name = v.member_name
JOIN public.departments d ON d.name = 'Board';

-- Audit Team
INSERT INTO public.department_memberships (member_id, department_id, role, position)
SELECT m.id, d.id, 'member', v.position
FROM (VALUES
  ('Heloísa Santos', 'President of the AT')
) AS v(member_name, position)
JOIN public.members m ON m.name = v.member_name
JOIN public.departments d ON d.name = 'Audit Team';

-- Chairing Team
INSERT INTO public.department_memberships (member_id, department_id, role, position)
SELECT m.id, d.id, 'member', v.position
FROM (VALUES
  ('Marina Anjos', 'President of CT'),
  ('Tamara Fedorenko', '1st Secretary'),
  ('Maria João Soares', '2nd Secretary')
) AS v(member_name, position)
JOIN public.members m ON m.name = v.member_name
JOIN public.departments d ON d.name = 'Chairing Team';

-- DEPARTMENT MANAGERS
INSERT INTO public.department_memberships (member_id, department_id, role)
SELECT m.id, d.id, 'manager'
FROM (VALUES
  ('Afonso Faro', 'Events'),
  ('Filipa Macedo', 'Education'),
  ('Tomás Freitas', 'Projects'),
  ('Carolina Bessil', 'Communication'),
  ('Tiago Coimbra', 'Marketing'),
  ('Francisco Coelho', 'Partnerships'),
  ('Adriano Machado', 'IT'),
  ('Amanda Japiassu', 'Human Resources'),
  ('Inês Russo', 'Training & Teambuildings'),
  ('Ivo Silva', 'Buddy Programme')
) AS v(member_name, dept_name)
JOIN public.members m ON m.name = v.member_name
JOIN public.departments d ON d.name = v.dept_name;

-- WORKING GROUP TEAM LEADERS
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg_d.department_id, wg_d.id, 'team_leader'
FROM (VALUES
  ('Tomás Mortágua', 'Events', 'Sports'),
  ('Marina Anjos', 'Events', 'Trips'),
  ('Ricardo Morais', 'Events', 'Night Events'),
  ('Bárbara Ferreira', 'Events', 'Activities'),
  ('José Sousa', 'Communication', 'Audiovisual'),
  ('Marlon Gomes', 'Communication', 'Social Media'),
  ('Lívia Bernardes', 'Communication', 'Graphics'),
  ('Giovanna Fargnoli', 'Marketing', NULL)
) AS v(member_name, dept_name, wg_name)
JOIN public.members m ON m.name = v.member_name
LEFT JOIN (
  SELECT wg.id, wg.name, wg.department_id, d.name as dept_name
  FROM public.working_groups wg
  JOIN public.departments d ON d.id = wg.department_id
) wg_d ON wg_d.dept_name = v.dept_name AND wg_d.name = v.wg_name;

-- WORKING GROUP MEMBERS
-- Events > Sports
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Martim Valadar'), ('Tomás Freitas'), ('Henrique Correia'), ('Pablo Vera'),
  ('Tomás Pinto'), ('Mafalda Santos Silva'), ('Diana Vivas'), ('Francisco Dias')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Events' AND wg.name = 'Sports';

-- Events > Trips
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Camila Mendez'), ('Tomás Freitas'), ('Bianca Costa'), ('Kaue Magagnin Oliveira'),
  ('Tomás Pinto'), ('Afonso Fonseca')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Events' AND wg.name = 'Trips';

-- Events > Night Events
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Sofia Gonçalves'), ('Henrique Correia'), ('André Augusto'), ('Pedro Loureiro'),
  ('Maarten Nieman'), ('Isabela Schlickmann Bastos'), ('Ana Clara Solarevisky'),
  ('Carolina Bessil'), ('Diana Vivas')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Events' AND wg.name = 'Night Events';

-- Events > Activities
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Francisco Coelho'), ('Margarida Dinis Martins'), ('Sofia Costa'), ('Inês Russo'),
  ('Marta Mouta'), ('María Paula Almeida'), ('Miguel Moita')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Events' AND wg.name = 'Activities';

-- Education > Advocacy & Projects
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Lívia Bernardes'), ('Fernanda Japiassu'), ('Leonor Costa'),
  ('Maurilio Mestre'), ('Ana Clara Solarevisky'), ('Maria Rosa Frazão'), ('Sabrina Silva')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Education' AND wg.name = 'Advocacy & Projects';

-- Education > Educational Events
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Fernanda Japiassu'), ('Marta Mouta'), ('Maurilio Mestre'),
  ('Maria Rosa Frazão'), ('Catarina Ramos'), ('Francisco Dias')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Education' AND wg.name = 'Educational Events';

-- Projects > External Projects
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Kaue Magagnin Oliveira'), ('Ivo Silva'), ('Catarina Ramos'), ('Ana Braz')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Projects' AND wg.name = 'External Projects';

-- Projects > Internal Projects
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Leonor Costa'), ('Sabrina Silva'), ('Filipa Macedo'), ('Inês Lopes')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Projects' AND wg.name = 'Internal Projects';

-- Communication > Audiovisual
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Bianca Costa'), ('Inês Mexia'), ('Maria Eduarda Ribeiro'), ('Sofia Costa'), ('Ana Braz')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Communication' AND wg.name = 'Audiovisual';

-- Communication > Social Media
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('María Paula Almeida'), ('Afonso Vaz Osório')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Communication' AND wg.name = 'Social Media';

-- Communication > Graphics
INSERT INTO public.department_memberships (member_id, department_id, working_group_id, role)
SELECT m.id, wg.department_id, wg.id, 'member'
FROM public.working_groups wg
JOIN public.departments d ON d.id = wg.department_id
CROSS JOIN (VALUES
  ('Marlon Gomes'), ('José Sousa'), ('Patrícia Cardoso'), ('Maurilio Mestre'),
  ('Afonso Fonseca'), ('Ana Braz'), ('Afonso Vaz Osório')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Communication' AND wg.name = 'Graphics';

-- Marketing (flat - no working groups)
INSERT INTO public.department_memberships (member_id, department_id, role)
SELECT m.id, d.id, 'member'
FROM public.departments d
CROSS JOIN (VALUES
  ('Lívia Bernardes'), ('Maria Miguel Silva Santos'), ('Leonor Costa'),
  ('Gabriel Bueno'), ('Inês Mexia'), ('Maria Eduarda Ribeiro'), ('Sofia Costa')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Marketing';

-- Partnerships (flat)
INSERT INTO public.department_memberships (member_id, department_id, role)
SELECT m.id, d.id, 'member'
FROM public.departments d
CROSS JOIN (VALUES
  ('Martim Valadar'), ('Tomás Mortágua'), ('Miguel Moita'), ('Marina Anjos'),
  ('Pedro Loureiro'), ('Diogo Lopes'), ('Inês Russo'), ('Afonso Fonseca'), ('Diana Vivas')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Partnerships';

-- IT (flat)
INSERT INTO public.department_memberships (member_id, department_id, role)
SELECT m.id, d.id, 'member'
FROM public.departments d
CROSS JOIN (VALUES
  ('José Sousa'), ('Henrique Correia'), ('Gabriel Bueno'), ('Inês Lopes'),
  ('Sabrina Silva'), ('Victoria Baiocco'), ('Afonso Vaz Osório')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'IT';

-- Human Resources (flat)
INSERT INTO public.department_memberships (member_id, department_id, role)
SELECT m.id, d.id, 'member'
FROM public.departments d
CROSS JOIN (VALUES
  ('Marina Oliveira'), ('Heloísa Santos'), ('Bárbara Ferreira')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Human Resources';

-- Training & Teambuildings (flat)
INSERT INTO public.department_memberships (member_id, department_id, role)
SELECT m.id, d.id, 'member'
FROM public.departments d
CROSS JOIN (VALUES
  ('Sofia Gonçalves'), ('Henrique Correia'), ('Maria Miguel Silva Santos'),
  ('Giovanna Fargnoli'), ('Isabela Schlickmann Bastos'), ('Marina Oliveira'),
  ('Victoria Baiocco'), ('Margarida Dinis Martins')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Training & Teambuildings';

-- Buddy Programme (flat)
INSERT INTO public.department_memberships (member_id, department_id, role)
SELECT m.id, d.id, 'member'
FROM public.departments d
CROSS JOIN (VALUES
  ('Camila Mendez'), ('Gabriel Bueno'), ('Patrícia Cardoso'),
  ('Giovanna Fargnoli'), ('Isabela Schlickmann Bastos'), ('Marina Oliveira'),
  ('Victoria Baiocco'), ('Margarida Dinis Martins')
) AS v(member_name)
JOIN public.members m ON m.name = v.member_name
WHERE d.name = 'Buddy Programme';
