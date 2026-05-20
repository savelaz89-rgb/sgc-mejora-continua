
-- Enums
CREATE TYPE public.app_role AS ENUM ('administrador', 'responsable', 'auditor');
CREATE TYPE public.action_type AS ENUM ('correctiva', 'preventiva', 'mejora');
CREATE TYPE public.action_source AS ENUM ('auditoria', 'cliente', 'proceso', 'inspeccion', 'riesgo', 'direccion');
CREATE TYPE public.action_priority AS ENUM ('alta', 'media', 'baja');
CREATE TYPE public.action_status AS ENUM ('abierta', 'en_proceso', 'cerrada', 'vencida');
CREATE TYPE public.rca_method AS ENUM ('5_porques', 'ishikawa', '8d');
CREATE TYPE public.task_status AS ENUM ('pendiente', 'en_proceso', 'completada');
CREATE TYPE public.verification_result AS ENUM ('eficaz', 'no_eficaz');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Counter for codes
CREATE TABLE public.code_counters (
  type action_type NOT NULL,
  year INT NOT NULL,
  counter INT NOT NULL DEFAULT 0,
  PRIMARY KEY (type, year)
);

CREATE OR REPLACE FUNCTION public.next_action_code(_type action_type)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _year INT := EXTRACT(YEAR FROM now());
  _n INT;
  _prefix TEXT;
BEGIN
  INSERT INTO public.code_counters(type, year, counter) VALUES (_type, _year, 1)
    ON CONFLICT (type, year) DO UPDATE SET counter = code_counters.counter + 1
    RETURNING counter INTO _n;
  _prefix := CASE _type WHEN 'correctiva' THEN 'AC' WHEN 'preventiva' THEN 'AP' ELSE 'OM' END;
  RETURN _prefix || '-' || _year || '-' || LPAD(_n::text, 3, '0');
END;
$$;

-- Actions
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type action_type NOT NULL,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source action_source NOT NULL,
  process TEXT,
  area TEXT,
  detected_by UUID REFERENCES auth.users(id),
  detection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  priority action_priority NOT NULL DEFAULT 'media',
  status action_status NOT NULL DEFAULT 'abierta',
  expected_benefit TEXT,
  parent_action_id UUID REFERENCES public.actions(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_actions_type ON public.actions(type);
CREATE INDEX idx_actions_status ON public.actions(status);

-- Root cause analysis
CREATE TABLE public.root_cause_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL UNIQUE REFERENCES public.actions(id) ON DELETE CASCADE,
  method rca_method NOT NULL DEFAULT '5_porques',
  why1 TEXT, why2 TEXT, why3 TEXT, why4 TEXT, why5 TEXT,
  root_cause TEXT,
  fishbone_categories JSONB,
  eight_d JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action plans (tasks)
CREATE TABLE public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  responsible UUID REFERENCES auth.users(id),
  due_date DATE,
  completion_date DATE,
  status task_status NOT NULL DEFAULT 'pendiente',
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plans_action ON public.action_plans(action_id);

-- Effectiveness verification
CREATE TABLE public.effectiveness_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL UNIQUE REFERENCES public.actions(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES auth.users(id),
  verification_date DATE,
  result verification_result,
  comments TEXT,
  recurrence BOOLEAN NOT NULL DEFAULT FALSE,
  close_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk matrix
CREATE TABLE public.risk_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL UNIQUE REFERENCES public.actions(id) ON DELETE CASCADE,
  probability INT NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
  risk_level INT GENERATED ALWAYS AS (probability * impact) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  activity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_actions_updated BEFORE UPDATE ON public.actions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'responsable');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.root_cause_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effectiveness_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_counters ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador'));

-- Roles policies
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'administrador'));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador'));

-- Actions policies (all authenticated can read; admin & responsable can write)
CREATE POLICY "actions_select_all" ON public.actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "actions_insert" ON public.actions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable'));
CREATE POLICY "actions_update" ON public.actions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable'));
CREATE POLICY "actions_delete" ON public.actions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrador'));

-- Same pattern for related tables
CREATE POLICY "rca_select" ON public.root_cause_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "rca_write" ON public.root_cause_analysis FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable')) WITH CHECK (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable'));

CREATE POLICY "plans_select" ON public.action_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_write" ON public.action_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable')) WITH CHECK (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable'));

CREATE POLICY "verif_select" ON public.effectiveness_verification FOR SELECT TO authenticated USING (true);
CREATE POLICY "verif_write" ON public.effectiveness_verification FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable')) WITH CHECK (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable'));

CREATE POLICY "risk_select" ON public.risk_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "risk_write" ON public.risk_matrix FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable')) WITH CHECK (public.has_role(auth.uid(),'administrador') OR public.has_role(auth.uid(),'responsable'));

CREATE POLICY "log_select" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "log_insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "counters_admin" ON public.code_counters FOR ALL TO authenticated USING (true) WITH CHECK (true);
