-- Create roles table for company job openings
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  location TEXT,
  department TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create talent table for candidates
CREATE TABLE public.talent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  layoff_date TEXT,
  skills TEXT[],
  linkedin_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role_matches table to link roles with recommended talent
CREATE TABLE public.role_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES public.talent(id) ON DELETE CASCADE,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'interviewed', 'rejected', 'hired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, talent_id)
);

-- Enable Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_matches ENABLE ROW LEVEL SECURITY;

-- Create policies (making data public for now - you may want to restrict this later)
CREATE POLICY "Anyone can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Anyone can manage roles" ON public.roles FOR ALL USING (true);

CREATE POLICY "Anyone can view talent" ON public.talent FOR SELECT USING (true);
CREATE POLICY "Anyone can manage talent" ON public.talent FOR ALL USING (true);

CREATE POLICY "Anyone can view role matches" ON public.role_matches FOR SELECT USING (true);
CREATE POLICY "Anyone can manage role matches" ON public.role_matches FOR ALL USING (true);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_updated_at
  BEFORE UPDATE ON public.talent
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_matches_updated_at
  BEFORE UPDATE ON public.role_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.roles (title, description, requirements, location, department, salary_range) VALUES
('Senior Software Development Engineer', 'Lead development of core platform features', ARRAY['React', 'Node.js', 'Python', 'AWS'], 'San Francisco, CA', 'Engineering', '$150k-$200k'),
('Senior Front-End Engineer', 'Build exceptional user experiences', ARRAY['Vue.js', 'TypeScript', 'GraphQL'], 'San Francisco, CA', 'Engineering', '$130k-$170k'),
('Full-Stack Developer', 'Work across the entire technology stack', ARRAY['JavaScript', 'Python', 'Docker'], 'Remote', 'Engineering', '$120k-$160k');

INSERT INTO public.talent (name, title, company, location, layoff_date, skills) VALUES
('Logan McNeil', 'Senior Software Development Engineer', 'Brex', 'San Francisco, CA', 'March 2024', ARRAY['React', 'Node.js', 'Python', 'AWS']),
('Alex Nguyen', 'Senior Front-End Engineer', 'Beta Corp', 'San Francisco, CA', 'February 2024', ARRAY['Vue.js', 'TypeScript', 'GraphQL']),
('Jordan Kim', 'Full-Stack Developer', 'Gamma Inc', 'San Francisco, CA', 'March 2024', ARRAY['JavaScript', 'Python', 'Docker']);

-- Create role matches
INSERT INTO public.role_matches (role_id, talent_id, match_score, match_reasons)
SELECT r.id, t.id, 
  CASE 
    WHEN t.name = 'Logan McNeil' THEN 92
    WHEN t.name = 'Alex Nguyen' THEN 88
    WHEN t.name = 'Jordan Kim' THEN 85
  END,
  CASE 
    WHEN t.name = 'Logan McNeil' THEN ARRAY['Perfect skill match with React, Node.js, Python, AWS', 'Senior level experience', 'Located in target market']
    WHEN t.name = 'Alex Nguyen' THEN ARRAY['Strong frontend skills with Vue.js and TypeScript', 'GraphQL experience valuable', 'Recent availability']
    WHEN t.name = 'Jordan Kim' THEN ARRAY['Full-stack capabilities', 'Docker containerization skills', 'Python backend experience']
  END
FROM public.roles r, public.talent t
WHERE (r.title = 'Senior Software Development Engineer' AND t.name = 'Logan McNeil')
   OR (r.title = 'Senior Front-End Engineer' AND t.name = 'Alex Nguyen')
   OR (r.title = 'Full-Stack Developer' AND t.name = 'Jordan Kim');