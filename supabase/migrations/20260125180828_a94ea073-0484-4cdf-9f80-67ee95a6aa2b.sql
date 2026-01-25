-- Create enum for finance types
CREATE TYPE public.finance_type AS ENUM ('income', 'expense');

-- Create enum for finance categories
CREATE TYPE public.finance_category AS ENUM (
  'Lazer', 
  'Alimentação', 
  'Despesa fixa', 
  'Despesa variável', 
  'Transporte', 
  'Saúde', 
  'Educação', 
  'Investimento',
  'Outros'
);

-- Create enum for health categories
CREATE TYPE public.health_category AS ENUM ('Agua', 'Treino', 'Sono', 'Peso');

-- Create enum for academic tags
CREATE TYPE public.academic_tag AS ENUM ('prova', 'trabalho', 'leitura', 'estudo');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create finances table
CREATE TABLE public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type finance_type NOT NULL,
  category finance_category NOT NULL DEFAULT 'Outros',
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create health table
CREATE TABLE public.health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category health_category NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  item TEXT,
  calendario TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create academic table
CREATE TABLE public.academic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doc_name TEXT NOT NULL,
  summary TEXT,
  tags academic_tag NOT NULL DEFAULT 'estudo',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create agendamento table
CREATE TABLE public.agendamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  google_event_id TEXT,
  lembrete_1h_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create access_tokens table for secure URL access
CREATE TABLE public.access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for finances
CREATE POLICY "Users can view own finances" ON public.finances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own finances" ON public.finances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own finances" ON public.finances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own finances" ON public.finances
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for health
CREATE POLICY "Users can view own health" ON public.health
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health" ON public.health
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health" ON public.health
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health" ON public.health
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for academic
CREATE POLICY "Users can view own academic" ON public.academic
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own academic" ON public.academic
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own academic" ON public.academic
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own academic" ON public.academic
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for agendamento
CREATE POLICY "Users can view own agendamento" ON public.agendamento
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agendamento" ON public.agendamento
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agendamento" ON public.agendamento
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agendamento" ON public.agendamento
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for access_tokens
CREATE POLICY "Users can view own tokens" ON public.access_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON public.access_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON public.access_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_finances_user_date ON public.finances(user_id, transaction_date);
CREATE INDEX idx_health_user_calendario ON public.health(user_id, calendario);
CREATE INDEX idx_academic_user_created ON public.academic(user_id, created_at);
CREATE INDEX idx_agendamento_user_start ON public.agendamento(user_id, start_time);
CREATE INDEX idx_access_tokens_token ON public.access_tokens(token);